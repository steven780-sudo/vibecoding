# Chronos - 本地文件时光机 ⏰ copyright by sunshunda

<div align="center">

**一款为非技术用户设计的轻量级、本地优先的文件版本管理工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![MVP Status](https://img.shields.io/badge/MVP-Passed-success.svg)](docs/MVP_ACCEPTANCE_REPORT.md)

[功能特性](#功能特性) • [快速开始](#快速开始) • [用户文档](#用户文档) • [开发指南](#开发指南) • [测试](#测试)

</div>

---

## 📖 项目简介

Chronos 是一款图形化的 Git 版本管理工具，它将强大的 Git 功能包装在友好的用户界面中，让非技术用户也能轻松管理文件版本。

### 核心价值

- 🚫 **告别混乱命名** - 不再需要 "报告_最终版_v3_真正最终版.doc"
- ⏮️ **时光穿梭** - 随时回到文件的任何历史版本
- 🌿 **安全实验** - 通过分支功能安全地尝试新想法
- 💻 **完全本地** - 零云依赖，所有数据保持在本地

### 产品定位

- **目标用户**: 需要版本控制但不熟悉 Git 的专业人士
- **使用场景**: 文档编写、报告制作、创意工作等
- **核心理念**: 简单、直观、本地优先

---

## ✨ 功能特性

### 🗂️ 仓库管理
- ✅ 初始化文件夹为"时光库"
- ✅ 查看仓库状态和文件变更
- ✅ 支持中文文件名和路径

### 📸 快照管理
- ✅ 创建快照保存文件状态
- ✅ 选择要包含的文件
- ✅ 添加描述和详细说明
- ✅ 查看完整历史记录

### ⏮️ 版本控制
- ✅ 查看历史快照时间线
- ✅ 展开查看详细信息
- ✅ 一键回滚到任意版本
- ✅ 安全的确认机制

### 🌿 分支管理
- ✅ 创建实验性分支
- ✅ 在分支间自由切换
- ✅ 分支隔离保护主版本
- ✅ 合并分支到主版本

### ⚡ 性能表现
- ✅ 毫秒级响应速度
- ✅ 处理100+文件无压力
- ✅ 流畅的用户界面
- ✅ 无卡顿体验

---

## 🚀 快速开始

### 前置要求

确保你的系统已安装以下软件：

- **Python** 3.10 或更高版本
- **Node.js** 18 或更高版本  
- **Git** 2.0 或更高版本

### 一键安装

```bash
# 1. 克隆项目
git clone <repository-url>
cd chronos

# 2. 运行安装脚本
./scripts/setup.sh
```

安装脚本会自动：
- ✅ 创建 Python 虚拟环境
- ✅ 安装 Backend 依赖
- ✅ 安装 Frontend 依赖
- ✅ 验证环境配置

### 启动应用

```bash
# 启动开发环境（Backend + Frontend）
./scripts/start-dev.sh
```

启动后访问：
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8765
- **API文档**: http://127.0.0.1:8765/docs

---

## 📚 用户文档

### 新手入门

- 📖 **[安装指南](./docs/user/INSTALLATION_GUIDE.md)** - 详细的安装步骤和环境配置
- 📘 **[使用教程](./docs/user/USER_GUIDE.md)** - 完整的功能使用指南
- ❓ **[常见问题](./docs/user/FAQ.md)** - 常见问题解答和故障排除

### 项目文档

- 📋 **[产品需求](./docs/user_given_by_shunda/PRD.md)** - 产品功能和设计
- 🏗️ **[技术规格](./docs/user_given_by_shunda/tech_spec.md)** - 技术架构和实现
- ✅ **[测试用例](./docs/user_given_by_shunda/test_cases.md)** - 测试场景和验收标准
- 📊 **[MVP验收报告](./docs/other_files/MVP_ACCEPTANCE_REPORT.md)** - 最终验收结果

---

## 🛠️ 技术栈

### Backend
- **Python 3.10+** - 编程语言
- **FastAPI** - 现代化 Web 框架
- **Git CLI** - 版本控制核心引擎
- **Pytest** - 单元测试框架

### Frontend
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Ant Design 5.x** - 企业级 UI 组件
- **Tauri** - 桌面应用框架（规划中）

### 开发工具
- **Black** - Python 代码格式化
- **Ruff** - Python 代码检查
- **Prettier** - TypeScript 代码格式化
- **ESLint** - TypeScript 代码检查
- **Vitest** - Frontend 测试框架

---

## 💻 开发指南

### 项目结构

```
chronos/
├── backend/                 # Python Backend
│   ├── api/                # API 路由处理
│   │   └── repository.py   # 仓库操作端点
│   ├── models/             # 数据模型（Pydantic）
│   │   └── schemas.py      # API 数据模型
│   ├── services/           # 业务逻辑层
│   │   └── git_wrapper.py  # Git 命令封装
│   ├── tests/              # 单元测试
│   │   ├── test_api.py     # API 测试
│   │   └── test_git_wrapper.py  # Git 服务测试
│   ├── main.py             # FastAPI 应用入口
│   └── requirements.txt    # Python 依赖
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/           # API 客户端
│   │   │   └── client.ts  # HTTP 客户端
│   │   ├── components/    # React 组件
│   │   │   ├── BranchManager.tsx    # 分支管理
│   │   │   ├── HistoryViewer.tsx    # 历史查看
│   │   │   └── SnapshotDialog.tsx   # 快照对话框
│   │   ├── hooks/         # 自定义 Hooks
│   │   │   ├── useBranches.ts       # 分支管理
│   │   │   ├── useHistory.ts        # 历史记录
│   │   │   └── useRepository.ts     # 仓库操作
│   │   ├── types/         # TypeScript 类型
│   │   ├── tests/         # 单元测试
│   │   └── App.tsx        # 应用主组件
│   ├── package.json       # Node 依赖
│   └── vite.config.ts     # Vite 配置
│
├── scripts/               # 脚本文件
│   ├── setup.sh          # 环境安装脚本
│   ├── start-dev.sh      # 开发启动脚本
│   ├── check-quality.sh  # 代码质量检查
│   └── verify_setup.sh   # 环境验证脚本
│
├── docs/                  # 项目文档
│   ├── user/             # 用户文档
│   ├── user_given/       # 原始需求文档
│   ├── UAT_record/       # UAT 测试记录
│   └── Task*/            # 开发任务文档
│
├── .kiro/                # Kiro IDE 配置
│   ├── specs/           # 项目规范
│   └── steering/        # 开发指导
│
└── README.md             # 本文件
```

### 开发命令

#### Backend 开发

```bash
cd backend
source venv/bin/activate

# 启动开发服务器（自动重载）
python -m uvicorn main:app --reload --port 8765

# 代码格式化
black .

# 代码检查
ruff check .

# 运行测试
pytest tests/ -v

# 测试覆盖率
pytest tests/ --cov=. --cov-report=html
```

#### Frontend 开发

```bash
cd frontend

# 启动开发服务器
npm run dev

# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage

# 构建生产版本
npm run build
```

### 代码质量检查

运行所有质量检查：

```bash
./scripts/check-quality.sh
```

这将执行：
- ✅ Backend: Black 格式化、Ruff 检查、Pytest 测试
- ✅ Frontend: Prettier 格式化、ESLint 检查、TypeScript 检查、Vitest 测试

---

## 🧪 测试

### 测试覆盖

| 模块 | 测试数量 | 覆盖率 | 状态 |
|------|---------|--------|------|
| Backend | 18 个 | 良好 | ✅ |
| Frontend | 57 个 | 良好 | ✅ |
| **总计** | **75 个** | **良好** | ✅ |

### 运行测试

```bash
# Backend 测试
cd backend && source venv/bin/activate && pytest tests/ -v

# Frontend 测试
cd frontend && npm test

# 所有测试（通过质量检查脚本）
./scripts/check-quality.sh
```

### UAT 测试

完整的用户验收测试文档：
- 📋 [UAT 测试指南](./docs/UAT/Task9/UAT_TEST_GUIDE.md)
- 📊 [UAT 测试报告](./docs/UAT/UAT_record/UAT_REPORT_v2.md)
- 📈 [测试总结](./docs/UAT/UAT_record/FINAL_TEST_SUMMARY.md)

---

## 📊 性能指标

### MVP 性能目标

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 初始化 1000 个文件 | < 1秒 | < 1秒 | ✅ |
| 状态检查（10个文件） | < 500ms | < 100ms | ✅ |
| 历史加载（100个提交） | < 500ms | < 100ms | ✅ |
| UI 响应时间 | < 200ms | 毫秒级 | ✅ |

### 性能亮点

- ⚡ **毫秒级响应** - 所有操作即时反馈
- 🚀 **高效处理** - 100+ 文件无压力
- 💨 **流畅体验** - 无卡顿、无延迟
- 🎯 **远超目标** - 性能表现优秀

---

## 🎯 MVP 验收状态

### 验收结果

```
✅ Chronos MVP 验收通过

总分: 96.5% (优秀)
- 功能完整性: 100%
- 测试通过率: 90%
- 性能表现: 100%
- 代码质量: 95%
```

### 核心功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 仓库初始化 | ✅ | 分支名为 main |
| 快照管理 | ✅ | 创建、查看正常 |
| 历史查看 | ✅ | 展开功能正常 |
| 版本回滚 | ✅ | 回滚功能正常 |
| 分支创建 | ✅ | 创建功能正常 |
| 分支切换 | ✅ | 切换功能正常 |
| 分支合并 | ✅ | 合并功能正常 |
| 性能测试 | ✅ | 性能优秀 |

详细验收报告：[MVP_ACCEPTANCE_REPORT.md](./docs/other_files/MVP_ACCEPTANCE_REPORT.md)

---

## 🗺️ 路线图

### ✅ MVP (已完成)
- [x] 基础仓库管理
- [x] 快照创建和查看
- [x] 历史记录和回滚
- [x] 分支管理和合并
- [x] 性能优化

### 🔄 迭代 1 (计划中)
- [ ] 优化隐藏文件显示
- [ ] 改进错误提示
- [ ] 添加重复初始化提示
- [ ] 用户体验优化

### 🚀 未来规划
- [ ] Tauri 桌面应用
- [ ] Windows/Linux 支持
- [ ] 更多高级功能
- [ ] 性能持续优化

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork** 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 **Pull Request**

### 提交规范

使用约定式提交（Conventional Commits）：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具

### 代码规范

- Python: 遵循 Black 和 Ruff 规范
- TypeScript: 遵循 Prettier 和 ESLint 规范
- 所有代码必须通过测试
- 添加适当的注释和文档

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- **问题反馈**: [GitHub Issues](../../issues)
- **功能建议**: [GitHub Discussions](../../discussions)
- **文档问题**: 查看 [FAQ](./docs/user/FAQ.md)

---

## 🙏 致谢

感谢所有为 Chronos 项目做出贡献的开发者和测试人员！

特别感谢：
- **Git** - 强大的版本控制系统
- **FastAPI** - 优秀的 Python Web 框架
- **React** - 灵活的 UI 框架
- **Ant Design** - 美观的组件库

---

## 📈 项目统计

- **代码行数**: ~5000+ 行
- **测试用例**: 75 个
- **文档页数**: 50+ 页
- **开发周期**: MVP 完成
- **测试通过率**: 90%

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by Chronos Team

</div>
