import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ClaudeConfigData, ClaudeProfile, ClaudeSettings } from '../types';

export class ConfigManager {
    private static readonly CONFIG_DIR = path.join(os.homedir(), '.claude');
    private static readonly CONFIG_FILE = path.join(this.CONFIG_DIR, 'claude-config.json');
    private static readonly SETTINGS_FILE = path.join(this.CONFIG_DIR, 'settings.json');

    private configData: ClaudeConfigData = {
        profiles: {},
        activeProfile: null,
        version: '1.0.0'
    };

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        try {
            if (fs.existsSync(ConfigManager.CONFIG_FILE)) {
                const rawData = fs.readFileSync(ConfigManager.CONFIG_FILE, 'utf8');
                this.configData = JSON.parse(rawData);
            } else {
                this.initializeDefaultConfig();
            }
        } catch (error) {
            console.error('Error loading config:', error);
            this.initializeDefaultConfig();
        }
    }

    private initializeDefaultConfig(): void {
        const defaultProfile: ClaudeProfile = {
            id: 'default',
            name: 'Default Profile',
            apiKey: '',
            baseUrl: 'https://api.anthropic.com',
            disableNonEssentialTraffic: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.configData = {
            profiles: { default: defaultProfile },
            activeProfile: 'default',
            version: '1.0.0'
        };

        this.saveConfig();
    }

    private saveConfig(): void {
        try {
            if (!fs.existsSync(ConfigManager.CONFIG_DIR)) {
                fs.mkdirSync(ConfigManager.CONFIG_DIR, { recursive: true });
            }
            fs.writeFileSync(ConfigManager.CONFIG_FILE, JSON.stringify(this.configData, null, 2));
        } catch (error) {
            console.error('Error saving config:', error);
            throw new Error(`Failed to save configuration: ${error}`);
        }
    }

    public getAllProfiles(): ClaudeProfile[] {
        return Object.values(this.configData.profiles);
    }

    public getProfile(id: string): ClaudeProfile | undefined {
        return this.configData.profiles[id];
    }

    public getActiveProfile(): ClaudeProfile | null {
        if (!this.configData.activeProfile) {
            return null;
        }
        return this.configData.profiles[this.configData.activeProfile] || null;
    }

    public addProfile(profile: Omit<ClaudeProfile, 'id' | 'createdAt' | 'updatedAt'>): ClaudeProfile {
        const id = this.generateProfileId(profile.name);
        const newProfile: ClaudeProfile = {
            ...profile,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.configData.profiles[id] = newProfile;
        this.saveConfig();
        return newProfile;
    }

    public updateProfile(id: string, updates: Partial<Omit<ClaudeProfile, 'id' | 'createdAt'>>): boolean {
        if (!this.configData.profiles[id]) {
            return false;
        }

        this.configData.profiles[id] = {
            ...this.configData.profiles[id],
            ...updates,
            updatedAt: new Date()
        };

        this.saveConfig();
        return true;
    }

    public deleteProfile(id: string): boolean {
        if (!this.configData.profiles[id]) {
            return false;
        }

        // 获取所有配置的数量
        const profileCount = Object.keys(this.configData.profiles).length;
        
        // 如果只有一个配置，不允许删除（无论是否为 default）
        if (profileCount <= 1) {
            return false;
        }

        delete this.configData.profiles[id];

        // 如果删除的是当前活跃配置，需要切换到其他配置
        if (this.configData.activeProfile === id) {
            // 优先选择 default，如果 default 被删除了，选择第一个可用的配置
            const remainingProfiles = Object.keys(this.configData.profiles);
            this.configData.activeProfile = remainingProfiles.includes('default') 
                ? 'default' 
                : remainingProfiles[0];
        }

        this.saveConfig();
        return true;
    }

    public switchProfile(id: string): boolean {
        if (!this.configData.profiles[id]) {
            return false;
        }

        this.configData.activeProfile = id;
        this.saveConfig();
        this.updateClaudeSettings(this.configData.profiles[id]);
        return true;
    }

    private updateClaudeSettings(profile: ClaudeProfile): void {
        try {
            let existingSettings: ClaudeSettings = {
                env: {
                    ANTHROPIC_AUTH_TOKEN: '',
                    ANTHROPIC_BASE_URL: ''
                },
                permissions: {
                    allow: [],
                    deny: []
                }
            };

            if (fs.existsSync(ConfigManager.SETTINGS_FILE)) {
                const rawSettings = fs.readFileSync(ConfigManager.SETTINGS_FILE, 'utf8');
                existingSettings = { ...existingSettings, ...JSON.parse(rawSettings) };
            }

            const updatedSettings: ClaudeSettings = {
                ...existingSettings,
                env: {
                    ...existingSettings.env,
                    ANTHROPIC_AUTH_TOKEN: profile.apiKey,
                    ANTHROPIC_BASE_URL: profile.baseUrl,
                    ...(profile.disableNonEssentialTraffic !== undefined && {
                        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: profile.disableNonEssentialTraffic ? 1 : 0
                    })
                },
                apiKeyHelper: `echo '${profile.apiKey}'`
            };

            fs.writeFileSync(ConfigManager.SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
        } catch (error) {
            console.error('Error updating Claude settings:', error);
            throw new Error(`Failed to update Claude settings: ${error}`);
        }
    }

    private generateProfileId(name: string): string {
        const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let id = baseId;
        let counter = 1;

        while (this.configData.profiles[id]) {
            id = `${baseId}-${counter}`;
            counter++;
        }

        return id;
    }

    public validateProfile(profile: Partial<ClaudeProfile>): string[] {
        const errors: string[] = [];

        if (!profile.name || profile.name.trim().length === 0) {
            errors.push('Profile name is required');
        }

        if (!profile.apiKey || profile.apiKey.trim().length === 0) {
            errors.push('API key is required');
        }

        if (!profile.baseUrl || profile.baseUrl.trim().length === 0) {
            errors.push('Base URL is required');
        } else if (!this.isValidUrl(profile.baseUrl)) {
            errors.push('Base URL must be a valid URL');
        }

        return errors;
    }

    private isValidUrl(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    public exportConfig(): string {
        return JSON.stringify(this.configData, null, 2);
    }

    public importConfig(configJson: string): boolean {
        try {
            const importedConfig = JSON.parse(configJson);
            
            if (this.isValidConfigStructure(importedConfig)) {
                this.configData = importedConfig;
                this.saveConfig();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing config:', error);
            return false;
        }
    }

    private isValidConfigStructure(config: any): boolean {
        return (
            typeof config === 'object' &&
            config.profiles &&
            typeof config.profiles === 'object' &&
            typeof config.activeProfile === 'string' &&
            typeof config.version === 'string'
        );
    }
}