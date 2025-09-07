# Claude Config - Claude 配置管理器

<p align="center">
  <img src="images/icon.png" alt="Claude Config" width="128" height="128">
</p>

<p align="center">
  <strong>一个现代化的 VS Code 扩展，用于管理 Claude API 配置</strong>
</p>

<p align="center">
  <a href="https://github.com/TravisZS/claude-config-Vscode">
    <img src="https://img.shields.io/badge/GitHub-TravisZS%2Fclaude--config--Vscode-blue?logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/VS%20Code-v1.74+-007ACC?logo=visualstudiocode" alt="VS Code">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<p align="center">
  <strong>中文</strong> | <a href="README.en.md">English</a>
</p>

---

## ✨ 功能特性

- 🎨 **现代化界面** - 美观的响应式 Webview 界面，完美适配 VS Code 主题
- ⚡ **快速切换** - 通过命令面板或状态栏一键切换配置
- 🔐 **安全存储** - 在 `~/.claude/claude-config.json` 中安全管理 API 密钥
- 📊 **状态栏显示** - 实时显示当前活跃的配置信息
- 🔄 **智能管理** - 添加、编辑、删除和切换多个 Claude 配置档案
- 📦 **导入导出** - 备份和恢复你的配置设置
- 🛡️ **智能保护** - 防止删除最后一个配置，确保始终有可用配置
- 🗂️ **侧边栏集成** - 专用侧边栏视图，便于配置管理

## 📸 界面预览

### 配置管理界面
现代化的配置管理界面，支持：
- 查看所有配置档案
- 一键切换活跃配置
- 编辑配置信息
- 删除不需要的配置

### 添加新配置
简洁的配置添加界面：
- 配置名称自定义
- API 密钥安全输入（支持显示/隐藏切换）
- Base URL 自定义设置
- 流量控制选项

### 侧边栏视图
专用侧边栏面板显示：
- 所有可用配置档案
- 活跃配置指示器
- 快速操作按钮
- 配置状态信息

## 🚀 快速开始

### 安装方式

#### 方法一：从 VSIX 文件安装
1. 下载最新的 `.vsix` 文件
2. 打开 VS Code
3. 按 `Ctrl+Shift+P` 打开命令面板
4. 输入 `Extensions: Install from VSIX...`
5. 选择下载的 `.vsix` 文件

#### 方法二：从源码安装
```bash
git clone https://github.com/TravisZS/claude-config-Vscode.git
cd claude-config-Vscode
npm install
npm run compile
```

### 首次使用

1. **欢迎向导**：首次激活扩展时会显示欢迎消息
2. **创建配置**：使用命令面板运行 "Claude Config: Add New Profile"
3. **开始使用**：点击状态栏的 Claude 状态或使用 "Claude Config: Quick Switch Profile" 切换配置

## 🛠️ 使用方法

### 命令列表

- `Claude Config: Open Configuration Manager` - 打开完整的配置管理界面
- `Claude Config: Quick Switch Profile` - 快速配置切换器
- `Claude Config: Add New Profile` - 添加新的配置档案
- `Claude Config: Refresh Status` - 刷新状态栏显示

### 配置文件

本扩展使用两个配置文件：

1. **`~/.claude/claude-config.json`** - 存储多个配置档案（由本扩展管理）
2. **`~/.claude/settings.json`** - Claude Code 的设置文件（切换配置时自动更新）

### 配置档案结构

每个配置档案包含：
- **名称**：配置的显示名称
- **API 密钥**：你的 Claude API 密钥
- **Base URL**：API 端点地址（默认：https://api.anthropic.com）
- **流量控制**：是否禁用非必要流量的选项

## 🔧 开发相关

### 构建项目

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run compile

# 监听文件变化
npm run watch
```

### 项目结构

```
src/
├── extension.ts              # 扩展入口点
├── types/
│   └── index.ts             # TypeScript 类型定义
├── utils/
│   ├── configManager.ts     # 配置数据管理
│   └── statusBarManager.ts  # 状态栏集成
└── webview/
    └── webviewProvider.ts   # Webview 界面管理
media/
├── webview.css              # Webview 样式
└── webview.js              # Webview JavaScript 逻辑
```

## 📦 打包发布

### 创建 VSIX 包

```bash
# 安装 vsce 工具
npm install -g vsce

# 创建 VSIX 包
vsce package
```

### 发布到市场

```bash
# 发布到 VS Code Marketplace
vsce publish
```

## 🤝 贡献指南

1. Fork 这个仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request


## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Anthropic](https://www.anthropic.com/) 提供强大的 Claude API
- 感谢 VS Code 团队提供优秀的扩展开发框架
- 感谢所有贡献者和用户的支持

---

<p align="center">
  如果这个扩展对你有帮助，请给个 ⭐ 支持一下！
</p>

<p align="center">
  <a href="https://github.com/TravisZS/claude-config-Vscode/issues">报告问题</a> •
  <a href="https://github.com/TravisZS/claude-config-Vscode/discussions">讨论交流</a> •
  <a href="https://github.com/TravisZS">关注作者</a>
</p>