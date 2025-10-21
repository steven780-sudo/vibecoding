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
│   │   ├── test_api.py        # API 测试
│   │   └── test_git_wrapper.py # Git 服务测试
│   ├── main.py                # FastAPI 应用入口
│   ├── requirements.txt       # Python 依赖
│   └── pyproject.toml         # Python 项目配置
│
├── frontend/                   # React Frontend
│   ├── src/                   # 源代码
│   │   ├── api/              # API 客户端
│   │   │   └── client.ts     # HTTP 客户端
│   │   ├── components/       # React 组件
│   │   │   ├── BranchManager.tsx    # 分支管理
│   │   │   ├── HistoryViewer.tsx    # 历史查看
│   │   │   └── SnapshotDialog.tsx   # 快照对话框
│   │   ├── hooks/            # 自定义 Hooks
│   │   │   ├── useBranches.ts       # 分支管理
│   │   │   ├── useHistory.ts        # 历史记录
│   │   │   └── useRepository.ts     # 仓库操作
│   │   ├── types/            # TypeScript 类型定义
│   │   │   └── api.ts        # API 类型
│   │   ├── tests/            # 单元测试
│   │   └── App.tsx           # 应用主组件
│   ├── src-tauri/            # Tauri 配置
│   │   ├── binaries/         # Backend 二进制文件
│   │   ├── icons/            # 应用图标
│   │   ├── src/              # Rust 源代码
│   │   │   └── main.rs       # Tauri 入口
│   │   ├── Cargo.toml        # Rust 依赖
│   │   └── tauri.conf.json   # Tauri 配置
│   ├── index.html            # HTML 入口
│   ├── package.json          # Node 依赖
│   ├── tsconfig.json         # TypeScript 配置
│   └── vite.config.ts        # Vite 配置
│
├── scripts/                   # 实用脚本
│   ├── setup.sh              # 环境安装脚本
│   ├── start-dev.sh          # 开发启动脚本
│   ├── stop-dev.sh           # 停止服务脚本
│   ├── start_tauri.sh        # Tauri 启动脚本
│   ├── check-quality.sh      # 代码质量检查
│   ├── verify_setup.sh       # 环境验证脚本
│   ├── generate_icons.py     # 图标生成脚本
│   └── README.md             # 脚本说明文档
│
├── docs/                      # 项目文档
│   ├── user/                 # 用户文档
│   │   ├── INSTALLATION_GUIDE.md  # 安装指南
│   │   ├── USER_GUIDE.md          # 使用教程
│   │   └── FAQ.md                 # 常见问题
│   ├── README.md             # 文档索引
│   ├── TAURI_BUILD_GUIDE.md  # Tauri 构建指南
│   ├── RELEASE_v1.0.md       # v1.0 发布说明
│   └── RELEASE_v1.1.md       # v1.1 发布说明
│
├── .kiro/                     # Kiro IDE 配置
│   └── steering/             # 开发指导规则
│       ├── develop_rules.md  # 开发规范
│       ├── product.md        # 产品概述
│       ├── structure.md      # 项目结构
│       └── tech.md           # 技术栈
│
├── .gitignore                # Git 忽略文件
├── LICENSE                   # MIT 许可证
├── README.md                 # 项目主说明
└── PROJECT_STRUCTURE.md      # 本文件
```

## 📦 核心模块说明

### Backend (Python + FastAPI)

**api/** - API 路由层
- 处理 HTTP 请求
- 参数验证
- 响应格式化

**services/** - 业务逻辑层
- Git 命令封装
- 文件操作
- 错误处理

**models/** - 数据模型层
- Pydantic 数据模型
- 请求/响应结构
- 数据验证

**tests/** - 测试层
- 单元测试
- 集成测试
- 测试覆盖率

### Frontend (React + TypeScript)

**components/** - UI 组件
- 可复用的 React 组件
- 业务逻辑组件
- 展示组件

**hooks/** - 自定义 Hooks
- 状态管理
- API 调用
- 副作用处理

**api/** - API 客户端
- HTTP 请求封装
- 错误处理
- 重试逻辑

**types/** - 类型定义
- TypeScript 接口
- API 数据类型
- 组件 Props 类型

### Tauri (桌面应用)

**src-tauri/** - Tauri 配置
- Rust 后端代码
- 应用配置
- 图标资源
- Backend 二进制文件

## 🔧 配置文件说明

### Backend 配置

- `requirements.txt` - Python 依赖列表
- `pyproject.toml` - Python 项目配置（Black、Ruff）
- `pytest.ini` - Pytest 配置

### Frontend 配置

- `package.json` - Node 依赖和脚本
- `tsconfig.json` - TypeScript 编译配置
- `vite.config.ts` - Vite 构建配置
- `.eslintrc.cjs` - ESLint 代码检查配置
- `.prettierrc` - Prettier 格式化配置

### Tauri 配置

- `tauri.conf.json` - Tauri 应用配置
- `Cargo.toml` - Rust 依赖配置

## 📝 文档组织

### 用户文档 (docs/user/)
- 面向最终用户
- 安装和使用指南
- 常见问题解答

### 开发文档 (docs/)
- 构建和部署指南
- 发布说明
- 技术文档

### 代码文档
- 代码注释
- API 文档（FastAPI 自动生成）
- TypeScript 类型定义

## 🚀 快速导航

### 开始开发
1. 查看 [README.md](./README.md)
2. 运行 `./scripts/setup.sh`
3. 运行 `./scripts/start-dev.sh`

### 查看文档
1. 用户文档: [docs/user/](./docs/user/)
2. 构建指南: [docs/TAURI_BUILD_GUIDE.md](./docs/TAURI_BUILD_GUIDE.md)
3. 脚本说明: [scripts/README.md](./scripts/README.md)

### 运行测试
1. Backend: `cd backend && pytest tests/`
2. Frontend: `cd frontend && npm test`
3. 全部: `./scripts/check-quality.sh`

## 📊 项目统计

- **代码行数**: ~5000+ 行
- **测试用例**: 75 个
- **文档页数**: 10+ 页
- **脚本数量**: 7 个

---

**最后更新**: 2025-10-22
