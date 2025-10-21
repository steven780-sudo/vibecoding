# Chronos 项目结构

本文档描述了 Chronos 项目的目录结构和文件组织。

## 📁 目录结构

```
chronos/
├── backend/                    # Python Backend
│   ├── api/                   # API 路由处理
│   │   └── repository.py      # 仓库操作端点
│   ├── models/                # 数据模型
│   │   └── schemas.py         # Pydantic 数据模型
│   ├── services/              # 业务逻辑层
│   │   └── git_wrapper.py     # Git 命令封装
│   ├── tests/                 # 单元测试
│   ├── main.py                # FastAPI 应用入口
│   ├── requirements.txt       # Python 依赖
│   └── pyproject.toml         # Python 项目配置
│
├── frontend/                   # React Frontend
│   ├── src/                   # 源代码
│   │   ├── api/              # API 客户端
│   │   ├── components/       # React 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── types/            # TypeScript 类型定义
│   │   ├── tests/            # 单元测试
│   │   └── App.tsx           # 应用主组件
│   ├── src-tauri/            # Tauri 配置
│   │   ├── binaries/         # Backend 二进制文件
│   │   ├── icons/            # 应用图标
│   │   ├── src/              # Rust 源代码
│   │   ├── Cargo.toml        # Rust 依赖
│   │   └── tauri.conf.json   # Tauri 配置
│   ├── package.json          # Node 依赖
│   └── vite.config.ts        # Vite 配置
│
├── scripts/                   # 实用脚本
│   ├── setup.sh              # 环境安装脚本
│   ├── start-dev.sh          # 开发启动脚本
│   ├── stop-dev.sh           # 停止服务脚本
│   ├── check-quality.sh      # 代码质量检查
│   └── README.md             # 脚本说明文档
│
├── release/                   # 发布说明
│   ├── RELEASE_v1.0.md       # v1.0 发布说明
│   ├── RELEASE_v1.1.md       # v1.1 发布说明
│   └── TAURI_BUILD_GUIDE.md  # Tauri 构建指南
│
├── .kiro/                     # Kiro IDE 配置
│   └── steering/             # 开发指导规则
│
├── Chronos_v1.1.0_macOS.dmg  # macOS 安装包
├── .gitignore                # Git 忽略文件
├── LICENSE                   # MIT 许可证
├── README.md                 # 项目主说明
└── PROJECT_STRUCTURE.md      # 本文件
```

## 📦 核心模块

### Backend (Python + FastAPI)
- **api/** - API 路由层，处理 HTTP 请求
- **services/** - 业务逻辑层，Git 命令封装
- **models/** - 数据模型层，Pydantic 数据模型
- **tests/** - 测试层，单元测试和集成测试

### Frontend (React + TypeScript)
- **components/** - UI 组件，可复用的 React 组件
- **hooks/** - 自定义 Hooks，状态管理和 API 调用
- **api/** - API 客户端，HTTP 请求封装
- **types/** - 类型定义，TypeScript 接口

### Tauri (桌面应用)
- **src-tauri/** - Tauri 配置，Rust 后端代码和应用配置

## 🔧 配置文件

### Backend
- `requirements.txt` - Python 依赖列表
- `pyproject.toml` - Python 项目配置

### Frontend
- `package.json` - Node 依赖和脚本
- `tsconfig.json` - TypeScript 编译配置
- `vite.config.ts` - Vite 构建配置

### Tauri
- `tauri.conf.json` - Tauri 应用配置
- `Cargo.toml` - Rust 依赖配置

## 📚 文档组织

- **README.md** - 项目主页，快速开始和使用指南
- **PROJECT_STRUCTURE.md** - 本文件，项目结构说明
- **release/** - 发布说明和构建指南
- **scripts/README.md** - 脚本使用说明

## 🚀 快速导航

### 开始开发
1. 查看 [README.md](./README.md)
2. 运行 `./scripts/setup.sh`
3. 运行 `./scripts/start-dev.sh`

### 查看文档
- 发布说明: [release/](./release/)
- 脚本说明: [scripts/README.md](./scripts/README.md)

### 运行测试
- Backend: `cd backend && pytest tests/`
- Frontend: `cd frontend && npm test`

---

**最后更新**: 2025-10-22
