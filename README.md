# Chronos - 本地文件时光机

一款为非技术用户设计的轻量级、本地优先的文件版本管理工具。

## 快速开始

### 安装和设置

详细的安装指南请参阅：[docs/Task1/SETUP.md](docs/Task1/SETUP.md)

### 运行应用

#### 桌面应用（推荐）

```bash
./start_tauri.sh
```

#### Web 开发模式

```bash
# 启动后端
./backend/start.sh

# 启动前端（新终端）
./frontend/start.sh
```

## 项目文档

所有项目文档位于 `docs/` 目录：

- **[docs/user_given/](docs/user_given/)** - 用户提供的原始需求和规范文档
- **[docs/MasterGuidance/](docs/MasterGuidance/)** - 项目级别的指导文档
- **[docs/Task1/](docs/Task1/)** - 任务1：项目基础搭建相关文档

详细的文档导航请查看：[docs/README.md](docs/README.md)

## 技术栈

- **后端**: Python 3.10+ + FastAPI
- **前端**: React 18 + TypeScript + Vite
- **桌面**: Tauri 2
- **UI**: Ant Design 5.x

## 项目结构

```
chronos/
├── backend/          # Python FastAPI 后端
├── frontend/         # React + TypeScript 前端
│   └── src-tauri/   # Tauri 桌面应用配置
├── docs/            # 项目文档
│   ├── user_given/  # 用户提供的原始文档
│   ├── MasterGuidance/  # 主要指导文档
│   └── Task1/       # 任务1相关文档
└── .kiro/           # Kiro IDE 配置
    ├── specs/       # 项目规范
    └── steering/    # 开发指南
```

## 开发工具

### 代码质量

```bash
# 后端
cd backend
./venv/bin/black .        # 格式化
./venv/bin/ruff check .   # 检查
./venv/bin/pytest         # 测试

# 前端
cd frontend
npm run format            # 格式化
npm run lint              # 检查
npm run test              # 测试
```

### 环境验证

```bash
./verify_setup.sh
```

## 当前状态

✅ **任务1已完成** - 项目基础搭建和 Tauri 集成

- 完整的后端和前端开发环境
- Tauri 桌面应用框架
- 自动化进程管理
- 完善的文档和工具

详细信息请查看：[docs/Task1/TASK_1_FINAL_REPORT.md](docs/Task1/TASK_1_FINAL_REPORT.md)

## 贡献指南

请参阅 [docs/user_given/project_management.md](docs/user_given/project_management.md)

## 许可证

[待定]
