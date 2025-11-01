# Chronos v2.0 - 依赖说明

**文档版本**: 1.0  
**创建日期**: 2025-11-02

---

## 📦 依赖管理

Chronos v2.0 使用 npm 管理所有依赖，配置文件为 `package.json`。

---

## 🎯 生产依赖

### 后端框架

**express** (^4.18.2)
- 用途：Web 服务器框架
- 理由：最成熟的 Node.js Web 框架，生态丰富

**cors** (^2.8.5)
- 用途：跨域资源共享
- 理由：处理前后端跨域请求

### Git 实现

**isomorphic-git** (^1.25.0) ⭐ 核心依赖
- 用途：内置 Git 实现
- 理由：纯 JavaScript，无需用户安装 Git
- 功能：init, add, commit, log, branch, merge, checkout
- 包体积：~2MB

### 数据库

**better-sqlite3** (^9.2.2)
- 用途：SQLite 数据库
- 理由：高性能同步 API，适合桌面应用
- 用途：存储最近使用列表、文件缓存、配置

### 文件系统

**chokidar** (^3.5.3)
- 用途：文件系统监听
- 理由：跨平台，高性能，低 CPU 占用
- 功能：自动检测文件变更

### 缓存

**lru-cache** (^10.1.0)
- 用途：LRU 内存缓存
- 理由：高性能，自动淘汰旧数据
- 用途：缓存文件树结构

### 前端框架

**react** (^18.2.0) + **react-dom** (^18.2.0)
- 用途：UI 框架
- 理由：最成熟的前端框架，生态丰富

**react-window** (^1.8.10)
- 用途：虚拟滚动
- 理由：高性能渲染大量列表
- 用途：文件树、历史记录

### UI 组件库

**antd** (^5.12.0)
- 用途：企业级 UI 组件库
- 理由：组件丰富，中文友好，开箱即用

### 状态管理

**zustand** (^4.4.7)
- 用途：状态管理
- 理由：轻量（~1KB），API 简单，性能好

### 数据验证

**zod** (^3.22.4)
- 用途：TypeScript 数据验证
- 理由：类型安全，API 友好

---

## 🛠️ 开发依赖

### TypeScript

**typescript** (^5.3.3)
- 用途：类型系统
- 理由：类型安全，提高代码质量

**@types/*** 
- 用途：TypeScript 类型定义
- 包含：node, react, react-dom, express, cors 等

### 构建工具

**vite** (^5.0.8)
- 用途：前端构建工具
- 理由：极速开发服务器，快速生产构建

**@vitejs/plugin-react** (^4.2.1)
- 用途：Vite 的 React 插件
- 理由：支持 JSX、Fast Refresh

**tsx** (^4.7.0)
- 用途：TypeScript 执行器
- 理由：直接运行 TypeScript 代码

**concurrently** (^8.2.2)
- 用途：并行运行多个命令
- 理由：同时启动前后端开发服务器

### 测试工具

**vitest** (^1.0.4)
- 用途：单元测试 + 集成测试
- 理由：与 Vite 集成，速度快

**@vitest/coverage-v8** (^1.0.4)
- 用途：测试覆盖率报告
- 理由：准确的覆盖率统计

**@playwright/test** (^1.40.0)
- 用途：E2E 测试
- 理由：跨浏览器测试，API 友好

**supertest** (^6.3.3)
- 用途：HTTP API 测试
- 理由：简化 API 集成测试

### 代码质量

**eslint** (^8.56.0)
- 用途：代码检查
- 理由：发现代码问题，统一代码风格

**@typescript-eslint/*** 
- 用途：TypeScript ESLint 插件
- 理由：TypeScript 特定的代码检查

**eslint-plugin-react** + **eslint-plugin-react-hooks**
- 用途：React 代码检查
- 理由：React 最佳实践检查

**prettier** (^3.1.1)
- 用途：代码格式化
- 理由：统一代码格式，避免格式争议

**eslint-config-prettier** (^9.1.0)
- 用途：ESLint 和 Prettier 集成
- 理由：避免规则冲突

### Git Hooks

**husky** (^8.0.3)
- 用途：Git hooks 管理
- 理由：在提交前运行检查

**lint-staged** (^15.2.0)
- 用途：只检查暂存的文件
- 理由：提高检查速度

### 桌面应用

**electron** (^28.0.0)
- 用途：桌面应用框架
- 理由：跨平台，成熟稳定

**electron-builder** (^24.9.1)
- 用途：Electron 打包工具
- 理由：支持多平台打包，配置简单

### 其他工具

**rimraf** (^5.0.5)
- 用途：跨平台删除文件
- 理由：清理构建产物

**conventional-changelog-cli** (^4.1.0)
- 用途：生成 CHANGELOG
- 理由：自动化版本日志

---

## 📊 依赖统计

### 包体积

**生产依赖**（打包后）:
- React + React-DOM: ~140KB (gzip)
- Ant Design: ~500KB (gzip)
- isomorphic-git: ~2MB
- 其他: ~100KB

**总计**: ~3MB (gzip)

### 安装大小

**node_modules**: ~500MB
- 包含所有开发依赖
- 仅开发时需要

**生产构建**: ~10MB
- 仅包含必要的生产代码
- 用户下载的应用大小

---

## 🔄 依赖更新

### 检查更新

```bash
# 检查过时的依赖
npm outdated

# 检查安全漏洞
npm audit
```

### 更新依赖

```bash
# 更新所有依赖到最新版本
npm update

# 更新特定依赖
npm update <package-name>

# 修复安全漏洞
npm audit fix
```

### 更新策略

- **主版本更新**: 需要测试，可能有破坏性变更
- **次版本更新**: 通常安全，建议定期更新
- **补丁版本更新**: 安全更新，应该立即更新

---

## 🚨 关键依赖说明

### isomorphic-git

**为什么选择 isomorphic-git？**
1. ✅ 纯 JavaScript 实现，无需用户安装 Git
2. ✅ 跨平台支持（Windows + macOS + Linux + 浏览器）
3. ✅ 功能完整（支持所有核心 Git 操作）
4. ✅ 包体积小（~2MB）
5. ✅ 统一技术栈

**替代方案**:
- 系统 Git CLI：性能更好，但需要用户安装
- nodegit：性能好，但需要编译，跨平台困难

### better-sqlite3

**为什么选择 better-sqlite3？**
1. ✅ 同步 API，简化代码
2. ✅ 高性能
3. ✅ 嵌入式数据库，无需额外服务
4. ✅ 适合桌面应用

**替代方案**:
- sqlite3：异步 API，性能略低
- IndexedDB：仅浏览器，API 复杂

### Electron

**为什么选择 Electron？**
1. ✅ 最成熟的桌面框架
2. ✅ 跨平台支持最好
3. ✅ 生态丰富
4. ✅ 前端技术栈不变

**替代方案**:
- Tauri：包体积小，但不稳定（已放弃）
- NW.js：类似 Electron，但生态较小

---

## 📝 依赖许可证

所有依赖都使用开源许可证：
- MIT License（大部分）
- Apache 2.0
- BSD

**注意**: isomorphic-git 使用 MIT License，可以商用。

---

## 🔗 相关链接

- [package.json](../package.json)
- [tsconfig.json](../tsconfig.json)
- [vite.config.ts](../vite.config.ts)
- [vitest.config.ts](../vitest.config.ts)

---

**文档版本**: 1.0  
**最后更新**: 2025-11-02
