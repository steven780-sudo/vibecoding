# Chronos v2.0 - 项目总文档

> 本文档是 Chronos v2.0 项目的完整指南，包含需求、架构、开发规范、任务清单等所有信息。

**项目名称**: Chronos - 本地文件时光机 v2.0  
**创建日期**: 2025-11-02  
**当前分支**: rewrite  
**状态**: 开发中

---

## 📋 快速导航

- [项目概述](#项目概述)
- [核心需求](#核心需求)
- [技术架构](#技术架构)
- [开发规范](#开发规范)
- [目录结构](#目录结构)
- [开发流程](#开发流程)
- [测试策略](#测试策略)
- [部署方案](#部署方案)

## 📎 关键文件索引

### 核心文档
- 📄 [本文档](docs/CLAUDE.md) - 项目总文档
- 📄 [需求文档](.kiro/specs/chronos-v2/requirements.md) - 功能需求和验收标准
- 📄 [设计文档](.kiro/specs/chronos-v2/design.md) - 架构设计和技术方案
- 📄 [任务清单](.kiro/specs/chronos-v2/tasks.md) - 开发任务列表
- 📄 [依赖说明](docs/DEPENDENCIES.md) - 技术栈和依赖管理

### 配置文件
- ⚙️ [package.json](package.json) - 项目配置和依赖
- ⚙️ [tsconfig.json](config/tsconfig.json) - TypeScript 配置
- ⚙️ [tsconfig.server.json](config/tsconfig.server.json) - 服务端 TS 配置
- ⚙️ [vite.config.ts](config/vite.config.ts) - Vite 构建配置
- ⚙️ [vitest.config.ts](config/vitest.config.ts) - 测试配置
- ⚙️ [.eslintrc.json](config/.eslintrc.json) - ESLint 规则
- ⚙️ [.prettierrc](config/.prettierrc) - Prettier 格式化规则
- ⚙️ [electron-builder.yml](config/electron-builder.yml) - Electron 打包配置
- ⚙️ [.gitignore](.gitignore) - Git 忽略规则

### Kiro 配置
- 🤖 [项目指南](.kiro/steering/PROJECT_GUIDE.md) - AI 协作指南
- 🪝 [文件组织 Hook](.kiro/hooks/organize-files.json) - 自动整理文件结构
- 🔧 [MCP 配置](.kiro/settings/mcp.json) - Model Context Protocol 工具配置

### 脚本
- 🔧 [项目整理脚本](scripts/organize-project.sh) - 清理和组织项目文件

### MCP 工具
- 📚 **Context7 MCP** - 搜索最新的开发文档和 API 参考
- 🔍 **Chrome DevTools MCP** - Chrome 官方浏览器调试工具（推荐）
- 🎭 **Playwright MCP** - 跨浏览器自动化测试（补充工具）
- 🧠 **Memory MCP** - 基于知识图谱的持久化记忆系统
- 🤔 **Sequential Thinking MCP** - 动态和反思性问题解决
- 📁 **Filesystem MCP** - 增强的文件系统操作能力

---

## 项目概述

### 什么是 Chronos？

Chronos 是一款为非技术用户设计的图形化 Git 版本管理工具，帮助用户：
- 告别混乱的文件命名（"报告_最终版_v3_真正最终版.doc"）
- 提供时光穿梭能力，随时回到任何历史版本
- 通过分支功能安全地尝试新想法
- 完全本地运行，零云依赖

### 为什么重写？

v1.x 版本存在严重问题：
- ❌ Tauri 框架不稳定（路径、进程管理频繁出错）
- ❌ Python 后端性能不足
- ❌ 代码质量差，缺乏架构设计
- ❌ 错误处理混乱（"资源不存在"bug 反复出现）

v2.0 重写目标：
- ✅ 稳定的技术栈（Electron + Node.js + TypeScript）
- ✅ 高性能（支持 10,000+ 文件）
- ✅ 高代码质量（80%+ 测试覆盖率）
- ✅ 三种运行模式（本地 Web + 云端 Web + 桌面应用）
- ✅ 跨平台（Windows + macOS）

---

## 核心需求

### 三种运行模式

#### 1. 本地 Web 应用（优先级最高）
- 用户启动本地服务器
- 浏览器访问 `http://localhost:3000`
- 使用 `<input webkitdirectory>` 选择文件夹
- 完整的文件系统访问权限

#### 2. 云端 Web 应用
- 用户访问 `https://chronos.app`
- 纯前端应用，无后端
- 使用 File System Access API
- 支持离线使用（PWA）

#### 3. 桌面应用
- Electron 打包
- 双击即可运行
- 支持 Windows 和 macOS
- 支持自动更新

### 核心功能

1. **仓库管理**: 初始化、打开、最近使用列表
2. **快照管理**: 创建、查看历史、回滚
3. **分支管理**: 创建、切换、合并
4. **文件管理**: 树状展示、搜索、过滤

详细需求见：`.kiro/specs/chronos-v2/requirements.md`

---

## 技术架构

### 技术栈

**前端**:
- React 18 + TypeScript 5
- Ant Design 5（UI 组件）
- Zustand（状态管理）
- Vite（构建工具）
- react-window（虚拟滚动）

**后端**（本地模式）:
- Node.js + TypeScript
- Express（Web 框架）
- better-sqlite3（数据库）
- chokidar（文件监听）

**Git 实现**:
- **isomorphic-git**（完全内置）
- 纯 JavaScript 实现，无需用户安装 Git
- 跨平台支持（Windows + macOS + Linux + 浏览器）
- 功能完整，性能足够

**桌面应用**:
- Electron
- electron-builder（打包）

### 架构图

```
┌─────────────────────────────────────────────┐
│  三种运行模式                                │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  1. 本地 Web 应用                      │ │
│  │  Browser → Node.js Server → Git CLI   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  2. 云端 Web 应用                      │ │
│  │  Browser → isomorphic-git (WASM)      │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  3. 桌面应用                           │ │
│  │  Electron → Node.js → Git CLI         │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---


## 目录结构

```
chronos-v2/                        # 项目根目录
│
├── 📁 src/                        # 源代码目录
│   ├── 📁 server/                # Node.js 后端（本地模式）
│   │   ├── 📄 index.ts          # 服务器入口
│   │   ├── 📁 routes/           # API 路由
│   │   │   ├── repository.ts   # 仓库操作 API
│   │   │   ├── snapshot.ts     # 快照操作 API
│   │   │   ├── branch.ts       # 分支操作 API
│   │   │   └── file.ts         # 文件操作 API
│   │   ├── 📁 services/         # 业务服务层
│   │   │   ├── git-service.ts  # Git 操作服务
│   │   │   ├── file-service.ts # 文件操作服务
│   │   │   ├── db-service.ts   # 数据库服务
│   │   │   └── cache-service.ts # 缓存服务
│   │   ├── 📁 workers/          # Worker 线程
│   │   │   └── file-scanner.ts # 文件扫描 Worker
│   │   └── 📁 utils/            # 工具函数
│   │
│   ├── 📁 client/               # React 前端
│   │   ├── 📁 src/
│   │   │   ├── 📄 App.tsx      # 主应用组件
│   │   │   ├── 📄 main.tsx     # 应用入口
│   │   │   ├── 📁 pages/       # 页面组件
│   │   │   │   ├── HomePage.tsx
│   │   │   │   └── RepositoryPage.tsx
│   │   │   ├── 📁 components/  # UI 组件
│   │   │   │   ├── FileTree/
│   │   │   │   ├── HistoryViewer/
│   │   │   │   ├── BranchManager/
│   │   │   │   └── SnapshotDialog/
│   │   │   ├── 📁 hooks/       # 自定义 Hooks
│   │   │   │   ├── useRepository.ts
│   │   │   │   ├── useSnapshot.ts
│   │   │   │   └── useBranch.ts
│   │   │   ├── 📁 stores/      # Zustand 状态管理
│   │   │   │   ├── repository-store.ts
│   │   │   │   ├── ui-store.ts
│   │   │   │   └── settings-store.ts
│   │   │   ├── 📁 services/    # 前端服务
│   │   │   │   ├── api-service.ts
│   │   │   │   └── storage-service.ts
│   │   │   └── 📁 utils/       # 工具函数
│   │   ├── 📄 index.html       # HTML 模板
│   │   └── 📄 vite.config.ts   # Vite 配置
│   │
│   ├── 📁 electron/             # Electron 桌面应用
│   │   ├── 📄 main.ts          # 主进程
│   │   ├── 📄 preload.ts       # Preload 脚本
│   │   └── 📄 builder.yml      # 打包配置
│   │
│   └── 📁 shared/               # 前后端共享代码
│       ├── 📁 types/           # TypeScript 类型定义
│       │   ├── repository.ts
│       │   ├── snapshot.ts
│       │   ├── branch.ts
│       │   └── api.ts
│       ├── 📁 constants/       # 常量定义
│       │   └── index.ts
│       └── 📁 utils/           # 共享工具函数
│           ├── path.ts
│           ├── date.ts
│           └── validation.ts
│
├── 📁 tests/                    # 测试目录
│   ├── 📁 unit/                # 单元测试
│   │   ├── 📁 server/         # 后端单元测试
│   │   └── 📁 client/         # 前端单元测试
│   ├── 📁 integration/         # 集成测试
│   └── 📁 e2e/                 # E2E 测试
│
├── 📁 .kiro/                    # Kiro AI 配置
│   ├── 📁 hooks/               # Agent Hooks
│   │   ├── 📄 organize-files.json    # 文件组织 Hook
│   │   ├── 📄 test-on-save.json      # 保存时测试
│   │   ├── 📄 commit-check.json      # 提交前检查
│   │   └── 📄 release.json           # 版本发布
│   ├── 📁 specs/               # 功能规格文档
│   │   └── 📁 chronos-v2/
│   │       ├── 📄 requirements.md    # 需求文档
│   │       ├── 📄 design.md          # 设计文档
│   │       └── 📄 tasks.md           # 任务清单
│   └── 📁 steering/            # AI 执行规则
│       └── 📄 PROJECT_GUIDE.md       # 项目指南
│
├── 📁 docs/                     # 项目文档
│   ├── 📄 CLAUDE.md            # 项目总文档（本文档）
│   ├── 📄 DEPENDENCIES.md      # 依赖说明
│   ├── 📄 API.md               # API 文档（待创建）
│   ├── 📄 USER_GUIDE.md        # 用户指南（待创建）
│   └── 📄 REWRITE_SUMMARY.md   # 重写总结
│
├── 📁 scripts/                  # 脚本目录
│   ├── 📄 organize-project.sh  # 项目整理脚本
│   ├── 📄 dev.js               # 开发脚本（待创建）
│   ├── 📄 build.js             # 构建脚本（待创建）
│   └── 📄 test.js              # 测试脚本（待创建）
│
├── 📁 config/                   # 配置文件目录
│   ├── 📄 tsconfig.json        # TypeScript 配置
│   ├── 📄 tsconfig.server.json # 服务端 TS 配置
│   ├── 📄 vite.config.ts       # Vite 构建配置
│   ├── 📄 vitest.config.ts     # 测试配置
│   ├── � .-eslintrc.json       # ESLint 规则
│   ├── � u.prettierrc          # Prettier 格式化
│   └── 📄 electron-builder.yml # Electron 打包配置
│
├── � dactabase/                 # 数据库目录
│   └── 📄 schema.sql           # 数据库结构（待创建）
│
├── 📄 package.json              # 项目配置和依赖
├── 📄 .gitignore                # Git 忽略规则
├── 📄 LICENSE                   # MIT 许可证
└── 📄 README.md                 # 项目说明
```

### 目录说明

#### 核心目录
- `src/` - 所有源代码，按前后端分离
- `tests/` - 所有测试文件，按测试类型分类
- `docs/` - 所有项目文档
- `scripts/` - 开发和构建脚本

#### 配置目录
- `.kiro/` - Kiro AI 助手配置
- `config/` - 项目配置文件（TypeScript、Vite、ESLint 等）
- `database/` - 数据库相关文件

---

## 开发规范

### TypeScript 规范

**严格模式**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**命名规范**:
- 组件：`PascalCase`（UserProfile.tsx）
- 函数：`camelCase`（getUserData）
- 常量：`UPPER_SNAKE_CASE`（MAX_FILE_SIZE）
- 类型：`PascalCase`（UserData）
- 接口：`PascalCase`（IUserService）

**注释规范**:
```typescript
/**
 * 获取用户数据
 * @param userId - 用户 ID
 * @returns 用户数据对象
 * @throws {AppError} 当用户不存在时
 */
async function getUserData(userId: string): Promise<UserData> {
  // 实现
}
```

### Git 提交规范

使用 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具

示例：
```
feat: 添加文件树虚拟滚动功能

- 使用 react-window 实现虚拟滚动
- 支持 10,000+ 文件流畅滚动
- 优化内存占用

Closes #123
```

### 代码审查清单

- [ ] 代码通过 TypeScript 检查
- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 Prettier 格式化
- [ ] 所有函数有类型定义
- [ ] 所有公共 API 有 JSDoc 注释
- [ ] 有相应的单元测试
- [ ] 测试覆盖率 > 80%
- [ ] 无 console.log（使用 logger）
- [ ] 错误处理完善

---

## 开发流程

### 环境要求

- **Node.js**: 18.0.0 或更高
- **npm**: 9.0.0 或更高
- **操作系统**: macOS, Windows, Linux

### 核心依赖

**生产依赖**:
- `express` - Web 服务器框架
- `isomorphic-git` - 内置 Git 实现
- `better-sqlite3` - SQLite 数据库
- `chokidar` - 文件监听
- `react` + `react-dom` - UI 框架
- `antd` - UI 组件库
- `zustand` - 状态管理
- `react-window` - 虚拟滚动

**开发依赖**:
- `typescript` - 类型系统
- `vite` - 构建工具
- `vitest` - 测试框架
- `eslint` + `prettier` - 代码质量
- `electron` + `electron-builder` - 桌面应用

### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/steven780-sudo/vibecoding.git
cd vibecoding
git checkout rewrite

# 2. 安装依赖
npm install

# 3. 启动开发环境
npm run dev

# 4. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

### 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:client       # 仅启动前端
npm run dev:server       # 仅启动后端

# 构建
npm run build            # 构建所有
npm run build:client     # 构建前端
npm run build:server     # 构建后端
npm run build:electron   # 构建桌面应用

# 测试
npm run test             # 运行所有测试
npm run test:unit        # 运行单元测试
npm run test:integration # 运行集成测试
npm run test:e2e         # 运行 E2E 测试
npm run test:watch       # 监听模式

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 类型检查

# 其他
npm run clean            # 清理构建文件
npm run docs             # 生成文档
```

---

## 测试策略

### 测试金字塔

```
        /\
       /  \  E2E 测试（10%）
      /────\
     /      \  集成测试（20%）
    /────────\
   /          \  单元测试（70%）
  /────────────\
```

### 单元测试

**工具**: Vitest + Testing Library

**示例**:
```typescript
// src/server/services/git-service.test.ts
import { describe, it, expect } from 'vitest'
import { GitService } from './git-service'

describe('GitService', () => {
  it('should create commit', async () => {
    const service = new GitService()
    const result = await service.createCommit('/path', 'test commit')
    expect(result.success).toBe(true)
  })
})
```

### 集成测试

**工具**: Vitest + Supertest

**示例**:
```typescript
// tests/integration/api.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/server'

describe('API Integration', () => {
  it('POST /api/repository/commit', async () => {
    const response = await request(app)
      .post('/api/repository/commit')
      .send({ path: '/test', message: 'test' })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

### E2E 测试

**工具**: Playwright

**示例**:
```typescript
// tests/e2e/snapshot.spec.ts
import { test, expect } from '@playwright/test'

test('create snapshot', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('text=打开文件夹')
  await page.fill('input[name="message"]', 'test snapshot')
  await page.click('text=创建快照')
  await expect(page.locator('text=创建成功')).toBeVisible()
})
```

---

## 部署方案

### 本地 Web 应用

```bash
# 1. 构建
npm run build

# 2. 启动
npm run start

# 3. 访问
# http://localhost:3000
```

### 云端 Web 应用

**部署到 Vercel**:
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel --prod
```

**部署到 Netlify**:
```bash
# 1. 构建
npm run build:client

# 2. 部署
netlify deploy --prod --dir=dist
```

### 桌面应用

```bash
# 1. 构建
npm run build:electron

# 2. 打包
# macOS: dist/Chronos-1.0.0.dmg
# Windows: dist/Chronos-Setup-1.0.0.exe
```

---

## MCP 工具配置

### 已配置的 MCP 工具

#### 1. Context7 MCP
**用途**: 搜索最新的开发文档和 API 参考

**功能**:
- 搜索 React、TypeScript、Node.js 等官方文档
- 查找最新的 API 用法和示例
- 获取库的最佳实践
- 查询最新版本的特性

**使用场景**:
- 查找 API 文档
- 学习新库的用法
- 解决技术问题
- 获取最新的最佳实践

**示例**:
```typescript
// 可以询问 AI：
// "React 18 的 useTransition 怎么用？"
// "Zustand 的最新 API 是什么？"
// "TypeScript 5.3 有哪些新特性？"
// AI 会使用 Context7 搜索最新文档并给出答案
```

#### 2. Chrome DevTools MCP
**用途**: Chrome 官方浏览器调试和测试工具

**功能**:
- 实时获取 Console 日志（自动捕获错误）
- 监控 Network 请求和响应
- 获取页面性能数据
- 检查 DOM 结构和样式
- 调试 JavaScript 代码
- 分析内存和性能

**使用场景**:
- 实时调试前端问题
- 监控 API 请求
- 分析性能瓶颈
- 查看控制台错误

**优势**:
- ✅ Chrome 官方支持
- ✅ 自动捕获 Console 信息
- ✅ 实时调试能力
- ✅ 完整的 DevTools 功能

**示例**:
```typescript
// AI 可以自动看到你的 Chrome Console 输出：
// 1. 自动捕获 JavaScript 错误
// 2. 监控 API 请求失败
// 3. 查看性能警告
// 4. 分析网络请求
```

**Chrome 版本**: 142.0.7444.60 (arm64)

#### 3. Playwright MCP
**用途**: 跨浏览器自动化测试（补充工具）

**功能**:
- 跨浏览器测试（Chrome、Firefox、Safari）
- 自动化 UI 测试
- 页面截图和录制
- 模拟用户交互

**使用场景**:
- E2E 测试开发
- 跨浏览器兼容性测试
- 自动化测试脚本

**与 Chrome DevTools 的区别**:
- Chrome DevTools: 实时调试，查看 Console
- Playwright: 自动化测试，跨浏览器

**示例**:
```typescript
// 使用 Playwright 进行自动化测试：
// 1. 编写 E2E 测试脚本
// 2. 测试跨浏览器兼容性
// 3. 自动化回归测试
```

#### 4. Memory MCP

**用途**: 基于知识图谱的持久化记忆系统

**功能**:
- 创建和管理实体（entities）
- 建立实体之间的关系（relations）
- 添加观察和笔记（observations）
- 搜索知识图谱
- 持久化存储信息

**使用场景**:
- 记录项目决策和原因
- 存储重要的技术细节
- 建立代码模块之间的关系
- 记录 Bug 和解决方案

**示例**:
```typescript
// AI 可以使用 Memory MCP 来：
// 1. 记住你的编码偏好
// 2. 存储项目的架构决策
// 3. 记录已解决的问题
// 4. 建立模块依赖关系图
```

#### 6. Sequential Thinking MCP
**用途**: 通过思维序列进行动态和反思性问题解决

**功能**:
- 分步骤思考复杂问题
- 动态调整思维路径
- 反思和修正之前的想法
- 生成和验证假设
- 提供详细的推理过程

**使用场景**:
- 解决复杂的架构问题
- 调试难以定位的 Bug
- 设计复杂的算法
- 分析性能瓶颈

**示例**:
```typescript
// AI 可以使用 Sequential Thinking 来：
// 1. 分步骤分析性能问题
// 2. 逐步推导最佳架构方案
// 3. 系统性地排查 Bug
// 4. 验证设计决策的合理性
```

#### 7. Filesystem MCP
**用途**: 增强的文件系统操作

**功能**:
- 读取和写入文件
- 列出目录内容
- 搜索文件
- 获取文件信息

**使用场景**:
- 批量文件操作
- 项目结构分析
- 文件内容搜索

### MCP 配置文件

配置文件位置：`.kiro/settings/mcp.json`

**重新连接 MCP 服务器**:
- 修改配置后，MCP 服务器会自动重新连接
- 或在 Kiro 中打开 "MCP Server" 视图手动重新连接

**查看 MCP 工具**:
- 在 Kiro 命令面板搜索 "MCP"
- 查看可用的 MCP 工具和状态

---

## Agent Hooks

### Hook 1: 保存时自动测试

**配置**: `.kiro/hooks/test-on-save.json`

```json
{
  "name": "test-on-save",
  "trigger": "onSave",
  "filePattern": "**/*.{ts,tsx}",
  "command": "npm run test:related ${file}",
  "description": "保存文件时自动运行相关测试"
}
```

### Hook 2: 提交前质量检查

**配置**: `.kiro/hooks/commit-check.json`

```json
{
  "name": "commit-check",
  "trigger": "manual",
  "steps": [
    {
      "name": "类型检查",
      "command": "npm run type-check"
    },
    {
      "name": "代码检查",
      "command": "npm run lint"
    },
    {
      "name": "运行测试",
      "command": "npm run test"
    },
    {
      "name": "提交代码",
      "command": "git commit"
    }
  ],
  "description": "提交前运行所有质量检查"
}
```

### Hook 3: 版本发布

**配置**: `.kiro/hooks/release.json`

```json
{
  "name": "release",
  "trigger": "manual",
  "steps": [
    {
      "name": "运行测试",
      "command": "npm run test"
    },
    {
      "name": "更新版本",
      "command": "npm version ${version}"
    },
    {
      "name": "生成 CHANGELOG",
      "command": "npm run changelog"
    },
    {
      "name": "构建应用",
      "command": "npm run build"
    },
    {
      "name": "创建 tag",
      "command": "git tag v${version}"
    },
    {
      "name": "推送到远程",
      "command": "git push --tags"
    }
  ],
  "description": "自动化版本发布流程"
}
```

---

## 常见问题

### Q: 如何添加新功能？

A: 
1. 在 `.kiro/specs/chronos-v2/` 创建需求文档
2. 更新 `design.md` 和 `tasks.md`
3. 创建功能分支：`git checkout -b feature/xxx`
4. 开发并编写测试
5. 运行 `npm run commit-check`
6. 提交并创建 PR

### Q: 如何调试？

A:
```bash
# 前端调试
npm run dev:client
# 打开浏览器开发者工具

# 后端调试
npm run dev:server
# 使用 VS Code 调试器

# Electron 调试
npm run dev:electron
# Cmd+Option+I 打开开发者工具
```

### Q: 如何运行测试？

A:
```bash
# 运行所有测试
npm run test

# 运行特定测试
npm run test -- src/server/services/git-service.test.ts

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

---

## 相关文档

### 核心文档
- [需求文档](.kiro/specs/chronos-v2/requirements.md) - 功能需求和验收标准
- [设计文档](.kiro/specs/chronos-v2/design.md) - 架构设计和技术方案
- [任务清单](.kiro/specs/chronos-v2/tasks.md) - 开发任务列表

### 技术文档
- [配置文件说明](docs/CONFIG_GUIDE.md) - 详解所有配置文件的作用
- [依赖说明](docs/DEPENDENCIES.md) - 技术栈和依赖管理
- [API 文档](docs/API.md) - API 接口文档（待创建）
- [用户指南](docs/USER_GUIDE.md) - 用户使用指南（待创建）

### 项目文档
- [项目状态](docs/PROJECT_STATUS.md) - 当前项目状态和进度追踪
- [重写总结](docs/REWRITE_SUMMARY.md) - v2.0 重写项目总结
- [文档索引](docs/README.md) - docs 目录文档索引

---

## 联系方式

- **项目负责人**: sunshunda@gmail.com
- **GitHub**: https://github.com/steven780-sudo/vibecoding
- **许可证**: MIT License

---

**文档版本**: 1.0  
**最后更新**: 2025-11-02  
**维护者**: Chronos Team
