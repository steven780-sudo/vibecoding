# Chronos 桌面应用构建指南

> 本文档详细说明如何构建Chronos桌面应用的完整流程

---

## 📋 前置要求

### 必需的依赖

1. **Rust 工具链**
   - 路径: `~/.cargo/bin/cargo`
   - 安装位置: `~/.rustup/toolchains/stable-aarch64-apple-darwin/`
   - 验证: `cargo --version`

2. **Node.js 和 npm**
   - 用于前端构建
   - 验证: `node --version` 和 `npm --version`

3. **Python 3.10+**
   - 用于构建后端二进制文件
   - 验证: `python3 --version`

4. **PyInstaller**
   - 用于打包Python后端为独立可执行文件
   - 安装: `pip install pyinstaller`

### 可选依赖

- **Git**: 用于版本控制（用户使用应用时也需要）

---

## 🔧 构建步骤

### 步骤 1: 构建后端二进制文件

```bash
# 进入后端目录
cd backend

# 激活虚拟环境（如果使用）
source venv/bin/activate

# 使用PyInstaller打包后端
pyinstaller --onefile \
  --name backend \
  --add-data ".:." \
  main.py

# 复制生成的二进制文件到Tauri binaries目录
cp dist/backend ../frontend/src-tauri/binaries/backend

# 赋予执行权限
chmod +x ../frontend/src-tauri/binaries/backend
```

**注意事项：**
- 生成的二进制文件位于 `backend/dist/backend`
- 必须复制到 `frontend/src-tauri/binaries/` 目录
- 确保文件有执行权限

### 步骤 2: 解决Tauri版本兼容性

检查并确保Tauri版本一致：

```bash
cd frontend

# 检查当前版本
npm list @tauri-apps/api
cargo tree | grep "tauri v"

# 如果版本不匹配，调整到兼容版本
# 例如：tauri 2.8.x 需要 @tauri-apps/api 2.8.x
npm install @tauri-apps/api@2.8.0
```

**版本对应关系：**
- `tauri` crate 版本必须与 `@tauri-apps/api` npm包的主版本号和次版本号一致
- 例如：`tauri 2.8.5` 对应 `@tauri-apps/api 2.8.x`

### 步骤 3: 构建Tauri应用

```bash
cd frontend

# 设置Rust环境变量
export PATH="$HOME/.cargo/bin:$PATH"

# 构建生产版本
npm run tauri build
```

**构建过程：**
1. 前端构建：`npm run build` (TypeScript + Vite)
2. Rust编译：编译Tauri核心和main.rs
3. 资源打包：打包前端dist、后端二进制、图标等
4. 生成安装包：创建.dmg文件（macOS）

### 步骤 4: 查找生成的安装包

```bash
# 安装包位置
ls -lh frontend/src-tauri/target/release/bundle/dmg/

# 通常文件名格式为：
# Chronos_<version>_aarch64.dmg (Apple Silicon)
# Chronos_<version>_x64.dmg (Intel)
```

### 步骤 5: 复制安装包到项目根目录

```bash
# 复制并重命名
cp frontend/src-tauri/target/release/bundle/dmg/Chronos_1.0.0_aarch64.dmg \
   ./Chronos_v1.2.0_macOS.dmg

# 删除旧版本
rm -f Chronos_v1.1.0_macOS.dmg
```

---

## 📁 关键文件路径

### 源代码路径

```
chronos/
├── backend/
│   ├── main.py                          # 后端入口
│   ├── dist/backend                     # PyInstaller生成的二进制
│   └── venv/                            # Python虚拟环境
│
├── frontend/
│   ├── src/                             # React源代码
│   ├── dist/                            # Vite构建输出
│   ├── src-tauri/
│   │   ├── src/main.rs                  # Tauri Rust代码
│   │   ├── Cargo.toml                   # Rust依赖
│   │   ├── tauri.conf.json              # Tauri配置
│   │   ├── binaries/
│   │   │   └── backend                  # 后端二进制（需手动复制）
│   │   └── target/
│   │       └── release/
│   │           └── bundle/
│   │               └── dmg/
│   │                   └── Chronos_*.dmg  # 最终安装包
│   └── package.json                     # npm依赖
│
└── Chronos_v1.2.0_macOS.dmg            # 发布的安装包
```

### 依赖路径

- **Cargo (Rust)**: `~/.cargo/bin/cargo`
- **Rustup**: `~/.rustup/toolchains/stable-aarch64-apple-darwin/`
- **Node modules**: `frontend/node_modules/`
- **Python venv**: `backend/venv/`

---

## 🐛 常见问题

### 问题 1: 版本不匹配错误

**错误信息：**
```
Found version mismatched Tauri packages. Make sure the NPM and crate 
versions are on the same major/minor releases:
tauri (v2.8.5) : @tauri-apps/api (v2.9.0)
```

**解决方案：**
```bash
cd frontend
npm install @tauri-apps/api@2.8.0
```

### 问题 2: 后端二进制文件未找到

**错误信息：**
```
❌ 后端二进制文件不存在
```

**解决方案：**
1. 确认已构建后端：`ls -la backend/dist/backend`
2. 复制到正确位置：`cp backend/dist/backend frontend/src-tauri/binaries/`
3. 赋予执行权限：`chmod +x frontend/src-tauri/binaries/backend`

### 问题 3: cargo命令未找到

**错误信息：**
```
cargo not found
```

**解决方案：**
```bash
# 添加到PATH
export PATH="$HOME/.cargo/bin:$PATH"

# 或永久添加到 ~/.zshrc
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 问题 4: 后端服务器启动失败

**症状：**
- 应用打开后显示"资源不存在"
- 无法连接到后端API

**排查步骤：**
1. 检查控制台日志（开发者工具）
2. 确认后端二进制文件存在且有执行权限
3. 检查8765端口是否被占用：`lsof -i :8765`
4. 查看Tauri日志输出

**解决方案：**
- 重新构建后端二进制文件
- 确保后端二进制文件在 `binaries/` 目录中
- 检查 `tauri.conf.json` 中的 `externalBin` 配置

---

## 📦 发布清单

构建完成后，发布前检查：

- [ ] 后端二进制文件已更新
- [ ] 前端代码已构建
- [ ] 版本号已更新（tauri.conf.json）
- [ ] 安装包已生成
- [ ] 安装包已测试（安装并运行）
- [ ] 旧版本安装包已删除
- [ ] 发布说明已更新（release/RELEASE_v*.md）
- [ ] Git已提交并推送

---

## 🚀 快速构建脚本

创建一个快速构建脚本 `scripts/build-app.sh`：

```bash
#!/bin/bash

echo "=== Chronos 应用构建脚本 ==="

# 1. 构建后端
echo "📦 步骤 1: 构建后端二进制..."
cd backend
source venv/bin/activate
pyinstaller --onefile --name backend main.py
cp dist/backend ../frontend/src-tauri/binaries/backend
chmod +x ../frontend/src-tauri/binaries/backend
cd ..

# 2. 构建前端和Tauri应用
echo "📦 步骤 2: 构建Tauri应用..."
cd frontend
export PATH="$HOME/.cargo/bin:$PATH"
npm run tauri build

# 3. 复制安装包
echo "📦 步骤 3: 复制安装包..."
VERSION="1.2.0"
cp src-tauri/target/release/bundle/dmg/Chronos_*.dmg \
   ../Chronos_v${VERSION}_macOS.dmg

echo "✅ 构建完成！"
echo "安装包位置: Chronos_v${VERSION}_macOS.dmg"
```

使用方法：
```bash
chmod +x scripts/build-app.sh
./scripts/build-app.sh
```

---

## 📝 用户安装要求

用户安装Chronos后需要：

### 必需依赖
- **Git**: 必须安装，应用通过Git CLI实现版本控制
  - 安装: `brew install git` (macOS)
  - 验证: `git --version`

### 不需要的依赖
- ❌ Node.js（已打包在应用中）
- ❌ Python（后端已编译为二进制）
- ❌ Rust（仅开发时需要）
- ❌ npm/pip等包管理器

---

## 💡 技术说明

### 应用架构

```
┌─────────────────────────────────────┐
│   Tauri Desktop Application         │
│  ┌─────────────┐  ┌───────────────┐ │
│  │   Frontend  │  │    Backend    │ │
│  │  (打包的HTML)│◄─┤  (二进制文件) │ │
│  │  React+TS   │  │   FastAPI     │ │
│  └─────────────┘  └───────────────┘ │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Git CLI     │
    │  (系统安装)   │
    └──────────────┘
```

### 打包内容

1. **Frontend**: 
   - React应用编译为静态HTML/JS/CSS
   - 打包在Tauri应用内部

2. **Backend**: 
   - Python代码通过PyInstaller编译为独立可执行文件
   - 作为sidecar进程随Tauri启动

3. **Resources**:
   - 应用图标
   - 配置文件

### 启动流程

1. 用户双击应用图标
2. Tauri启动（Rust）
3. Tauri加载前端（HTML/JS）
4. Tauri启动后端进程（backend二进制）
5. 前端通过HTTP连接后端（127.0.0.1:8765）
6. 后端调用系统Git命令

---

## 🔍 调试技巧

### 开发模式运行

```bash
cd frontend
npm run tauri dev
```

开发模式特点：
- 热重载
- 可以看到详细日志
- 不需要完整构建

### 查看应用日志

macOS应用日志位置：
```bash
# 系统日志
log show --predicate 'process == "Chronos"' --last 1h

# 或使用Console.app查看
```

### 检查后端是否运行

```bash
# 检查端口占用
lsof -i :8765

# 测试后端API
curl http://127.0.0.1:8765/health
```

---

**文档版本**: 1.0  
**最后更新**: 2025-10-22  
**适用版本**: Chronos v1.2.0

---

<div align="center">

**祝构建顺利！**

如有问题，请查看常见问题部分或提交Issue。

</div>
