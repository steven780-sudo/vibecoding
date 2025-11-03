# Chronos v2.0 - Electron 桌面应用指南

## 📦 构建桌面应用

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 构建步骤

#### 1. 安装依赖

```bash
npm install
```

#### 2. 构建应用

```bash
# 构建所有平台
npm run build:electron

# 仅构建 macOS
npm run build:electron:mac

# 仅构建 Windows
npm run build:electron:win

# 仅构建 Linux
npm run build:electron:linux
```

#### 3. 查找构建产物

构建完成后，安装包会在 `dist-electron` 目录中：

- **macOS**: `dist-electron/Chronos-2.0.0.dmg` 和 `dist-electron/Chronos-2.0.0-mac.zip`
- **Windows**: `dist-electron/Chronos Setup 2.0.0.exe` 和 `dist-electron/Chronos-2.0.0-portable.exe`
- **Linux**: `dist-electron/Chronos-2.0.0.AppImage`, `.deb`, `.rpm`

## 🚀 开发模式

### 启动开发环境

```bash
# 启动 Electron 开发模式（包含热重载）
npm run dev:electron
```

这会同时启动：
1. 后端服务器（端口 3000）
2. 前端开发服务器（端口 5173）
3. Electron 窗口

### 调试

开发模式下会自动打开 Chrome DevTools，可以直接调试前端代码。

## 🎯 功能特性

### 桌面应用独有功能

1. **原生文件夹选择器**
   - 点击"浏览文件夹"按钮
   - 使用系统原生对话框选择文件夹
   - 无需手动输入路径

2. **更好的性能**
   - 直接访问文件系统
   - 无浏览器安全限制
   - 更快的 Git 操作

3. **系统集成**
   - 桌面图标
   - 系统托盘（可选）
   - 文件关联（可选）

## 📝 配置

### 应用配置

编辑 `electron-builder.json` 来自定义构建配置：

```json
{
  "appId": "com.chronos.app",
  "productName": "Chronos",
  "directories": {
    "output": "dist-electron"
  }
}
```

### 图标

替换以下文件来自定义应用图标：

- `build/icon.png` - Linux 图标（512x512）
- `build/icon.icns` - macOS 图标
- `build/icon.ico` - Windows 图标

## 🔧 故障排除

### 构建失败

1. **清理缓存**
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   ```

2. **检查 Node 版本**
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

### 应用无法启动

1. **检查端口占用**
   - 确保端口 3000 未被占用
   - 或修改 `src/electron/main.ts` 中的 `SERVER_PORT`

2. **查看日志**
   - macOS: `~/Library/Logs/Chronos/`
   - Windows: `%APPDATA%\Chronos\logs\`
   - Linux: `~/.config/Chronos/logs/`

## 📚 相关文档

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [项目主文档](../CLAUDE.md)

## 🎉 发布

### 代码签名（可选）

#### macOS

1. 获取 Apple Developer 证书
2. 配置 `electron-builder.json`:
   ```json
   {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```

#### Windows

1. 获取代码签名证书
2. 配置环境变量:
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

### 自动更新（可选）

配置 `electron-builder.json` 添加更新服务器：

```json
{
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "chronos"
  }
}
```

---

**版本**: 1.0  
**最后更新**: 2025-11-02
