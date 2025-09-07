# Claude Configuration Manager

A modern VS Code extension for managing Claude API configurations with beautiful UI and seamless profile switching.

## Features

- 🎨 **Modern Interface**: Beautiful, responsive webview interface that matches VS Code themes
- ⚡ **Quick Switching**: Fast profile switching via command palette or status bar
- 🔐 **Secure Storage**: Safe API key management in `~/.claude/claude-config.json`
- 📊 **Status Bar**: Real-time display of active configuration
- 🔄 **Easy Management**: Add, edit, delete, and switch between multiple Claude profiles
- 📦 **Import/Export**: Backup and restore your configurations

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Open in VS Code and press F5 to run the extension
4. The extension will be available in the Extension Development Host

## Usage

### Quick Start

1. **First Time Setup**: When you first activate the extension, you'll see a welcome message
2. **Add Profile**: Use the command palette (`Cmd+Shift+P`) and run "Claude Config: Add New Profile"
3. **Switch Profiles**: Click the Claude status in the status bar or use "Claude Config: Quick Switch Profile"

### Commands

- `Claude Config: Open Configuration Manager` - Opens the full management interface
- `Claude Config: Quick Switch Profile` - Quick profile switcher
- `Claude Config: Add New Profile` - Add a new configuration profile
- `Claude Config: Refresh Status` - Refresh the status bar display

### Configuration Files

The extension uses two configuration files:

1. **`~/.claude/claude-config.json`** - Stores multiple profile configurations (managed by this extension)
2. **`~/.claude/settings.json`** - Claude Code's settings file (automatically updated when switching profiles)

### Profile Structure

Each profile contains:
- **Name**: Display name for the profile
- **API Key**: Your Claude API key
- **Base URL**: API endpoint (default: https://api.anthropic.com)
- **Traffic Control**: Option to disable non-essential traffic

## Development

### Building

```bash
npm run compile
```

### Watching for Changes

```bash
npm run watch
```

### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── configManager.ts     # Configuration data management
│   └── statusBarManager.ts  # Status bar integration
└── webview/
    └── webviewProvider.ts   # Webview interface management
media/
├── webview.css              # Webview styling
└── webview.js              # Webview JavaScript logic
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.