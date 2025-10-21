# Chronos - 本地文件时光机 ⏰

<div align="center">

**一款为非技术用户设计的轻量级、本地优先的文件版本管理工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![Tauri](https://img.shields.io/badge/tauri-2.0-orange.svg)](https://tauri.app/)

[功能特性](#功能特性) • [快速开始](#快速开始) • [用户文档](#用户文档) • [开发指南](#开发指南)

</div>

---

## 📖 项目简介

Chronos 是一款图形化的 Git 版本管理工具，它将强大的 Git 功能包装在友好的用户界面中，让非技术用户也能轻松管理文件版本。

### 核心价值

- 🚫 **告别混乱命名** - 不再需要 "报告_最终版_v3_真正最终版.doc"
- ⏮️ **时光穿梭** - 随时回到文件的任何历史版本
- 🌿 **安全实验** - 通过分支功能安全地尝试新想法
- 💻 **完全本地** - 零云依赖，所有数据保持在本地
- 🖥️ **原生桌面应用** - 基于Tauri的跨平台桌面应用

---

## ✨ 功能特性

### 🗂️ 仓库管理
- ✅ 初始化文件夹为"时光库"
- ✅ 查看仓库状态和文件变更
- ✅ 支持中文文件名和路径
- ✅ 最近使用仓库列表

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

### 方式一：使用桌面应用（推荐）

1. 下载最新版本的安装包
2. 双击安装并运行
3. 开始使用！

### 方式二：从源码运行

#### 前置要求

- **Python** 3.10 或更高版本
- **Node.js** 18 或更高版本  
- **Git** 2.0 或更高版本

#### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd chronos

# 2. 安装Backend依赖
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. 安装Frontend依赖
cd ../frontend
npm install

# 4. 启动应用
npm run dev  # 开发模式
# 或
npm run tauri:dev  # Tauri桌面应用模式
```

---

## 📚 用户文档

- 📖 **[安装指南](./docs/user/INSTALLATION_GUIDE.md)** - 详细的安装步骤和环境配置
- 📘 **[使用教程](./docs/user/USER_GUIDE.md)** - 完整的功能使用指南
- ❓ **[常见问题](./docs/user/FAQ.md)** - 常见问题解答和故障排除
- 🔧 **[Tauri构建指南](./docs/TAURI_BUILD_GUIDE.md)** - 桌面应用打包说明

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
- **Tauri 2.0** - 桌面应用框架

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
│   ├── services/           # 业务逻辑层
│   ├── tests/              # 单元测试
│   └── main.py             # FastAPI 应用入口
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/           # API 客户端
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── App.tsx        # 应用主组件
│   ├── src-tauri/         # Tauri 配置
│   └── package.json       # Node 依赖
│
├── scripts/               # 实用脚本
├── docs/                  # 项目文档
└── README.md             # 本文件
```

### 开发命令

#### Backend 开发

```bash
cd backend
source venv/bin/activate

# 启动开发服务器
python -m uvicorn main:app --reload --port 8765

# 代码格式化
black .

# 代码检查
ruff check .

# 运行测试
pytest tests/ -v
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

# 运行测试
npm test

# 构建生产版本
npm run build
```

#### Tauri 桌面应用

```bash
cd frontend

# 开发模式
npm run tauri:dev

# 构建应用
npm run tauri:build
```

构建完成后，应用程序位于：
- macOS: `frontend/src-tauri/target/release/bundle/macos/Chronos.app`
- DMG: `frontend/src-tauri/target/release/bundle/dmg/Chronos_1.0.0_aarch64.dmg`

---

## 📊 版本历史

### v1.1 (最新)
- ✅ 优化错误提示，显示用户友好的中文消息
- ✅ 隐藏系统文件，不在界面显示
- ✅ 添加最近使用仓库列表
- ✅ 自动刷新文件列表
- ✅ 创建分支后自动切换

### v1.0 (MVP)
- ✅ 基础仓库管理
- ✅ 快照创建和查看
- ✅ 历史记录和回滚
- ✅ 分支管理和合并
- ✅ 性能优化

详细发布说明：
- [v1.0 发布说明](./docs/RELEASE_v1.0.md)
- [v1.1 发布说明](./docs/RELEASE_v1.1.md)

---

## 🗺️ 路线图

### 🚀 未来规划
- [ ] Windows/Linux 支持
- [ ] 文件夹选择对话框（Tauri Dialog API）
- [ ] 更多高级功能
- [ ] 性能持续优化
- [ ] 插件系统

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 提交规范

使用约定式提交（Conventional Commits）：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢所有为 Chronos 项目做出贡献的开发者和测试人员！

特别感谢：
- **Git** - 强大的版本控制系统
- **FastAPI** - 优秀的 Python Web 框架
- **React** - 灵活的 UI 框架
- **Ant Design** - 美观的组件库
- **Tauri** - 现代化的桌面应用框架

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by sunshunda

</div>
