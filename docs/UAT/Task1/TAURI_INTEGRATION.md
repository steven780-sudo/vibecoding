# Tauri 集成文档

## 概述

Chronos 现在是一个完整的桌面应用程序，使用 Tauri 框架将 React 前端和 Python 后端打包成原生应用。

## 架构

```
Chronos 桌面应用
├── Tauri Shell (Rust)
│   ├── 窗口管理
│   ├── 系统集成
│   └── 进程管理
├── Frontend (React + TypeScript)
│   ├── UI 组件
│   ├── 状态管理
│   └── API 调用
└── Backend (Python + FastAPI)
    ├── Git 封装
    ├── API 端点
    └── 业务逻辑
```

## 关键特性

### 1. Sidecar 进程管理

后端 Python 服务器作为 Tauri sidecar 运行：
- 应用启动时自动启动后端
- 应用关闭时自动清理后端进程
- 无需用户手动管理后端服务

### 2. 原生桌面体验

- 原生窗口和菜单
- 系统托盘集成（可选）
- 文件系统访问
- 跨平台支持（macOS、Windows、Linux）

### 3. 安全通信

- Frontend 通过 HTTP 与 Backend 通信
- CORS 配置支持 Tauri 协议
- 所有通信在本地进行

## 文件结构

```
frontend/
├── src-tauri/
│   ├── src/
│   │   └── main.rs          # Tauri 主程序
│   ├── binaries/
│   │   └── backend-*        # 平台特定的后端二进制文件
│   ├── icons/               # 应用图标
│   ├── Cargo.toml           # Rust 依赖
│   ├── tauri.conf.json      # Tauri 配置
│   └── build.rs             # 构建脚本
└── src/                     # React 应用
```

## 开发工作流

### 开发模式

```bash
# 方式1：使用便捷脚本
./start_tauri.sh

# 方式2：手动启动
cd frontend
npm run tauri:dev
```

开发模式特点：
- 前端热重载
- 后端自动启动
- 实时调试

### 构建生产版本

```bash
cd frontend
npm run tauri:build
```

这将生成：
- macOS: `.dmg` 和 `.app`
- Windows: `.msi` 和 `.exe`
- Linux: `.deb` 和 `.AppImage`

## 后端二进制文件

### 构建后端

```bash
cd backend
bash build_binary.sh
```

这会：
1. 使用 PyInstaller 将 Python 应用打包成单个可执行文件
2. 复制到 `frontend/src-tauri/binaries/`
3. 根据平台命名（如 `backend-aarch64-apple-darwin`）

### 平台命名规则

- macOS (ARM): `backend-aarch64-apple-darwin`
- macOS (Intel): `backend-x86_64-apple-darwin`
- Windows: `backend-x86_64-pc-windows-msvc.exe`
- Linux: `backend-x86_64-unknown-linux-gnu`

## 配置

### Tauri 配置 (tauri.conf.json)

关键配置项：

```json
{
  "bundle": {
    "externalBin": ["binaries/backend"],
    "resources": ["binaries/*"]
  },
  "app": {
    "windows": [{
      "title": "Chronos - 文件时光机",
      "width": 1200,
      "height": 800
    }]
  }
}
```

### Backend CORS 配置

Backend 已配置支持 Tauri 协议：

```python
allow_origins=[
    "http://localhost:5173",      # Vite 开发服务器
    "http://localhost:1420",      # Tauri 开发端口
    "tauri://localhost",          # Tauri 生产环境
    "https://tauri.localhost",    # Tauri 生产环境备选
]
```

## 进程管理

### 启动流程

1. Tauri 应用启动
2. Rust 代码执行 `start_backend_server()`
3. 启动 Python 后端二进制文件
4. 后端监听 `127.0.0.1:8765`
5. Frontend 加载并连接到后端

### 关闭流程

1. 用户关闭窗口
2. Tauri 触发 `CloseRequested` 事件
3. Rust 代码终止后端进程
4. 清理资源
5. 应用退出

## 故障排除

### 后端未启动

检查：
1. 后端二进制文件是否存在
2. 文件权限是否正确（可执行）
3. 查看 Tauri 控制台输出

```bash
# 重新构建后端
cd backend
bash build_binary.sh
```

### 前端无法连接后端

检查：
1. 后端是否在 8765 端口运行
2. CORS 配置是否正确
3. 防火墙设置

### 构建失败

常见问题：
1. Rust 未安装：`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Node 依赖缺失：`npm install`
3. Python 依赖缺失：`pip install -r requirements.txt`

## 性能优化

### 生产构建优化

Cargo.toml 中的优化设置：

```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

这些设置可以：
- 减小二进制文件大小
- 提高运行时性能
- 移除调试符号

### 后端优化

PyInstaller 使用 `--onefile` 模式：
- 单个可执行文件
- 更快的启动时间
- 更小的分发包

## 安全考虑

1. **本地通信**：所有通信都在 localhost 进行
2. **进程隔离**：Frontend 和 Backend 在独立进程中运行
3. **权限控制**：Tauri 提供细粒度的权限系统
4. **代码签名**：生产构建应该进行代码签名

## 下一步

1. 添加系统托盘图标
2. 实现自动更新
3. 添加崩溃报告
4. 优化启动时间
5. 添加更多原生集成（通知、文件关联等）

## 参考资源

- [Tauri 官方文档](https://tauri.app/)
- [Tauri Sidecar 指南](https://tauri.app/v1/guides/building/sidecar)
- [PyInstaller 文档](https://pyinstaller.org/)
