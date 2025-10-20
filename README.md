# Chronos - 文件时光机

Chronos是一款为非技术用户设计的轻量级、本地优先的文件版本管理工具。它为Git驱动的版本控制提供图形化界面。

## 技术栈

### Backend
- **Python 3.10+**
- **FastAPI** - Web框架
- **Git CLI** - 版本控制核心

### Frontend
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design 5.x** - UI组件库
- **Tauri** - 桌面应用框架

## 快速开始

### 前置要求

- Python 3.10+
- Node.js 18+
- Git

### 安装

1. 克隆仓库
```bash
git clone <repository-url>
cd chronos
```

2. 运行设置脚本
```bash
./setup.sh
```

这将自动：
- 创建Python虚拟环境
- 安装Backend依赖
- 安装Frontend依赖

### 开发

启动开发环境：
```bash
./start-dev.sh
```

这将启动：
- Backend服务器：http://127.0.0.1:8765
- Frontend开发服务器：http://localhost:5173

### 代码质量检查

运行所有代码质量检查：
```bash
./check-quality.sh
```

这将运行：
- Backend: Black, Ruff, Pytest
- Frontend: Prettier, ESLint, TypeScript, Vitest

### 手动命令

#### Backend

```bash
cd backend
source venv/bin/activate

# 启动服务器
uvicorn main:app --host 127.0.0.1 --port 8765 --reload

# 格式化代码
black api/ models/ services/ tests/ main.py

# 检查代码
ruff check api/ models/ services/ tests/ main.py

# 运行测试
pytest tests/ -v
```

#### Frontend

```bash
cd frontend

# 启动开发服务器
npm run dev

# 格式化代码
npm run format

# 检查代码
npm run lint

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 项目结构

```
chronos/
├── backend/              # Python Backend
│   ├── api/             # API路由
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   ├── tests/           # 单元测试
│   └── main.py          # 应用入口
│
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── api/        # API客户端
│   │   ├── components/ # React组件
│   │   ├── hooks/      # 自定义Hooks
│   │   ├── types/      # TypeScript类型
│   │   └── tests/      # 单元测试
│   └── vite.config.ts  # Vite配置
│
├── docs/               # 项目文档
├── setup.sh           # 设置脚本
├── start-dev.sh       # 开发启动脚本
└── check-quality.sh   # 代码质量检查脚本
```

## 核心功能

### 1. 仓库管理
- 初始化新仓库
- 打开现有仓库
- 查看仓库状态

### 2. 快照管理
- 创建快照（提交）
- 选择要包含的文件
- 添加描述信息

### 3. 历史查看
- 时间线展示历史记录
- 查看提交详情
- 回滚到指定版本

### 4. 分支管理
- 创建新分支
- 切换分支
- 合并分支
- 冲突检测

## API文档

Backend API文档可在开发服务器运行时访问：
- Swagger UI: http://127.0.0.1:8765/docs
- ReDoc: http://127.0.0.1:8765/redoc

## 测试

### Backend测试
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Frontend测试
```bash
cd frontend
npm test
```

## 代码规范

### Python
- 格式化：Black
- Linter：Ruff
- 测试：Pytest

### TypeScript/React
- 格式化：Prettier
- Linter：ESLint
- 测试：Vitest

## 性能目标（MVP）

- 初始化：1000个小文件 < 1秒
- 状态检查：修改10个文件后 < 500毫秒
- 历史检索：100个commit < 500毫秒
- UI响应：所有交互 < 200毫秒

## 贡献

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[待定]

## 联系方式

[待定]
