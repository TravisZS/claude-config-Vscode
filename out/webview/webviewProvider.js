"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
const vscode = require("vscode");
class WebviewProvider {
    constructor(context, configManager) {
        this.context = context;
        this.configManager = configManager;
    }
    show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel(WebviewProvider.viewType, 'Claude Config', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media')
            ]
        });
        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageHandling();
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
        this.sendProfilesToWebview();
    }
    getWebviewContent() {
        const scriptUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview.js'));
        const styleUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview.css'));
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Claude Configuration Manager</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <h1>
                        <span class="icon">⚙️</span>
                        Claude Config
                    </h1>
                    <div class="header-actions">
                        <button id="addProfile" class="btn btn-primary">
                            <span class="icon">➕</span>
                            Add Profile
                        </button>
                        <button id="refreshProfiles" class="btn btn-secondary">
                            <span class="icon">🔄</span>
                            Refresh
                        </button>
                    </div>
                </header>

                <div class="status-bar">
                    <span id="activeProfileStatus" class="status-text"></span>
                    <span id="profileCount" class="profile-count"></span>
                </div>

                <div class="profiles-container">
                    <div id="profilesList" class="profiles-list">
                        <div class="loading">Loading profiles...</div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Profile Modal -->
            <div id="profileModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modalTitle">Add New Profile</h2>
                        <button id="closeModal" class="close-btn">&times;</button>
                    </div>
                    <form id="profileForm">
                        <div class="form-group">
                            <label for="profileName">Profile Name</label>
                            <input type="text" id="profileName" name="profileName" required placeholder="Enter profile name">
                        </div>
                        <div class="form-group">
                            <label for="apiKey">API Key</label>
                            <input type="password" id="apiKey" name="apiKey" required placeholder="Enter your Claude API key">
                            <button type="button" id="toggleApiKey" class="toggle-password">🙈</button>
                        </div>
                        <div class="form-group">
                            <label for="baseUrl">Base URL</label>
                            <input type="url" id="baseUrl" name="baseUrl" required placeholder="https://api.anthropic.com">
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="disableNonEssentialTraffic" name="disableNonEssentialTraffic" checked>
                                <span class="checkmark"></span>
                                Disable Non-Essential Traffic
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancelForm" class="btn btn-secondary">Cancel</button>
                            <button type="submit" id="saveProfile" class="btn btn-primary">Save Profile</button>
                        </div>
                    </form>
                </div>
            </div>

            <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
    setupMessageHandling() {
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'getProfiles':
                    this.sendProfilesToWebview();
                    break;
                case 'switchProfile':
                    await this.handleSwitchProfile(message.profileId);
                    break;
                case 'addProfile':
                    await this.handleAddProfile(message.profile);
                    break;
                case 'updateProfile':
                    await this.handleUpdateProfile(message.profileId, message.profile);
                    break;
                case 'deleteProfile':
                    await this.handleDeleteProfile(message.profileId);
                    break;
                case 'exportConfig':
                    await this.handleExportConfig();
                    break;
                case 'importConfig':
                    await this.handleImportConfig();
                    break;
            }
        });
    }
    sendProfilesToWebview() {
        if (!this.panel)
            return;
        const profiles = this.configManager.getAllProfiles();
        const activeProfile = this.configManager.getActiveProfile();
        this.panel.webview.postMessage({
            type: 'profilesData',
            profiles: profiles,
            activeProfileId: activeProfile?.id || null
        });
    }
    async handleSwitchProfile(profileId) {
        try {
            const success = this.configManager.switchProfile(profileId);
            if (success) {
                this.sendProfilesToWebview();
                vscode.window.showInformationMessage('Profile switched successfully!');
            }
            else {
                vscode.window.showErrorMessage('Failed to switch profile.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error switching profile: ${error}`);
        }
    }
    async handleAddProfile(profileData) {
        try {
            console.log('Received profile data for creation:', profileData);
            const errors = this.configManager.validateProfile(profileData);
            if (errors.length > 0) {
                console.log('Validation errors:', errors);
                this.panel.webview.postMessage({
                    type: 'validationError',
                    errors: errors
                });
                return;
            }
            console.log('Creating profile...');
            const newProfile = this.configManager.addProfile(profileData);
            console.log('Profile created:', newProfile);
            this.sendProfilesToWebview();
            vscode.window.showInformationMessage(`Profile "${newProfile.name}" created successfully!`);
        }
        catch (error) {
            console.error('Error creating profile:', error);
            vscode.window.showErrorMessage(`Error creating profile: ${error}`);
        }
    }
    async handleUpdateProfile(profileId, profileData) {
        try {
            const errors = this.configManager.validateProfile(profileData);
            if (errors.length > 0) {
                this.panel.webview.postMessage({
                    type: 'validationError',
                    errors: errors
                });
                return;
            }
            const success = this.configManager.updateProfile(profileId, profileData);
            if (success) {
                this.sendProfilesToWebview();
                vscode.window.showInformationMessage('Profile updated successfully!');
            }
            else {
                vscode.window.showErrorMessage('Failed to update profile.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error updating profile: ${error}`);
        }
    }
    async handleDeleteProfile(profileId) {
        const profile = this.configManager.getProfile(profileId);
        if (!profile)
            return;
        // 检查是否可以删除
        const allProfiles = this.configManager.getAllProfiles();
        if (allProfiles.length <= 1) {
            vscode.window.showWarningMessage('Cannot delete the last remaining profile. You must have at least one configuration.');
            return;
        }
        const confirm = await vscode.window.showWarningMessage(`Are you sure you want to delete profile "${profile.name}"?`, 'Delete', 'Cancel');
        if (confirm === 'Delete') {
            try {
                const success = this.configManager.deleteProfile(profileId);
                if (success) {
                    this.sendProfilesToWebview();
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
    }
    async handleExportConfig() {
        try {
            const configJson = this.configManager.exportConfig();
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('claude-config-backup.json'),
                filters: {
                    'JSON Files': ['json']
                }
            });
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(configJson));
                vscode.window.showInformationMessage('Configuration exported successfully!');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error exporting configuration: ${error}`);
        }
    }
    async handleImportConfig() {
        try {
            const uri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Files': ['json']
                }
            });
            if (uri && uri[0]) {
                const configData = await vscode.workspace.fs.readFile(uri[0]);
                const configJson = Buffer.from(configData).toString('utf8');
                const success = this.configManager.importConfig(configJson);
                if (success) {
                    this.sendProfilesToWebview();
                    vscode.window.showInformationMessage('Configuration imported successfully!');
                }
                else {
                    vscode.window.showErrorMessage('Invalid configuration file format.');
                }
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error importing configuration: ${error}`);
        }
    }
    dispose() {
        if (this.panel) {
            this.panel.dispose();
        }
    }
}
exports.WebviewProvider = WebviewProvider;
WebviewProvider.viewType = 'claude-config-manager';
//# sourceMappingURL=webviewProvider.js.map