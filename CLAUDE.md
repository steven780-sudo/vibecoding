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
- 本地模式：系统 Git CLI
- 云端模式：isomorphic-git

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
chronos-v2/
├── src/
│   ├── server/                     # Node.js 后端（本地模式）
│   │   ├── index.ts               # 服务器入口
│   │   ├── routes/                # API 路由
│   │   │   ├── repository.ts     # 仓库操作
│   │   │   ├── snapshot.ts       # 快照操作
│   │   │   ├── branch.ts         # 分支操作
│   │   │   └── file.ts           # 文件操作
│   │   ├── services/              # 业务服务
│   │   │   ├── git-service.ts    # Git 操作
│   │   │   ├── file-service.ts   # 文件操作
│   │   │   ├── db-service.ts     # 数据库操作
│   │   │   └── cache-service.ts  # 缓存服务
│   │   ├── workers/               # Worker 线程
│   │   │   └── file-scanner.ts   # 文件扫描
│   │   └── utils/                 # 工具函数
│   │
│   ├── client/                    # React 前端
│   │   ├── src/
│   │   │   ├── App.tsx           # 主应用
│   │   │   ├── pages/            # 页面
│   │   │   │   ├── HomePage.tsx
│   │   │   │   └── RepositoryPage.tsx
│   │   │   ├── components/       # UI 组件
│   │   │   │   ├── FileTree/
│   │   │   │   ├── HistoryViewer/
│   │   │   │   ├── BranchManager/
│   │   │   │   └── SnapshotDialog/
│   │   │   ├── hooks/            # 自定义 Hooks
│   │   │   │   ├── useRepository.ts
│   │   │   │   ├── useSnapshot.ts
│   │   │   │   └── useBranch.ts
│   │   │   ├── stores/           # 状态管理
│   │   │   │   ├── repository-store.ts
│   │   │   │   ├── ui-store.ts
│   │   │   │   └── settings-store.ts
│   │   │   ├── services/         # 前端服务
│   │   │   │   ├── api-service.ts
│   │   │   │   └── storage-service.ts
│   │   │   └── utils/            # 工具函数
│   │   ├── index.html
│   │   └── main.tsx
│   │
│   ├── electron/                  # Electron 桌面应用
│   │   ├── main.ts               # 主进程
│   │   ├── preload.ts            # Preload 脚本
│   │   └── builder.yml           # 打包配置
│   │
│   └── shared/                    # 共享代码
│       ├── types/                # TypeScript 类型
│       │   ├── repository.ts
│       │   ├── snapshot.ts
│       │   ├── branch.ts
│       │   └── api.ts
│       ├── constants/            # 常量
│       │   └── index.ts
│       └── utils/                # 工具函数
│           ├── path.ts
│           ├── date.ts
│           └── validation.ts
│
├── tests/                         # 测试
│   ├── unit/                     # 单元测试
│   │   ├── server/
│   │   └── client/
│   ├── integration/              # 集成测试
│   └── e2e/                      # E2E 测试
│
├── .kiro/                         # Kiro 配置
│   ├── hooks/                    # Agent Hooks
│   │   ├── test-on-save.json
│   │   ├── commit-check.json
│   │   └── release.json
│   ├── specs/                    # 功能规格
│   │   └── chronos-v2/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/                 # AI 执行规则
│
├── docs/                          # 文档
│   ├── CLAUDE.md                 # 本文档
│   ├── API.md                    # API 文档
│   └── USER_GUIDE.md             # 用户指南
│
├── scripts/                       # 脚本
│   ├── dev.js                    # 开发脚本
│   ├── build.js                  # 构建脚本
│   └── test.js                   # 测试脚本
│
├── database/                      # 数据库
│   └── schema.sql                # 数据库结构
│
├── project_old/                   # 旧项目文件
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

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

- Node.js 18+
- npm 9+
- Git 2.30+

### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/chronos-v2.git
cd chronos-v2

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

- [需求文档](.kiro/specs/chronos-v2/requirements.md)
- [设计文档](.kiro/specs/chronos-v2/design.md)
- [任务清单](.kiro/specs/chronos-v2/tasks.md)
- [API 文档](docs/API.md)
- [用户指南](docs/USER_GUIDE.md)

---

## 联系方式

- **项目负责人**: sunshunda@gmail.com
- **GitHub**: https://github.com/steven780-sudo/vibecoding
- **许可证**: MIT License

---

**文档版本**: 1.0  
**最后更新**: 2025-11-02  
**维护者**: Chronos Team
