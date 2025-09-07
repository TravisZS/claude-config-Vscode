import * as vscode from 'vscode';
import { ConfigManager } from '../utils/configManager';
import { ClaudeProfile } from '../types';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private configManager: ConfigManager;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        this.statusBarItem.command = 'claude-config.quickSwitch';
        this.initialize();
    }

    private initialize(): void {
        this.updateStatusBar();
        this.statusBarItem.show();
    }

    public updateStatusBar(): void {
        const activeProfile = this.configManager.getActiveProfile();
        
        if (activeProfile) {
            this.statusBarItem.text = `$(gear) Claude: ${activeProfile.name}`;
            this.statusBarItem.tooltip = this.createTooltip(activeProfile);
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = `$(warning) Claude: No Profile`;
            this.statusBarItem.tooltip = 'No active Claude profile. Click to configure.';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    }

    private createTooltip(profile: ClaudeProfile): string {
        const maskedApiKey = profile.apiKey ? 
            profile.apiKey.substring(0, 8) + '...' + profile.apiKey.substring(profile.apiKey.length - 4) : 
            'Not set';

        return `Claude Configuration
Profile: ${profile.name}
API Key: ${maskedApiKey}
Base URL: ${profile.baseUrl}
Traffic Control: ${profile.disableNonEssentialTraffic ? 'Disabled' : 'Enabled'}

Click to switch profiles`;
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}