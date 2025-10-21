# Chronos Tauri 打包指南

## 概述

本文档详细说明如何将Chronos打包成macOS桌面应用。

## 前置条件

### 1. 安装Rust和Cargo

```bash
# 安装Rust（包含cargo）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 重新加载环境变量
source $HOME/.cargo/env

# 验证安装
rustc --version
cargo --version
```

### 2. 安装Xcode命令行工具（macOS）

```bash
xcode-select --install
```

### 3. 安装Node.js依赖

```bash
cd frontend
npm install
```

### 4. 安装Tauri API（用于文件对话框等功能）

```bash
cd frontend
npm install @tauri-apps/api
```

## 准备后端可执行文件

Tauri需要将Python后端打包成独立的可执行文件。

### 方法1：使用PyInstaller（推荐）

```bash
# 安装PyInstaller
pip install pyinstaller

# 进入backend目录
cd backend

# 打包后端为单文件可执行
pyinstaller --onefile \
  --name backend \
  --add-data "services:services" \
  --add-data "api:api" \
  --hidden-import uvicorn \
  --hidden-import fastapi \
  main.py

# 复制到Tauri binaries目录
cp dist/backend ../frontend/src-tauri/binaries/backend

# 如果是Apple Silicon Mac，也需要创建对应的二进制
cp dist/backend ../frontend/src-tauri/binaries/backend-aarch64-apple-darwin
```

### 方法2：使用现有的打包脚本

```bash
# 如果项目中有打包脚本
cd backend
python setup.py build
```

## 配置Tauri

### 1. 更新tauri.conf.json

确保配置文件包含正确的设置：

```json
{
  "bundle": {
    "resources": ["binaries/*"],
    "externalBin": ["binaries/backend"]
  }
}
```

### 2. 添加Dialog权限（用于文件夹选择）

在`frontend/src-tauri/Cargo.toml`中确认包含：

```toml
[dependencies]
tauri = { version = "2", features = ["dialog-all"] }
```

## 开发模式运行

```bash
cd frontend
npm run tauri:dev
```

这将：
1. 启动Vite开发服务器
2. 启动后端服务
3. 打开Tauri窗口

## 构建生产版本

### 1. 构建前端

```bash
cd frontend
npm run build
```

### 2. 构建Tauri应用

```bash
cd frontend
npm run tauri:build
```

构建完成后，应用程序将位于：
- macOS: `frontend/src-tauri/target/release/bundle/macos/Chronos.app`
- DMG安装包: `frontend/src-tauri/target/release/bundle/dmg/Chronos_1.0.0_aarch64.dmg`

## 测试打包的应用

```bash
# 直接运行.app文件
open frontend/src-tauri/target/release/bundle/macos/Chronos.app

# 或者安装DMG后运行
open frontend/src-tauri/target/release/bundle/dmg/Chronos_1.0.0_aarch64.dmg
```

## 常见问题

### 1. 后端无法启动

**问题**：应用启动后后端服务无法连接

**解决方案**：
- 检查后端二进制文件是否有执行权限
- 确认端口8765没有被占用
- 查看Tauri日志：`Console.app` -> 搜索"Chronos"

### 2. 文件对话框不工作

**问题**：点击"浏览"按钮没有反应

**解决方案**：
- 确认已安装`@tauri-apps/api`
- 检查Cargo.toml中是否包含dialog权限
- 重新构建应用

### 3. 构建失败

**问题**：`npm run tauri:build`失败

**解决方案**：
```bash
# 清理缓存
cd frontend/src-tauri
cargo clean

# 更新依赖
cargo update

# 重新构建
cd ..
npm run tauri:build
```

### 4. 代码签名问题（macOS）

**问题**：应用无法打开，提示"来自未识别的开发者"

**临时解决方案**：
```bash
# 移除隔离属性
xattr -cr /Applications/Chronos.app
```

**正式解决方案**：
1. 注册Apple Developer账号
2. 创建开发者证书
3. 在tauri.conf.json中配置签名

## 发布清单

在发布应用前，确保：

- [ ] 所有功能测试通过
- [ ] 更新版本号（package.json和tauri.conf.json）
- [ ] 更新CHANGELOG.md
- [ ] 构建并测试.app文件
- [ ] 构建并测试.dmg安装包
- [ ] 准备发布说明
- [ ] 创建GitHub Release
- [ ] 上传安装包

## 自动化构建（可选）

可以使用GitHub Actions自动构建：

```yaml
# .github/workflows/build.yml
name: Build Tauri App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - uses: actions-rs/toolchain@v1
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Build app
        run: cd frontend && npm run tauri:build
      - name: Upload artifacts
        uses: actions/upload-artifact@v2
        with:
          name: Chronos-macOS
          path: frontend/src-tauri/target/release/bundle/dmg/*.dmg
```

## 参考资料

- [Tauri官方文档](https://tauri.app/v1/guides/)
- [Tauri构建指南](https://tauri.app/v1/guides/building/)
- [PyInstaller文档](https://pyinstaller.org/)

---

**最后更新**：2025-10-22
**Tauri版本**：2.8.4
**目标平台**：macOS (Apple Silicon)
