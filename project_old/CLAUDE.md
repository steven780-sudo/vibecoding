# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Chronos 是一个基于 Tauri 2.0 的桌面应用，为本地文件提供 Git 版本管理功能。用户可以通过直观的界面创建文件快照、版本回滚和分支管理，而无需了�� Git 命令。

### 技术架构

**三层架构设计**:
- **Backend (Python)**: FastAPI + Git CLI 封装，处理所有 Git 操作
- **Frontend (React)**: TypeScript + Ant Design，提供用户界面
- **Desktop (Tauri)**: Rust 桌面框架，打包为原生 macOS 应用

**核心数据流**: Frontend ↔ Backend API ↔ Git Repository

## 开发环境配置

### 环境要求
- Python 3.10+
- Node.js 18+
- Rust 1.70+ (Tauri)
- Git 2.30+

### 快速启动

```bash
# 1. 一键环境配置
./scripts/setup.sh

# 2. 启动开发环境 (Web开发模式)
./scripts/start-dev.sh
# 访问: Frontend http://localhost:5173, Backend API http://127.0.0.1:8765

# 3. 启动 Tauri 桌面开发模式
./scripts/start_tauri.sh
# 或 cd frontend && npm run tauri:dev

# 4. 停止所有服务
./scripts/stop-dev.sh
```

## 常用命令

### Backend 开发 (Python)

```bash
cd backend

# 开发服务器 (热重载)
uvicorn main:app --reload --host 0.0.0.0 --port 8765

# 代码质量检查
black .                    # 代码格式化
ruff check .              # 代码检查
ruff check . --fix        # 自动修复

# 运行测试
pytest tests/             # 运行所有测试
pytest tests/test_api.py  # 运行单个测试文件
pytest -v                # 详细输出

# 依赖管理
pip install -r requirements.txt
pip freeze > requirements.txt
```

### Frontend 开发 (React + TypeScript)

```bash
cd frontend

# 开发服务器
npm run dev               # Vite 开发服务器 (端口 5173)
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run test             # Vitest 测试

# Tauri 桌面应用
npm run tauri:dev        # 桌面应用开发模式
npm run tauri:build      # 构建桌面应用
```

### Tauri 应用构建

```bash
cd frontend

# 开发模式 (包含热重载)
npm run tauri:dev

# 生产构建
npm run tauri:build
# 构建结果: frontend/src-tauri/target/release/bundle/macos/

# 仅构建 Backend 为可执行文件
cd ../backend
pyinstaller --onefile --name chronos-backend main.py
```

## 核心模块架构

### Backend 模块

**FastAPI 应用结构**:
- `main.py`: 应用入口，CORS 配置，健康检查端点
- `api/repository.py`: 仓库管理的 API 端点
- `services/git_wrapper.py`: Git 命令封装，核心业务逻辑
- `models/schemas.py`: Pydantic 数据模型和验证

**关键设计模式**:
- 仓库模式: `git_wrapper.py` 封装所有 Git 操作
- API 层分离: 路由处理与业务逻辑分离
- 异步处理: 所有 API 端点都是 async 函数

### Frontend 模块

**React 组件结构**:
- `components/`: 可复用 UI 组件 (Ant Design 组件封装)
- `hooks/`: 自定义 React Hooks (API 调用、状态管理)
- `api/`: HTTP 客户端，与 Backend API 通信
- `types/`: TypeScript 接口定义

**状态管理策略**:
- 使用 React Hooks (`useState`, `useEffect`)
- 自定义 hooks 封装 API 调用逻辑
- 无全局状态管理库 (Redux/Zustand)，保持简单

### Tauri 集成

**桌面应用配置**:
- `frontend/src-tauri/tauri.conf.json`: Tauri 应用配置
- `frontend/src-tauri/Cargo.toml`: Rust 依赖配置
- Backend 二进制文件存放在 `frontend/src-tauri/binaries/`

**关键配置**:
- 允许文件系统访问和文件夹选择对话框
- 配置了允许的 CORS 来源
- 生产环境优化 (LTO, strip, panic=abort)

## 测试策略

### Backend 测试

```bash
cd backend

# 运行所有测试
pytest tests/

# 运行特定测试
pytest tests/test_git_wrapper.py -v

# 覆盖率报告
pytest --cov=. tests/

# 异步测试支持
pytest tests/test_api.py -v  # 自动检测 async tests
```

**测试结构**:
- `tests/test_api.py`: API 端点测试
- `tests/test_git_wrapper.py`: Git 操作服务测试
- `tests/test_main.py`: 主应用测试

### Frontend 测试

```bash
cd frontend

# 运行测试
npm run test

# 监听模式
npm run test -- --watch

# 覆盖率
npm run test -- --coverage
```

**测试配置**:
- Vitest + Testing Library
- jsdom 环境 (浏览器 API 模拟)
- 支持 TypeScript

## 代码质量工具

### Backend 标准化

**工具配置** (`backend/pyproject.toml`):
- **Black**: 代码格式化，line-length 88
- **Ruff**: 代码检查和格式化，Python 3.10+ 目���
- **Pytest**: 测试框架，支持异步测试

**质量检查命令**:
```bash
cd backend
black . --check           # 检查格式
ruff check .             # 代码检查
pytest tests/ --tb=short # 运行测试
```

### Frontend 标准化

**工具配置**:
- **Prettier**: 代码格式化
- **ESLint**: 代码质量检查 (TypeScript 规则)
- **TypeScript**: 类型检查
- **Vitest**: 单元测试

**质量检查命令**:
```bash
cd frontend
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npx tsc --noEmit         # TypeScript 类型检查
npm run test             # 运行测试
```

## 部署和发布

### 开发环境端口

- **Frontend**: http://localhost:5173 (Vite 开发服务器)
- **Backend API**: http://127.0.0.1:8765 (FastAPI)
- **API 文档**: http://127.0.0.1:8765/docs (Swagger UI)

### 生产构建

```bash
# 1. 构建 Frontend
cd frontend
npm run build

# 2. 构建 Tauri 应用
npm run tauri:build

# 3. 构建 Backend 可执行文件
cd ../backend
pyinstaller --onefile --name chronos-backend main.py
```

**构建产物位置**:
- macOS 应用包: `frontend/src-tauri/target/release/bundle/macos/Chronos.app`
- Backend 二进制: `backend/dist/chronos-backend`

## 重要开发约定

### API 设计约定

- RESTful API 设计，所有端点返回统一格式
- 使用 Pydantic 模型进行请求/响应验证
- 错误处理使用 HTTPException 和统一错误格式
- 支持 CORS，配置了本地开发和 Tauri 生产环境的允许来源

### Git 操作约定

- 所有 Git 操作通过 `git_wrapper.py` 封装，不直接调用 git 命令
- 自动处理 `.gitignore` 规则，忽略系统文件和 IDE 文件
- 仓库初始化自动包含默认的 .gitignore 配置
- 支持分支、快照、合并等核心 Git 功能

### 文件路径处理

- 使用 `pathlib.Path` 进行跨平台路径处理
- Tauri 应用中使用文件对话框选择仓库目录
- API 端点通过路径参数传递仓库相对路径

### 错误处理策略

- Backend: 使用 HTTPException 返回适当的 HTTP 状态码
- Frontend: 通过 error boundaries 和 try-catch 处理异步错误
- Git 操作: 捕获 subprocess 异常并转换为用户友好的错误信息

## 故障排除

### 常见开发问题

**端口冲突**:
```bash
# 查找占用进程
lsof -i :8765  # Backend 端口
lsof -i :5173  # Frontend 端口

# 停止所有开发服务
./scripts/stop-dev.sh
```

**Python 虚拟环境问题**:
```bash
cd backend
python -m venv venv              # 创建虚拟环境
source venv/bin/activate        # 激活
pip install -r requirements.txt # 安装依赖
```

**Node 依赖问题**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Tauri 构建问题**:
```bash
# 确保 Rust 工具链最新
rustup update
# 清理 Tauri 缓存
cd frontend && rm -rf src-tauri/target
```