# Claude Config - Claude Configuration Manager

<p align="center">
  <img src="images/icon.png" alt="Claude Config" width="128" height="128">
</p>

<p align="center">
  <strong>A modern VS Code extension for managing Claude API configurations</strong>
</p>

<p align="center">
  <a href="https://github.com/TravisZS/claude-config-Vscode">
    <img src="https://img.shields.io/badge/GitHub-TravisZS%2Fclaude--config--Vscode-blue?logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/VS%20Code-v1.74+-007ACC?logo=visualstudiocode" alt="VS Code">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<p align="center">
  <a href="README.md">中文</a> | <strong>English</strong>
</p>

---

## ✨ Features

- 🎨 **Modern Interface** - Beautiful, responsive Webview interface that perfectly matches VS Code themes
- ⚡ **Quick Switching** - One-click profile switching via command palette or status bar
- 🔐 **Secure Storage** - Safe API key management in `~/.claude/claude-config.json`
- 📊 **Status Bar Display** - Real-time display of active configuration information
- 🔄 **Smart Management** - Add, edit, delete, and switch between multiple Claude profiles
- 📦 **Import/Export** - Backup and restore your configuration settings
- 🛡️ **Smart Protection** - Prevents deletion of the last configuration, ensuring there's always an available config
- 🗂️ **Sidebar Integration** - Dedicated sidebar view for easy profile management

## 📸 Interface Preview

### Configuration Management Interface
Modern configuration management interface supporting:
- View all configuration profiles
- One-click active profile switching
- Edit configuration information
- Delete unnecessary configurations

### Add New Configuration
Clean configuration addition interface:
- Custom configuration names
- Secure API key input (with show/hide toggle)
- Custom Base URL settings
- Traffic control options

### Sidebar View
Dedicated sidebar panel showing:
- All available profiles
- Active profile indicator
- Quick action buttons
- Profile status information

## 🚀 Quick Start

### Installation Methods

#### Method 1: Install from VSIX File
1. Download the latest `.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` to open command palette
4. Type `Extensions: Install from VSIX...`
5. Select the downloaded `.vsix` file

#### Method 2: Install from Source
```bash
git clone https://github.com/TravisZS/claude-config-Vscode.git
cd claude-config-Vscode
npm install
npm run compile
```

### First-time Use

1. **Welcome Guide**: A welcome message appears when first activating the extension
2. **Create Configuration**: Use command palette to run "Claude Config: Add New Profile"
3. **Start Using**: Click the Claude status in the status bar or use "Claude Config: Quick Switch Profile" to switch configurations

## 🛠️ Usage

### Command List

- `Claude Config: Open Configuration Manager` - Open the full configuration management interface
- `Claude Config: Quick Switch Profile` - Quick configuration switcher
- `Claude Config: Add New Profile` - Add a new configuration profile
- `Claude Config: Refresh Status` - Refresh status bar display

### Configuration Files

This extension uses two configuration files:

1. **`~/.claude/claude-config.json`** - Store multiple configuration profiles (managed by this extension)
2. **`~/.claude/settings.json`** - Claude Code's settings file (automatically updated when switching configurations)

### Profile Structure

Each configuration profile contains:
- **Name**: Display name for the configuration
- **API Key**: Your Claude API key
- **Base URL**: API endpoint address (default: https://api.anthropic.com)
- **Traffic Control**: Option to disable non-essential traffic

## 🎯 Sidebar Features

The extension adds a dedicated sidebar view with:
- **Profile List**: Shows all available configurations
- **Active Indicator**: Clearly marks the currently active profile
- **Quick Actions**: Add, refresh, and manage profiles directly from sidebar
- **Context Menu**: Right-click profiles for additional options
- **Real-time Updates**: Automatically refreshes when profiles change

## 🔧 Development

### Build Project

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch file changes
npm run watch
```

### Project Structure

```
src/
├── extension.ts              # Extension entry point
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── configManager.ts     # Configuration data management
│   └── statusBarManager.ts  # Status bar integration
├── views/
│   └── profileTreeView.ts   # Sidebar tree view
└── webview/
    └── webviewProvider.ts   # Webview interface management
media/
├── webview.css              # Webview styling
└── webview.js              # Webview JavaScript logic
```

## 📦 Package & Release

### Create VSIX Package

```bash
# Install vsce tool
npm install -g vsce

# Create VSIX package
vsce package
```

### Publish to Marketplace

```bash
# Publish to VS Code Marketplace
vsce publish
```

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📝 Changelog

### v0.0.1
- ✨ Initial release
- 🎨 Modern configuration management interface
- ⚡ Quick configuration switching functionality
- 🔐 Secure API key management
- 📊 Status bar integration
- 📦 Configuration import/export functionality
- 🗂️ Sidebar tree view integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to [Anthropic](https://www.anthropic.com/) for providing the powerful Claude API
- Thanks to the VS Code team for providing excellent extension development framework
- Thanks to all contributors and users for their support

---

<p align="center">
  If this extension helps you, please give it a ⭐ to show your support!
</p>

<p align="center">
  <a href="https://github.com/TravisZS/claude-config-Vscode/issues">Report Issues</a> •
  <a href="https://github.com/TravisZS/claude-config-Vscode/discussions">Discussions</a> •
  <a href="https://github.com/TravisZS">Follow Author</a>
</p>