# 任务1 - 项目结构文档

## 概述
本文档描述了任务1（搭建项目基础结构并验证环境）所创建的项目结构。

## 目录结构

```
chronos/
├── backend/                    # Python FastAPI backend
│   ├── api/                   # API route handlers (empty, ready for implementation)
│   │   └── __init__.py
│   ├── models/                # Data models (empty, ready for implementation)
│   │   └── __init__.py
│   ├── services/              # Business logic services (empty, ready for implementation)
│   │   └── __init__.py
│   ├── tests/                 # Test files
│   │   ├── __init__.py
│   │   └── test_main.py      # Main application tests
│   ├── venv/                  # Python virtual environment
│   ├── .python-version        # Python version specification
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── pyproject.toml         # Black and Ruff configuration
│   └── start.sh               # Backend startup script
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── api/              # API client functions (empty, ready for implementation)
│   │   │   └── .gitkeep
│   │   ├── components/       # React components (empty, ready for implementation)
│   │   │   └── .gitkeep
│   │   ├── hooks/            # Custom React hooks (empty, ready for implementation)
│   │   │   └── .gitkeep
│   │   ├── tests/            # Test files
│   │   │   ├── App.test.tsx  # App component tests
│   │   │   └── setup.ts      # Test setup configuration
│   │   ├── types/            # TypeScript type definitions (empty, ready for implementation)
│   │   │   └── .gitkeep
│   │   ├── App.tsx           # Main application component
│   │   ├── main.tsx          # Application entry point
│   │   ├── index.css         # Global styles
│   │   └── vite-env.d.ts     # Vite type definitions
│   ├── node_modules/         # Node dependencies
│   ├── .eslintrc.cjs         # ESLint configuration
│   ├── .prettierrc           # Prettier configuration
│   ├── index.html            # HTML template
│   ├── package.json          # Project configuration and dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── tsconfig.node.json    # TypeScript Node configuration
│   ├── vite.config.ts        # Vite configuration
│   └── start.sh              # Frontend startup script
│
├── .kiro/                     # Kiro IDE configuration
│   ├── specs/                # Project specifications
│   │   └── chronos-mvp/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/             # Development guidelines
│       ├── develop_rules.md
│       ├── product.md
│       ├── structure.md
│       └── tech.md
│
├── .gitignore                 # Git ignore configuration
├── SETUP.md                   # Installation and setup guide
├── TASK_1_SUMMARY.md         # Task 1 completion summary
└── verify_setup.sh           # Automated verification script
```

## 关键文件说明

### 后端文件

#### `backend/main.py`
- FastAPI 应用程序入口
- 实现了两个端点：
  - `GET /` - 返回欢迎消息和版本信息
  - `GET /health` - 健康检查端点
- 配置了 CORS 中间件以允许本地前端访问

#### `backend/requirements.txt`
核心依赖：
- `fastapi==0.115.0` - Web framework
- `uvicorn==0.32.0` - ASGI server
- `pydantic==2.10.0` - Data validation
- `pytest==8.3.0` - Testing framework
- `pytest-asyncio==0.24.0` - Async testing support
- `httpx==0.27.0` - HTTP client for testing
- `black==24.10.0` - Code formatter
- `ruff==0.8.0` - Code linter

#### `backend/pyproject.toml`
配置内容：
- Black（代码格式化）：88字符行宽，Python 3.10目标版本
- Ruff（代码检查）：pycodestyle、pyflakes、isort、flake8-bugbear、flake8-comprehensions
- Pytest：测试发现和异步模式配置

#### `backend/tests/test_main.py`
主应用程序的单元测试：
- `test_root_endpoint()` - 测试根端点返回成功
- `test_health_endpoint()` - 测试健康检查端点

#### `backend/start.sh`
启动脚本功能：
- 切换到后端目录
- 在 127.0.0.1:8765 启动 uvicorn 服务器
- 启用开发模式自动重载

### 前端文件

#### `frontend/src/App.tsx`
主应用组件功能：
- 挂载时获取后端状态
- 连接时显示加载状态
- 连接成功时显示成功消息
- 连接失败时显示错误消息
- 使用 Ant Design 组件（Card、Alert、Spin）

#### `frontend/package.json`
项目配置包含：
- React 18.2.0 和 React DOM
- Ant Design 5.11.5 UI组件库
- TypeScript 5.2.2
- Vite 5.0.0 构建工具
- Vitest 1.0.0 测试框架
- ESLint 和 Prettier 代码质量工具

#### `frontend/vite.config.ts`
Vite 配置包含：
- React 插件
- 路径别名（@/ -> src/）
- 开发服务器端口 5173
- 后端 API 代理配置
- Vitest 测试配置

#### `frontend/tsconfig.json`
TypeScript 配置：
- ES2020 目标版本
- 启用严格模式
- React JSX 支持
- 配置路径别名

#### `frontend/.eslintrc.cjs`
ESLint 配置：
- TypeScript 支持
- React hooks 规则
- React refresh 插件

#### `frontend/.prettierrc`
Prettier 配置：
- 不使用分号
- 使用单引号
- 2空格缩进
- ES5 尾随逗号

#### `frontend/src/tests/App.test.tsx`
组件测试：
- 测试标题渲染
- 测试欢迎消息渲染

### 文档文件

#### `SETUP.md`
综合设置指南包含：
- 环境要求
- 后端和前端安装步骤
- 如何运行开发服务器
- 代码质量工具使用
- 验证步骤
- 故障排除提示

#### `TASK_1_SUMMARY.md`
任务完成总结包含：
- 已完成工作概述
- 验证结果
- 满足的需求
- 下一步计划

#### `verify_setup.sh`
自动验证脚本检查：
- Python 和 Node.js 安装
- 虚拟环境创建
- 依赖安装
- 测试执行
- 代码格式化和检查

### 配置文件

#### `.gitignore`
配置忽略：
- Python 产物（__pycache__、*.pyc、venv/）
- Node 产物（node_modules/、dist/）
- IDE 文件（.vscode/、.idea/）
- 环境文件（.env）
- 日志文件

## 技术栈

### 后端
- **语言**：Python 3.10+
- **框架**：FastAPI
- **服务器**：Uvicorn
- **测试**：Pytest
- **代码质量**：Black（格式化）、Ruff（检查）

### 前端
- **语言**：TypeScript
- **框架**：React 18
- **构建工具**：Vite
- **UI库**：Ant Design 5.x
- **测试**：Vitest + Testing Library
- **代码质量**：Prettier（格式化）、ESLint（检查）

## 通信架构

- 后端运行在 `http://127.0.0.1:8765`
- 前端运行在 `http://localhost:5173`
- 前端通过代理将 `/api` 请求转发到后端
- 配置了 CORS 以允许本地前端访问

## 开发工作流

1. 启动后端：`./backend/start.sh`
2. 启动前端：`./frontend/start.sh`
3. 访问应用：`http://localhost:5173`
4. 运行测试：`pytest`（后端）、`npm test`（前端）
5. 格式化代码：`black .`（后端）、`npm run format`（前端）
6. 检查代码：`ruff check .`（后端）、`npm run lint`（前端）

## 下一步

基础已就绪，可以开始实现核心功能：
- 任务2：实现 Git 封装服务
- 任务3：实现 API 端点
- 任务4：实现前端组件
