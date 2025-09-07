"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarManager = void 0;
const vscode = require("vscode");
class StatusBarManager {
    constructor(configManager) {
        this.configManager = configManager;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'claude-config.quickSwitch';
        this.initialize();
    }
    initialize() {
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    updateStatusBar() {
        const activeProfile = this.configManager.getActiveProfile();
        if (activeProfile) {
            this.statusBarItem.text = `$(gear) Claude: ${activeProfile.name}`;
            this.statusBarItem.tooltip = this.createTooltip(activeProfile);
            this.statusBarItem.backgroundColor = undefined;
        }
        else {
            this.statusBarItem.text = `$(warning) Claude: No Profile`;
            this.statusBarItem.tooltip = 'No active Claude profile. Click to configure.';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    }
    createTooltip(profile) {
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
    show() {
        this.statusBarItem.show();
    }
    hide() {
        this.statusBarItem.hide();
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBarManager.js.map