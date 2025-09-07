"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileTreeDataProvider = void 0;
const vscode = require("vscode");
class ProfileTreeDataProvider {
    constructor(configManager) {
        this.configManager = configManager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // 根级别 - 返回所有配置文件
            const profiles = this.configManager.getAllProfiles();
            const activeProfile = this.configManager.getActiveProfile();
            return Promise.resolve(profiles.map(profile => {
                const isActive = profile.id === activeProfile?.id;
                const item = new ProfileTreeItem(profile.name, profile, vscode.TreeItemCollapsibleState.Collapsed, 'profile');
                // 设置图标和状态
                item.iconPath = new vscode.ThemeIcon(isActive ? 'circle-filled' : 'circle-outline');
                item.description = isActive ? 'Active' : '';
                // 工具提示
                item.tooltip = `Profile: ${profile.name}\nAPI Key: ${this.maskApiKey(profile.apiKey)}\nBase URL: ${profile.baseUrl}\nStatus: ${isActive ? 'Active' : 'Inactive'}`;
                return item;
            }));
        }
        else if (element.contextValue === 'profile') {
            // 配置文件的子项 - 显示操作按钮
            const profile = element.profile;
            const activeProfile = this.configManager.getActiveProfile();
            const isActive = profile.id === activeProfile?.id;
            const actions = [];
            // API Key 显示
            actions.push(new ProfileTreeItem(`API Key: ${this.maskApiKey(profile.apiKey)}`, undefined, vscode.TreeItemCollapsibleState.None, 'info'));
            // Base URL 显示
            actions.push(new ProfileTreeItem(`URL: ${profile.baseUrl}`, undefined, vscode.TreeItemCollapsibleState.None, 'info'));
            // 操作按钮
            if (!isActive) {
                const switchItem = new ProfileTreeItem('$(check) Switch', profile, vscode.TreeItemCollapsibleState.None, 'action-switch');
                switchItem.command = {
                    command: 'claude-config.switchProfile',
                    title: 'Switch Profile',
                    arguments: [profile.id]
                };
                actions.push(switchItem);
            }
            const editItem = new ProfileTreeItem('$(gear) Open', profile, vscode.TreeItemCollapsibleState.None, 'action-edit');
            editItem.command = {
                command: 'claude-config.openManager',
                title: 'Edit Profile',
                arguments: []
            };
            actions.push(editItem);
            // 只有多个配置时才显示删除按钮
            const allProfiles = this.configManager.getAllProfiles();
            if (allProfiles.length > 1) {
                const deleteItem = new ProfileTreeItem('$(trash) Delete', profile, vscode.TreeItemCollapsibleState.None, 'action-delete');
                deleteItem.command = {
                    command: 'claude-config.deleteProfile',
                    title: 'Delete Profile',
                    arguments: [profile.id]
                };
                actions.push(deleteItem);
            }
            return Promise.resolve(actions);
        }
        return Promise.resolve([]);
    }
    maskApiKey(apiKey) {
        if (!apiKey || apiKey.length < 8) {
            return 'Not set';
        }
        return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    }
}
exports.ProfileTreeDataProvider = ProfileTreeDataProvider;
class ProfileTreeItem extends vscode.TreeItem {
    constructor(label, profile, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.profile = profile;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.contextValue = contextValue;
        // 为不同类型的项设置样式
        if (contextValue === 'info') {
            this.iconPath = new vscode.ThemeIcon('info');
        }
        else if (contextValue === 'action-switch') {
            this.iconPath = new vscode.ThemeIcon('arrow-swap');
        }
        else if (contextValue === 'action-edit') {
            this.iconPath = new vscode.ThemeIcon('edit');
        }
        else if (contextValue === 'action-delete') {
            this.iconPath = new vscode.ThemeIcon('trash');
        }
    }
}
//# sourceMappingURL=profileTreeView.js.map