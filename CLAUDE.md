# Chronos v2.0 - 项目总文档

> 本文档是 Chronos v2.0 项目的完整指南，包含需求、架构、开发规范、当前进度和待解决问题。

**项目名称**: Chronos - 本地文件时光机 v2.0  
**创建日期**: 2025-11-02  
**当前分支**: rewrite  
**状态**: 开发中 - 核心功能已完成，正在修复 Bug

---

## 🚨 当前状态和待解决问题

### ✅ 已完成的功能

1. **基础架构**
   - ✅ 前后端分离架构（React + Node.js + Express）
   - ✅ TypeScript 严格模式
   - ✅ 使用 isomorphic-git（完全内置，无需用户安装 Git）
   - ✅ SQLite 数据库（better-sqlite3）
   - ✅ Vite 构建系统

2. **仓库管理**
   - ✅ 初始化仓库
   - ✅ 打开仓库
   - ✅ 最近使用列表
   - ✅ 软删除（从列表移除）
   - ✅ 硬删除（完全移除时光机管理，删除 .git 文件夹）

3. **文件管理**
   - ✅ 文件树展示（树形结构）
   - ✅ 文件状态显示（新增🟢、修改🟡、删除🔴）
   - ✅ 区分"有变动但未保存的文件"和"已追踪的文件"
   - ✅ 文件选择（checkbox）

4. **快照管理**
   - ✅ 创建快照
   - ✅ 查看历史记录
   - ✅ 回滚到指定快照
   - ✅ 历史记录展开/折叠

5. **分支管理**
   - ✅ 创建分支
   - ✅ 切换分支
   - ✅ 合并分支

6. **UI 优化**
   - ✅ 使用说明抽屉
   - ✅ 软件更新说明抽屉
   - ✅ 最近仓库列表（带删除功能）
   - ✅ 两种删除方式（软删除和硬删除）

### 🐛 当前 Bug 和问题

#### 问题 1: 文件计数不准确 ⚠️ **高优先级**

**现象**:
- 状态栏显示"16 个变更"
- "有变动但未保存的文件"显示"共 16 个文件"，但只显示 1 个文件（.gitignore）
- "已追踪的文件"显示 (2)，但下面展开的文件夹里有更多文件

**根本原因**:
- **计数逻辑错误**：当前计数包括了文件夹（directory）
- **应该只统计文件（file），不包括文件夹**

**问题位置**: `src/client/src/pages/RepositoryPage.tsx`

**当前逻辑**:
```typescript
// 错误：changedFiles 和 trackedFiles 包含了文件夹
const changedFiles = useMemo(() => {
  // 递归查找，包括文件夹
  const findChangedFiles = (fileList: FileNode[]): FileNode[] => {
    const result: FileNode[] = []
    for (const file of fileList) {
      if (file.type === 'directory' && file.children) {
        const changedChildren = findChangedFiles(file.children)
        if (changedChildren.length > 0) {
          result.push({ ...file, children: changedChildren }) // ❌ 包括了文件夹
        }
      } else if (file.status) {
        result.push(file) // ✅ 文件
      }
    }
    return result
  }
  return findChangedFiles(files)
}, [files, status])
```

**需要修复**:
1. 添加一个函数来递归统计文件数量（不包括文件夹）
2. 在显示计数时使用这个函数
3. 确保"有变动但未保存的文件"和"已追踪的文件"的计数都正确

**修复方案**:
```typescript
// 递归统计文件数量（不包括文件夹）
const countFiles = (fileList: FileNode[]): number => {
  let count = 0
  for (const file of fileList) {
    if (file.type === 'directory' && file.children) {
      count += countFiles(file.children) // 递归统计子文件
    } else {
      count += 1 // 只统计文件
    }
  }
  return count
}

// 使用
const changedFilesCount = useMemo(() => countFiles(changedFiles), [changedFiles])
const trackedFilesCount = useMemo(() => countFiles(trackedFiles), [trackedFiles])
```

#### 问题 2: 旧仓库显示样式不对

**现象**:
- 新创建的仓库显示正常
- 历史创建的仓库（如"顺达时光机"、"1青海"）显示样式不对
- 可能是浏览器缓存或数据格式不兼容

**临时解决方案**:
1. 使用硬删除功能删除旧仓库记录
2. 重新添加这些文件夹
3. 就会使用最新的样式

**长期解决方案**:
- 添加数据迁移逻辑
- 检测旧版本数据并自动升级

### 📋 接下来要做的工作

#### 立即修复（高优先级）

1. **修复文件计数 Bug** ⚠️
   - 位置：`src/client/src/pages/RepositoryPage.tsx`
   - 添加 `countFiles` 函数
   - 修复"有变动但未保存的文件"计数
   - 修复"已追踪的文件"计数
   - 测试验证

2. **清理旧数据**
   - 提供数据迁移工具
   - 或提示用户删除旧仓库重新添加

#### 功能完善（中优先级）

3. **性能优化**
   - 实现虚拟滚动（react-window）
   - 支持 10,000+ 文件
   - 优化文件扫描性能

4. **错误处理**
   - 完善错误提示
   - 添加错误边界
   - 改进日志记录

5. **测试覆盖**
   - 单元测试覆盖率 > 80%
   - 集成测试
   - E2E 测试

#### 新功能（低优先级）

6. **文件搜索和过滤**
   - 按文件名搜索
   - 按状态过滤
   - 按日期过滤

7. **Electron 桌面应用**
   - 打包为桌面应用
   - 支持 Windows 和 macOS
   - 自动更新

8. **云端 Web 应用**
   - 纯前端实现
   - 使用 File System Access API
   - PWA 支持

---

## 📋 快速导航

- [项目概述](#项目概述)
- [核心需求](#核心需求)
- [技术架构](#技术架构)
- [开发规范](#开发规范)
- [目录结构](#目录结构)
- [开发流程](#开发流程)
- [当前状态和待解决问题](#当前状态和待解决问题)
- [新功能：文件整理助手](#新功能文件整理助手)

## 📎 关键文件索引

### 核心文档
- 📄 [本文档](CLAUDE.md) - 项目总文档
- 📄 [需求文档](.kiro/specs/chronos-v2/requirements.md) - 功能需求和验收标准
- 📄 [设计文档](.kiro/specs/chronos-v2/design.md) - 架构设计和技术方案
- 📄 [任务清单](.kiro/specs/chronos-v2/tasks.md) - 开发任务列表
- 📄 [依赖说明](docs/DEPENDENCIES.md) - 技术栈和依赖管理
- 📄 [项目指南](.kiro/steering/PROJECT_GUIDE.md) - AI 协作指南

### 核心代码文件

**前端**:
- `src/client/src/pages/HomePage.tsx` - 首页（仓库列表）
- `src/client/src/pages/RepositoryPage.tsx` - 仓库页面（⚠️ 需要修复文件计数）
- `src/client/src/components/FileTree.tsx` - 文件树组件
- `src/client/src/components/HistoryViewer.tsx` - 历史记录组件
- `src/client/src/services/api-service.ts` - API 调用服务

**后端**:
- `src/server/index.ts` - 服务器入口
- `src/server/routes/repository.ts` - 仓库 API 路由
- `src/server/services/git-service.ts` - Git 操作服务
- `src/server/services/file-service.ts` - 文件操作服务
- `src/server/services/database-service.ts` - 数据库服务

**共享**:
- `src/shared/types/index.ts` - TypeScript 类型定义
- `src/shared/constants/index.ts` - 常量定义

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

#### 1. 本地 Web 应用（优先级最高）✅ 已实现
- 用户启动本地服务器
- 浏览器访问 `http://localhost:5173`
- 使用 `<input webkitdirectory>` 选择文件夹
- 完整的文件系统访问权限

#### 2. 云端 Web 应用（待实现）
- 用户访问 `https://chronos.app`
- 纯前端应用，无后端
- 使用 File System Access API
- 支持离线使用（PWA）

#### 3. 桌面应用（待实现）
- Electron 打包
- 双击即可运行
- 支持 Windows 和 macOS
- 支持自动更新

### 核心功能

1. **仓库管理**: ✅ 初始化、打开、最近使用列表、软删除、硬删除
2. **快照管理**: ✅ 创建、查看历史、回滚
3. **分支管理**: ✅ 创建、切换、合并
4. **文件管理**: ⚠️ 树状展示、状态显示（需修复计数 Bug）

详细需求见：`.kiro/specs/chronos-v2/requirements.md`

---

## 技术架构

### 技术栈

**前端**:
- React 18 + TypeScript 5
- Ant Design 5（UI 组件）
- Zustand（状态管理）
- Vite（构建工具）
- react-window（虚拟滚动 - 待实现）

**后端**（本地模式）:
- Node.js + TypeScript
- Express（Web 框架）
- better-sqlite3（数据库）
- chokidar（文件监听）

**Git 实现**:
- **isomorphic-git**（完全内置）✅
- 纯 JavaScript 实现，无需用户安装 Git
- 跨平台支持（Windows + macOS + Linux + 浏览器）
- 功能完整，性能足够

**桌面应用**:
- Electron
- electron-builder（打包）

### 数据库结构

**表结构**:
```sql
-- 仓库表
CREATE TABLE repositories (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  currentBranch TEXT,
  isClean BOOLEAN,
  lastOpened DATETIME,
  createdAt DATETIME
);

-- 最近使用表
CREATE TABLE recent_repositories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  opened_at DATETIME NOT NULL,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

-- 设置表
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 文件缓存表
CREATE TABLE file_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT,
  cached_at DATETIME,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);
```

**注意**: 
- ❌ 数据库中**没有** `repository_opens` 表
- ✅ 使用 `recent_repositories` 表来记录打开历史

---

## 目录结构

```
chronos-v2/                        # 项目根目录
│
├── 📁 src/                        # 源代码目录
│   ├── 📁 server/                # Node.js 后端（本地模式）
│   │   ├── 📄 index.ts          # 服务器入口
│   │   ├── 📁 routes/           # API 路由
│   │   │   └── repository.ts   # 仓库操作 API
│   │   ├── 📁 services/         # 业务服务层
│   │   │   ├── git-service.ts  # Git 操作服务
│   │   │   ├── file-service.ts # 文件操作服务
│   │   │   └── database-service.ts # 数据库服务
│   │   └── 📁 utils/            # 工具函数
│   │
│   ├── 📁 client/               # React 前端
│   │   ├── 📁 src/
│   │   │   ├── 📄 App.tsx      # 主应用组件
│   │   │   ├── 📄 main.tsx     # 应用入口
│   │   │   ├── 📁 pages/       # 页面组件
│   │   │   │   ├── HomePage.tsx          # ✅ 首页
│   │   │   │   └── RepositoryPage.tsx    # ⚠️ 仓库页面（需修复）
│   │   │   ├── 📁 components/  # UI 组件
│   │   │   │   ├── FileTree.tsx          # ✅ 文件树
│   │   │   │   ├── HistoryViewer.tsx     # ✅ 历史记录
│   │   │   │   ├── BranchManager.tsx     # ✅ 分支管理
│   │   │   │   ├── SnapshotDialog.tsx    # ✅ 快照对话框
│   │   │   │   ├── HelpDrawer.tsx        # ✅ 帮助抽屉
│   │   │   │   └── ReleaseNotesDrawer.tsx # ✅ 更新说明
│   │   │   ├── 📁 hooks/       # 自定义 Hooks
│   │   │   │   ├── useRepository.ts      # ✅ 仓库操作
│   │   │   │   ├── useSnapshot.ts
│   │   │   │   └── useBranch.ts
│   │   │   ├── 📁 stores/      # Zustand 状态管理
│   │   │   │   ├── repository-store.ts   # ✅ 仓库状态
│   │   │   │   └── ui-store.ts
│   │   │   ├── 📁 services/    # 前端服务
│   │   │   │   └── api-service.ts        # ✅ API 调用
│   │   │   └── 📁 utils/       # 工具函数
│   │   └── 📄 index.html       # HTML 模板
│   │
│   ├── 📁 electron/             # Electron 桌面应用（待实现）
│   │   ├── 📄 main.ts          # 主进程
│   │   └── 📄 preload.ts       # Preload 脚本
│   │
│   └── 📁 shared/               # 前后端共享代码
│       ├── 📁 types/           # TypeScript 类型定义
│       │   └── index.ts        # ✅ 核心类型
│       ├── 📁 constants/       # 常量定义
│       │   └── index.ts        # ✅ 常量
│       └── 📁 utils/           # 共享工具函数
│
├── 📁 tests/                    # 测试目录（待完善）
│   ├── 📁 unit/                # 单元测试
│   ├── 📁 integration/         # 集成测试
│   └── 📁 e2e/                 # E2E 测试
│
├── 📁 .kiro/                    # Kiro AI 配置
│   ├── 📁 specs/               # 功能规格文档
│   │   └── 📁 chronos-v2/
│   │       ├── 📄 requirements.md    # ✅ 需求文档
│   │       ├── 📄 design.md          # ✅ 设计文档
│   │       └── 📄 tasks.md           # ✅ 任务清单
│   └── 📁 steering/            # AI 执行规则
│       └── 📄 PROJECT_GUIDE.md       # ✅ 项目指南
│
├── 📁 docs/                     # 项目文档
│   ├── 📄 DEPENDENCIES.md      # ✅ 依赖说明
│   ├── 📄 PROJECT_STATUS.md    # ✅ 项目状态
│   └── 📄 REWRITE_SUMMARY.md   # ✅ 重写总结
│
├── 📁 database/                 # 数据库目录
│   └── 📄 chronos.db           # ✅ SQLite 数据库
│
├── 📄 CLAUDE.md                 # ✅ 本文档
├── 📄 package.json              # ✅ 项目配置
└── 📄 README.md                 # ✅ 项目说明
```

---

## 开发规范

### 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发环境
npm run dev

# 3. 访问应用
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

# 测试
npm run test             # 运行所有测试
npm run test:watch       # 监听模式

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 类型检查
```

---

## 重要提示

### 给 Claude Code 的说明

1. **立即修复的 Bug**:
   - 文件计数不准确（`src/client/src/pages/RepositoryPage.tsx`）
 /Users/sunshunda/Desktop/DailyLearning/github/vibecoding/img-screenshot/image.png

2. **代码规范**:
   - 使用 TypeScript 严格模式
   - 所有函数必须有类型定义
   - 使用 logger 而不是 console.log
   - 错误处理要完善

3. **测试要求**:
   - 修复后必须测试
   - 确保计数正确
   - 验证树形结构正常显示

4. **数据库注意事项**:
   - 数据库中没有 `repository_opens` 表
   - 使用 `recent_repositories` 表

5. **Git 实现**:
   - 使用 isomorphic-git，不是系统 Git CLI
   - 完全内置，无需用户安装

---

---

## 新功能：文件整理助手

### 📦 功能概述

文件整理助手是Chronos v2.0的一个新功能模块，旨在帮助用户清理和整理历史存量文件。

**核心价值**：
- 解决存量文件混乱问题（多个版本散落各处）
- 智能识别相似文件（基于文件名、大小、时间）
- 可视化管理和整理流程
- 无缝接入Chronos版本管理

### 🎯 用户场景

用户有很多历史文件，如：
- `青海省数字政府项目V1.0_0929(初稿).docx`
- `青海省数字政府项目V1.0_1009(过程稿).docx`
- `青海省数字政府项目V1.1_1025(终稿)(新).docx`

通过文件整理助手，用户可以：
1. 扫描文件夹，自动识别相似文件
2. 选择要保留的版本
3. 整理到新位置
4. 删除不需要的旧版本
5. 一键创建时光库开始版本管理

### 📚 相关文档

- **功能规格**: `.kiro/specs/file-organizer/`
  - [README.md](.kiro/specs/file-organizer/README.md) - 功能概述和快速导航
  - [requirements.md](.kiro/specs/file-organizer/requirements.md) - 详细需求文档
  - [design.md](.kiro/specs/file-organizer/design.md) - 架构设计和技术方案
  - [tasks.md](.kiro/specs/file-organizer/tasks.md) - 开发任务清单
  - [QUICK_REFERENCE.md](.kiro/specs/file-organizer/QUICK_REFERENCE.md) - 快速参考

### 🚀 开发状态

- ✅ 需求文档已完成
- ✅ 设计文档已完成
- ✅ 任务清单已完成
- ⏸️ 等待开始实现

### 💡 如何开始

告诉Claude：
```
我想开始实现文件整理助手的任务1
```

或查看快速参考：
```bash
cat .kiro/specs/file-organizer/QUICK_REFERENCE.md
```

---

**文档版本**: 2.1  
**最后更新**: 2025-11-03  
**维护者**: Chronos Team  
**下一步**: 修复文件计数 Bug / 开始实现文件整理助手
