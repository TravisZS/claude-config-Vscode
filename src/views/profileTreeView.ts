import * as vscode from 'vscode';
import { ConfigManager } from '../utils/configManager';
import { ClaudeProfile } from '../types';

export class ProfileTreeDataProvider implements vscode.TreeDataProvider<ProfileTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProfileTreeItem | undefined | null | void> = new vscode.EventEmitter<ProfileTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProfileTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private configManager: ConfigManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProfileTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ProfileTreeItem): Thenable<ProfileTreeItem[]> {
        if (!element) {
            // 根级别 - 返回所有配置文件
            const profiles = this.configManager.getAllProfiles();
            const activeProfile = this.configManager.getActiveProfile();
            
            return Promise.resolve(profiles.map(profile => {
                const isActive = profile.id === activeProfile?.id;
                const item = new ProfileTreeItem(
                    profile.name,
                    profile,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'profile'
                );
                
                // 设置图标和状态
                item.iconPath = new vscode.ThemeIcon(isActive ? 'circle-filled' : 'circle-outline');
                item.description = isActive ? 'Active' : '';
                
                // 工具提示
                item.tooltip = `Profile: ${profile.name}\nAPI Key: ${this.maskApiKey(profile.apiKey)}\nBase URL: ${profile.baseUrl}\nStatus: ${isActive ? 'Active' : 'Inactive'}`;

                return item;
            }));
        } else if (element.contextValue === 'profile') {
            // 配置文件的子项 - 显示操作按钮
            const profile = element.profile!;
            const activeProfile = this.configManager.getActiveProfile();
            const isActive = profile.id === activeProfile?.id;
            
            const actions: ProfileTreeItem[] = [];
            
            // API Key 显示
            actions.push(new ProfileTreeItem(
                `API Key: ${this.maskApiKey(profile.apiKey)}`,
                undefined,
                vscode.TreeItemCollapsibleState.None,
                'info'
            ));
            
            // Base URL 显示
            actions.push(new ProfileTreeItem(
                `URL: ${profile.baseUrl}`,
                undefined,
                vscode.TreeItemCollapsibleState.None,
                'info'
            ));
            
            // 操作按钮
            if (!isActive) {
                const switchItem = new ProfileTreeItem(
                    '🔄 Switch to this profile',
                    profile,
                    vscode.TreeItemCollapsibleState.None,
                    'action-switch'
                );
                switchItem.command = {
                    command: 'claude-config.switchProfile',
                    title: 'Switch Profile',
                    arguments: [profile.id]
                };
                actions.push(switchItem);
            }
            
            const editItem = new ProfileTreeItem(
                '✏️ Edit profile',
                profile,
                vscode.TreeItemCollapsibleState.None,
                'action-edit'
            );
            editItem.command = {
                command: 'claude-config.openManager',
                title: 'Edit Profile',
                arguments: []
            };
            actions.push(editItem);
            
            // 只有多个配置时才显示删除按钮
            const allProfiles = this.configManager.getAllProfiles();
            if (allProfiles.length > 1) {
                const deleteItem = new ProfileTreeItem(
                    '🗑️ Delete profile',
                    profile,
                    vscode.TreeItemCollapsibleState.None,
                    'action-delete'
                );
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

    private maskApiKey(apiKey: string): string {
        if (!apiKey || apiKey.length < 8) {
            return 'Not set';
        }
        return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    }
}

class ProfileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly profile?: ClaudeProfile,
        public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        
        // 为不同类型的项设置样式
        if (contextValue === 'info') {
            this.iconPath = new vscode.ThemeIcon('info');
        } else if (contextValue === 'action-switch') {
            this.iconPath = new vscode.ThemeIcon('arrow-swap');
        } else if (contextValue === 'action-edit') {
            this.iconPath = new vscode.ThemeIcon('edit');
        } else if (contextValue === 'action-delete') {
            this.iconPath = new vscode.ThemeIcon('trash');
        }
    }
}