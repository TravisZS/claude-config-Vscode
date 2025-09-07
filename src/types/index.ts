export interface ClaudeProfile {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  disableNonEssentialTraffic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaudeConfigData {
  profiles: { [key: string]: ClaudeProfile };
  activeProfile: string | null;
  version: string;
}

export interface ClaudeSettings {
  env: {
    ANTHROPIC_AUTH_TOKEN: string;
    ANTHROPIC_BASE_URL: string;
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC?: number;
  };
  permissions: {
    allow: string[];
    deny: string[];
  };
  apiKeyHelper?: string;
}

export interface StatusBarItem {
  text: string;
  tooltip: string;
  command?: string;
}