# VS Code 插件市场发布指南

## 📦 完成情况

✅ **项目已完成**
- GitHub 仓库：https://github.com/TravisZS/claude-config-Vscode
- 中文 README：已完成
- VSIX 安装包：`claude-config-0.0.1.vsix`（28.5 KB）

## 🚀 立即使用

### 方法一：本地安装 VSIX 包
```bash
# 在项目目录中已生成：claude-config-0.0.1.vsix
# 用户可以直接安装此文件
```

在 VS Code 中安装：
1. 打开 VS Code
2. 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) 
3. 输入 `Extensions: Install from VSIX...`
4. 选择 `claude-config-0.0.1.vsix` 文件
5. 重启 VS Code

## 📢 发布到 VS Code Marketplace

### 步骤 1：创建 Microsoft 账户
1. 访问 https://marketplace.visualstudio.com/
2. 点击右上角 "Sign in"
3. 使用 Microsoft 账户登录（没有的话需要注册）

### 步骤 2：创建发布者账户
1. 访问 https://marketplace.visualstudio.com/manage
2. 点击 "Create publisher"
3. 填写发布者信息：
   - **Publisher Name**: `TravisZS`（必须与 package.json 中的 publisher 一致）
   - **Publisher ID**: `TravisZS`
   - **Display Name**: `TravisZS` 
   - **Description**: `Claude configuration management tools`

### 步骤 3：获取 Personal Access Token
1. 访问 https://dev.azure.com/
2. 点击右上角用户头像 → "Personal access tokens"
3. 点击 "New Token"
4. 设置：
   - **Name**: `vscode-marketplace`
   - **Organization**: 选择你的组织
   - **Expiration**: 选择过期时间（建议1年）
   - **Scopes**: 选择 "Custom defined"
   - 勾选 **Marketplace** → **Manage**
5. 点击 "Create" 并**保存生成的 Token**（只显示一次）

### 步骤 4：配置 vsce
```bash
# 登录到发布者账户
vsce login TravisZS

# 粘贴刚才生成的 Personal Access Token
```

### 步骤 5：发布插件
```bash
# 方法一：直接发布（会自动打包）
vsce publish

# 方法二：发布已有的 VSIX 包
vsce publish claude-config-0.0.1.vsix
```

### 步骤 6：验证发布
1. 访问 https://marketplace.visualstudio.com/items?itemName=TravisZS.claude-config
2. 检查插件信息是否正确显示
3. 可以在 VS Code 中搜索 "Claude Config" 测试安装

## 🔧 发布前检查清单

✅ **已完成项目**：
- [x] 功能完整且经过测试
- [x] 中文 README 文档完善
- [x] 添加了 LICENSE 文件
- [x] 添加了 .vscodeignore 文件
- [x] package.json 信息完整
- [x] 图标文件齐全
- [x] VSIX 包构建成功

✅ **发布准备**：
- [x] GitHub 仓库公开且可访问
- [x] 发布者信息设置正确
- [x] 版本号遵循语义化版本规范

## 📈 发布后推广

### GitHub Release
```bash
# 创建 git tag
git tag v0.0.1
git push origin v0.0.1

# 在 GitHub 上创建 Release
# 上传 claude-config-0.0.1.vsix 作为附件
```

### 社区分享
- 在相关技术社区分享（如 V2EX、掘金等）
- 在 Claude/Anthropic 相关社群中介绍
- 更新个人博客或技术文章

## 🆕 版本更新流程

当需要更新版本时：

```bash
# 1. 更新版本号
npm version patch  # 0.0.1 -> 0.0.2
# 或
npm version minor  # 0.0.1 -> 0.1.0

# 2. 重新发布
vsce publish

# 3. 更新 GitHub
git push origin main --tags
```

## 🎯 市场优化建议

### SEO 关键词优化
在 package.json 中已包含：
- `claude` - 核心品牌词
- `anthropic` - 公司名
- `configuration` - 功能词
- `api-key` - 具体功能
- `profile` - 用户需求
- `config` - 简化词
- `management` - 管理功能

### 用户体验优化
- 详细的中文文档
- 清晰的使用步骤
- 专业的界面设计
- 智能的错误处理

## 📊 预期效果

插件发布后，用户可以通过以下方式找到：
1. **VS Code 内搜索**："Claude Config" 或 "Claude"
2. **网页版市场**：https://marketplace.visualstudio.com/
3. **GitHub 仓库**：直接下载 VSIX 安装

预计会受到以下用户群体欢迎：
- Claude API 的开发者用户
- 需要管理多个 AI 配置的用户  
- 追求效率的 VS Code 用户

---

**准备就绪！** 现在你可以选择：
1. 立即发布到市场（按照上述步骤）
2. 先在 GitHub 发布 Release 供用户下载 VSIX
3. 两者同时进行，最大化覆盖用户