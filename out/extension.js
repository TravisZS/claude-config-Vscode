"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const configManager_1 = require("./utils/configManager");
const webviewProvider_1 = require("./webview/webviewProvider");
const statusBarManager_1 = require("./utils/statusBarManager");
const profileTreeView_1 = require("./views/profileTreeView");
let configManager;
let webviewProvider;
let statusBarManager;
let treeDataProvider;
function activate(context) {
    console.log('Claude Configuration Manager is now active!');
    // Initialize core components
    configManager = new configManager_1.ConfigManager();
    webviewProvider = new webviewProvider_1.WebviewProvider(context, configManager);
    statusBarManager = new statusBarManager_1.StatusBarManager(configManager);
    treeDataProvider = new profileTreeView_1.ProfileTreeDataProvider(configManager);
    // Register tree view
    const treeView = vscode.window.createTreeView('claude-config-profiles', {
        treeDataProvider: treeDataProvider,
        showCollapseAll: false
    });
    context.subscriptions.push(treeView);
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
            treeDataProvider.refresh();
            vscode.window.showInformationMessage('Claude configuration status refreshed!');
        }),
        vscode.commands.registerCommand('claude-config.switchProfile', async (profileId) => {
            try {
                const success = configManager.switchProfile(profileId);
                if (success) {
                    const profile = configManager.getProfile(profileId);
                    statusBarManager.updateStatusBar();
                    treeDataProvider.refresh();
                    vscode.window.showInformationMessage(`Switched to profile: ${profile?.name}`);
                }
                else {
                    vscode.window.showErrorMessage('Failed to switch profile');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error switching profile: ${error}`);
            }
        }),
        vscode.commands.registerCommand('claude-config.deleteProfile', async (profileId) => {
            const profile = configManager.getProfile(profileId);
            if (!profile)
                return;
            const confirm = await vscode.window.showWarningMessage(`Are you sure you want to delete profile "${profile.name}"?`, 'Delete', 'Cancel');
            if (confirm === 'Delete') {
                try {
                    const success = configManager.deleteProfile(profileId);
                    if (success) {
                        statusBarManager.updateStatusBar();
                        treeDataProvider.refresh();
                        vscode.window.showInformationMessage(`Profile "${profile.name}" deleted successfully!`);
                    }
                    else {
                        vscode.window.showErrorMessage('Failed to delete profile.');
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Error deleting profile: ${error}`);
                }
            }
        })
    ];
    // Add all commands to subscriptions
    commands.forEach(command => context.subscriptions.push(command));
    // Add disposable components
    context.subscriptions.push(statusBarManager, webviewProvider);
    // Show welcome message on first activation
    const isFirstActivation = context.globalState.get('claude-config.firstActivation', true);
    if (isFirstActivation) {
        showWelcomeMessage();
        context.globalState.update('claude-config.firstActivation', false);
    }
}
exports.activate = activate;
function deactivate() {
    // Cleanup is handled by VS Code calling dispose on subscriptions
}
exports.deactivate = deactivate;
async function showQuickSwitchPicker() {
    try {
        const profiles = configManager.getAllProfiles();
        const activeProfile = configManager.getActiveProfile();
        if (profiles.length === 0) {
            const action = await vscode.window.showInformationMessage('No Claude profiles found. Would you like to create one?', 'Create Profile', 'Open Manager');
            if (action === 'Create Profile') {
                await showAddProfileInput();
            }
            else if (action === 'Open Manager') {
                webviewProvider.show();
            }
            return;
        }
        const quickPickItems = profiles.map(profile => ({
            label: profile.name,
            description: profile.id === activeProfile?.id ? '$(check) Active' : '',
            detail: `${profile.baseUrl} • ${profile.apiKey ? 'API Key set' : 'No API Key'}`,
            profile: profile
        }));
        // Add special actions
        quickPickItems.push({ kind: vscode.QuickPickItemKind.Separator, label: 'Actions' }, {
            label: '$(add) Add New Profile',
            description: 'Create a new configuration profile',
            action: 'add'
        }, {
            label: '$(gear) Open Configuration Manager',
            description: 'Open the full configuration interface',
            action: 'manager'
        });
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a Claude configuration profile',
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (!selected)
            return;
        // Handle special actions
        if (selected.action === 'add') {
            await showAddProfileInput();
            return;
        }
        if (selected.action === 'manager') {
            webviewProvider.show();
            return;
        }
        // Handle profile selection
        const profile = selected.profile;
        if (profile && profile.id !== activeProfile?.id) {
            const success = configManager.switchProfile(profile.id);
            if (success) {
                statusBarManager.updateStatusBar();
                treeDataProvider.refresh();
                vscode.window.showInformationMessage(`Switched to profile: ${profile.name}`);
            }
            else {
                vscode.window.showErrorMessage('Failed to switch profile');
            }
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error in quick switch: ${error}`);
    }
}
async function showAddProfileInput() {
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
        if (!name)
            return;
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
        if (!apiKey)
            return;
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
                }
                catch {
                    return 'Please enter a valid URL';
                }
            }
        });
        if (!baseUrl)
            return;
        // Ask about traffic control
        const disableTraffic = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Disable non-essential traffic?',
            ignoreFocusOut: true
        });
        if (!disableTraffic)
            return;
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
        treeDataProvider.refresh();
        // Ask if user wants to switch to the new profile
        const switchNow = await vscode.window.showInformationMessage(`Profile "${newProfile.name}" created successfully! Switch to it now?`, 'Switch Now', 'Keep Current');
        if (switchNow === 'Switch Now') {
            configManager.switchProfile(newProfile.id);
            statusBarManager.updateStatusBar();
            treeDataProvider.refresh();
            vscode.window.showInformationMessage(`Switched to profile: ${newProfile.name}`);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error creating profile: ${error}`);
    }
}
async function showWelcomeMessage() {
    const action = await vscode.window.showInformationMessage('Welcome to Claude Configuration Manager! This extension helps you manage multiple Claude API configurations.', 'Open Manager', 'Quick Setup', 'Later');
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
//# sourceMappingURL=extension.js.map