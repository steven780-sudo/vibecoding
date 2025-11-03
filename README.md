# Chronos v2.0 - 本地文件时光机

> 告别混乱的文件命名，轻松管理文件版本

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/steven780-sudo/vibecoding)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-28.0-blue.svg)](https://www.electronjs.org/)

---

## 📖 项目简介

Chronos v2.0 是一个基于 Git 的本地文件版本管理工具，提供三种运行模式：

1. **本地 Web 应用**（优先）- 在本地运行，通过浏览器访问
2. **桌面应用** - Windows + macOS + Linux 原生应用 ⭐ **推荐**
3. **云端 Web 应用** - 部署到云端，随时随地访问（待实现）

### ✨ 核心功能

- 📁 **仓库管理** - 初始化、打开、查看状态
- 📸 **快照管理** - 创建快照、查看历史、回滚
- 🌿 **分支管理** - 创建、切换、合并分支
- 📂 **文件管理** - 文件树展示、状态标记、文件选择
- 🖥️ **桌面应用** - 原生文件夹选择器、系统集成

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 本地 Web 应用

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 桌面应用（推荐）

```bash
# 开发模式
npm run dev:electron

# 构建应用
npm run build:electron

# 构建特定平台
npm run build:electron:mac    # macOS
npm run build:electron:win    # Windows
npm run build:electron:linux  # Linux
```

构建完成后，安装包在 `dist-electron/` 目录中。

---

## 📚 文档

### 核心文档
- [项目总文档](CLAUDE.md) - 项目概览和架构
- [需求文档](.kiro/specs/chronos-v2/requirements.md) - 功能需求
- [设计文档](.kiro/specs/chronos-v2/design.md) - 技术设计
- [任务清单](.kiro/specs/chronos-v2/tasks.md) - 开发任务

### 开发文档
- [AI 协作指南](.kiro/steering/PROJECT_GUIDE.md) - 开发规范
- [配置指南](docs/CONFIG_GUIDE.md) - 配置文件说明
- [依赖说明](docs/DEPENDENCIES.md) - 依赖包说明
- [项目状态](docs/PROJECT_STATUS.md) - 当前进度

### 使用文档
- [Electron 指南](docs/ELECTRON_GUIDE.md) - 桌面应用使用
- [完成总结](docs/COMPLETION_SUMMARY.md) - 项目总结

---

## 🛠️ 技术栈

### 前端
- React 18.2.0
- TypeScript 5.3.3
- Ant Design 5.12.0
- Zustand 4.4.7
- Vite 5.0.8

### 后端
- Node.js (>= 18.0.0)
- Express 4.18.2
- TypeScript 5.3.3
- better-sqlite3 9.2.2

### Git
- isomorphic-git 1.25.0（纯 JS 实现）

### 桌面应用
- Electron 28.0.0
- electron-builder 24.9.1

### 测试
- Vitest 1.0.4
- Playwright 1.40.0

### 代码质量
- ESLint 8.56.0
- Prettier 3.1.1
- Husky 8.0.3

---

## 📁 项目结构

```
chronos-v2/
├── src/
│   ├── client/          # 前端代码
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── services/    # API 服务
│   │   │   ├── stores/      # Zustand 状态管理
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   ├── server/          # 后端代码
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   └── index.ts
│   ├── shared/          # 共享代码
│   │   ├── types/       # 类型定义
│   │   └── constants/   # 常量
│   └── electron/        # Electron 代码
│       ├── main.ts      # 主进程
│       └── preload.ts   # 预加载脚本
├── tests/               # 测试代码
│   ├── unit/           # 单元测试
│   ├── integration/    # 集成测试
│   └── e2e/            # E2E 测试
├── config/             # 配置文件
├── docs/               # 文档
└── package.json
```

---

## 🔧 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:electron     # 启动 Electron 开发模式

# 构建
npm run build            # 构建所有
npm run build:electron   # 构建桌面应用

# 测试
npm run test             # 运行所有测试
npm run test:watch       # 监听模式
npm run test:coverage    # 覆盖率报告

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 检查

# 清理
npm run clean            # 清理构建产物
```

---

## 📝 开发规范

### 代码质量要求

1. **TypeScript 严格模式** - 所有代码必须通过类型检查
2. **ESLint** - 0 errors, 0 warnings
3. **Prettier** - 统一代码格式
4. **测试覆盖率** - > 80%
5. **JSDoc** - 所有公共 API 必须有注释

### 提交规范

使用 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档
- `test:` 测试
- `refactor:` 重构
- `chore:` 构建/工具

详见 [AI 协作指南](.kiro/steering/PROJECT_GUIDE.md)

---

## 🎯 项目状态

### 已完成 ✅

- ✅ 阶段 1: 项目搭建和基础设施 (100%)
- ✅ 阶段 2: 核心功能开发 (100%)
- ✅ 阶段 3: UI 开发 (100%)
- ✅ 阶段 5: Electron 桌面应用 (100%)

### 待完成 ⏳

- ⏳ 阶段 4: 性能优化和测试（可选）
- ⏳ 云端 Web 应用（可选）

详见 [项目状态](docs/PROJECT_STATUS.md) 和 [完成总结](docs/COMPLETION_SUMMARY.md)

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- 作者：sunshunda@gmail.com
- GitHub：https://github.com/steven780-sudo/vibecoding
- Issues：https://github.com/steven780-sudo/vibecoding/issues

---

## 🙏 致谢

感谢以下开源项目：

- [isomorphic-git](https://isomorphic-git.org/) - 纯 JS 实现的 Git
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - UI 框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Vite](https://vitejs.dev/) - 构建工具

---

**版本**: 2.0.0  
**最后更新**: 2025-11-02  
**状态**: 🎉 核心功能完成，可以开始使用！
