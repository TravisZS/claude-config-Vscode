import * as vscode from 'vscode';
import { ConfigManager } from './utils/configManager';
import { WebviewProvider } from './webview/webviewProvider';
import { StatusBarManager } from './utils/statusBarManager';

let configManager: ConfigManager;
let webviewProvider: WebviewProvider;
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude Configuration Manager is now active!');
    
    // Initialize core components
    configManager = new ConfigManager();
    webviewProvider = new WebviewProvider(context, configManager);
    statusBarManager = new StatusBarManager(configManager);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('claude-config.openManager', () => {
            webviewProvider.show();
        }),

        vscode.commands.registerCommand('claude-config.quickSwitch', async () => {
            await showQuickSwitchPicker();
        }),

        vscode.commands.registerCommand('claude-config.addProfile', async () => {
            await showAddProfileInput();
        }),

        vscode.commands.registerCommand('claude-config.refreshStatus', () => {
            statusBarManager.updateStatusBar();
            vscode.window.showInformationMessage('Claude configuration status refreshed!');
        })
    ];

    // Add all commands to subscriptions
    commands.forEach(command => context.subscriptions.push(command));

    // Add disposable components
    context.subscriptions.push(
        statusBarManager,
        webviewProvider
    );

    // Show welcome message on first activation
    const isFirstActivation = context.globalState.get('claude-config.firstActivation', true);
    if (isFirstActivation) {
        showWelcomeMessage();
        context.globalState.update('claude-config.firstActivation', false);
    }
}

export function deactivate() {
    // Cleanup is handled by VS Code calling dispose on subscriptions
}

async function showQuickSwitchPicker(): Promise<void> {
    try {
        const profiles = configManager.getAllProfiles();
        const activeProfile = configManager.getActiveProfile();

        if (profiles.length === 0) {
            const action = await vscode.window.showInformationMessage(
                'No Claude profiles found. Would you like to create one?',
                'Create Profile',
                'Open Manager'
            );

            if (action === 'Create Profile') {
                await showAddProfileInput();
            } else if (action === 'Open Manager') {
                webviewProvider.show();
            }
            return;
        }

        const quickPickItems: vscode.QuickPickItem[] = profiles.map(profile => ({
            label: profile.name,
            description: profile.id === activeProfile?.id ? '$(check) Active' : '',
            detail: `${profile.baseUrl} • ${profile.apiKey ? 'API Key set' : 'No API Key'}`,
            profile: profile
        } as any));

        // Add special actions
        quickPickItems.push(
            { kind: vscode.QuickPickItemKind.Separator, label: 'Actions' },
            {
                label: '$(add) Add New Profile',
                description: 'Create a new configuration profile',
                action: 'add'
            } as any,
            {
                label: '$(gear) Open Configuration Manager',
                description: 'Open the full configuration interface',
                action: 'manager'
            } as any
        );

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a Claude configuration profile',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) return;

        // Handle special actions
        if ((selected as any).action === 'add') {
            await showAddProfileInput();
            return;
        }
        
        if ((selected as any).action === 'manager') {
            webviewProvider.show();
            return;
        }

        // Handle profile selection
        const profile = (selected as any).profile;
        if (profile && profile.id !== activeProfile?.id) {
            const success = configManager.switchProfile(profile.id);
            if (success) {
                statusBarManager.updateStatusBar();
                vscode.window.showInformationMessage(`Switched to profile: ${profile.name}`);
            } else {
                vscode.window.showErrorMessage('Failed to switch profile');
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error in quick switch: ${error}`);
    }
}

async function showAddProfileInput(): Promise<void> {
    try {
        // Get profile name
        const name = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new profile',
            placeHolder: 'e.g., Work, Personal, Development',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Profile name is required';
                }
                const profiles = configManager.getAllProfiles();
                if (profiles.some(p => p.name.toLowerCase() === value.trim().toLowerCase())) {
                    return 'A profile with this name already exists';
                }
                return null;
            }
        });

        if (!name) return;

        // Get API key
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Claude API key',
            placeHolder: 'sk-ant-...',
            password: true,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'API key is required';
                }
                if (value.length < 10) {
                    return 'API key seems too short';
                }
                return null;
            }
        });

        if (!apiKey) return;

        // Get base URL
        const baseUrl = await vscode.window.showInputBox({
            prompt: 'Enter the base URL (or press Enter for default)',
            placeHolder: 'https://api.anthropic.com',
            value: 'https://api.anthropic.com',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Base URL is required';
                }
                try {
                    new URL(value);
                    return null;
                } catch {
                    return 'Please enter a valid URL';
                }
            }
        });

        if (!baseUrl) return;

        // Ask about traffic control
        const disableTraffic = await vscode.window.showQuickPick(
            ['Yes', 'No'],
            {
                placeHolder: 'Disable non-essential traffic?',
                ignoreFocusOut: true
            }
        );

        if (!disableTraffic) return;

        // Create the profile
        const profileData = {
            name: name.trim(),
            apiKey: apiKey.trim(),
            baseUrl: baseUrl.trim(),
            disableNonEssentialTraffic: disableTraffic === 'Yes'
        };

        const errors = configManager.validateProfile(profileData);
        if (errors.length > 0) {
            vscode.window.showErrorMessage(`Validation failed: ${errors.join(', ')}`);
            return;
        }

        const newProfile = configManager.addProfile(profileData);
        
        // Ask if user wants to switch to the new profile
        const switchNow = await vscode.window.showInformationMessage(
            `Profile "${newProfile.name}" created successfully! Switch to it now?`,
            'Switch Now',
            'Keep Current'
        );

        if (switchNow === 'Switch Now') {
            configManager.switchProfile(newProfile.id);
            statusBarManager.updateStatusBar();
            vscode.window.showInformationMessage(`Switched to profile: ${newProfile.name}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating profile: ${error}`);
    }
}

async function showWelcomeMessage(): Promise<void> {
    const action = await vscode.window.showInformationMessage(
        'Welcome to Claude Configuration Manager! This extension helps you manage multiple Claude API configurations.',
        'Open Manager',
        'Quick Setup',
        'Later'
    );

    switch (action) {
        case 'Open Manager':
            webviewProvider.show();
            break;
        case 'Quick Setup':
            await showAddProfileInput();
            break;
        // 'Later' or no selection - do nothing
    }
}