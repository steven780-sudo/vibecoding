# Chronos v2.0 - 需求文档

**项目名称**: Chronos - 本地文件时光机 v2.0  
**创建日期**: 2025-11-02  
**状态**: 需求定义阶段  
**分支**: rewrite

---

## 📋 项目概述

### 项目背景

Chronos 是一款为非技术用户设计的图形化 Git 版本管理工具，帮助用户：
- 告别混乱的文件命名（"报告_最终版_v3_真正最终版.doc"）
- 提供时光穿梭能力，随时回到任何历史版本
- 通过分支功能安全地尝试新想法
- 完全本地运行，零云依赖

### v1.x 版本问题

**核心问题**：
1. ❌ Tauri 框架不稳定（路径解析、进程启动频繁出错）
2. ❌ Python 后端性能不足
3. ❌ 代码质量差，缺乏架构设计
4. ❌ 错误处理混乱（"资源不存在"bug 反复出现）
5. ❌ 仅支持 macOS，跨平台困难

### v2.0 重写目标

**P0 - 必须实现**：
1. ✅ 三种运行模式：本地 Web + 云端 Web + 桌面应用
2. ✅ 稳定的技术栈（放弃 Tauri 和 Python）
3. ✅ 高性能（支持 10,000+ 文件）
4. ✅ 高代码质量（完善测试、清晰架构）
5. ✅ 跨平台（Windows + macOS）

---

## 🎯 核心需求

### 需求 1: 三种运行模式

**用户故事**: 作为用户，我希望可以选择不同的使用方式，以适应不同的场景。

#### 模式 1: 本地 Web 应用（优先级最高）

**场景**: 个人用户在自己电脑上使用

**实现方式**:
- 用户启动本地服务器（Node.js）
- 浏览器访问 `http://localhost:3000`
- 点击"打开文件夹"按钮
- 使用 `<input webkitdirectory>` 唤起系统文件管理器
- 选择文件夹后，后端直接访问文件系统
- 无需授权，完整的读写权限

**验收标准**:
1. WHEN 用户启动应用，THE 应用 SHALL 在 3 秒内启动完成
2. WHEN 用户点击"打开文件夹"，THE 应用 SHALL 唤起系统文件管理器
3. WHEN 用户选择文件夹，THE 应用 SHALL 无需额外授权即可访问
4. THE 应用 SHALL 支持所有 Git 操作（init, commit, log, branch, merge）

#### 模式 2: 云端 Web 应用

**场景**: 用户想快速体验，或分享给他人使用

**实现方式**:
- 用户访问 `https://chronos.app`（或自定义域名）
- 纯前端应用，无后端
- 使用 File System Access API 访问本地文件
- 使用 isomorphic-git 在浏览器中运行 Git
- 数据存储在 IndexedDB

**验收标准**:
1. WHEN 用户访问网站，THE 应用 SHALL 在 2 秒内加载完成
2. WHEN 用户点击"打开文件夹"，THE 应用 SHALL 请求文件系统访问权限
3. WHEN 用户授权后，THE 应用 SHALL 可以读写文件
4. THE 应用 SHALL 支持离线使用（PWA）

#### 模式 3: 桌面应用

**场景**: 用户不想运行本地服务器，需要独立应用

**实现方式**:
- 使用 Electron 打包
- 内置 Node.js 后端
- 双击即可运行
- 支持 Windows 和 macOS

**验收标准**:
1. WHEN 用户双击应用图标，THE 应用 SHALL 在 3 秒内启动
2. THE 应用 SHALL 无需安装 Node.js 或其他依赖
3. THE 应用 SHALL 支持 Windows 10+ 和 macOS 10.13+
4. THE 应用 SHALL 支持自动更新

---


### 需求 2: 技术栈选择

**用户故事**: 作为开发者，我需要选择稳定、高性能的技术栈，确保应用质量。

#### 前端技术栈

**框架**: React 18 + TypeScript 5
- 成熟稳定，生态丰富
- TypeScript 严格模式，类型安全
- 组件化开发，易于维护

**UI 库**: Ant Design 5
- 企业级 UI 组件库
- 中文友好
- 组件丰富，开箱即用

**状态管理**: Zustand
- 轻量级（~1KB）
- API 简单
- TypeScript 支持好
- 性能优秀

**构建工具**: Vite
- 极速的开发服务器
- 快速的生产构建
- 开箱即用的 TypeScript 支持

**性能优化**:
- react-window（虚拟滚动，处理大量文件）
- React.memo（避免不必要的重渲染）
- Code Splitting（按需加载）

#### 后端技术栈

**语言**: Node.js + TypeScript
- 与前端统一技术栈
- 异步 I/O，适合文件操作
- 性能足够好（V8 引擎）

**框架**: Express
- 最成熟的 Node.js Web 框架
- 中间件生态丰富
- 简单易用

**Git 实现**: 
- 本地模式：调用系统 Git CLI（性能最好）
- 云端模式：isomorphic-git（纯 JS，可在浏览器运行）

**数据库**: SQLite (better-sqlite3)
- 轻量级嵌入式数据库
- 高性能（同步 API）
- 用于存储：最近使用列表、文件缓存、配置

**文件监听**: chokidar
- 跨平台文件系统监听
- 高性能，低 CPU 占用
- 自动检测文件变更

#### 桌面应用

**框架**: Electron
- 最成熟稳定的桌面框架
- 跨平台支持最好
- 生态丰富，问题容易解决

**打包**: electron-builder
- 支持 Windows 和 macOS
- 支持代码签名
- 支持自动更新

#### 验收标准

1. THE 应用 SHALL 使用 TypeScript 严格模式
2. THE 代码 SHALL 通过 ESLint 和 Prettier 检查
3. THE 应用 SHALL 有完整的类型定义
4. THE 应用 SHALL 支持 Windows 和 macOS

---

### 需求 3: 核心功能（保留 v1.x 所有功能）

**用户故事**: 作为用户，我希望 v2.0 保留所有 v1.x 的功能，并且体验更好。

#### 3.1 仓库管理

**功能列表**:
1. 初始化时光机文件夹
2. 打开已有时光机文件夹
3. 最近使用列表（最多 10 个）
4. 智能识别（自动判断是否已初始化）
5. 返回首页（切换文件夹）

**验收标准**:
1. WHEN 用户选择文件夹，THE 应用 SHALL 自动检测是否已初始化
2. WHEN 文件夹未初始化，THE 应用 SHALL 提示用户初始化
3. WHEN 文件夹已初始化，THE 应用 SHALL 直接打开
4. THE 应用 SHALL 记住最近使用的 10 个文件夹
5. WHEN 用户点击"返回首页"，THE 应用 SHALL 显示确认对话框

#### 3.2 快照管理

**功能列表**:
1. 创建快照（可选择文件）
2. 查看快照历史（时间线展示）
3. 查看快照详情（文件列表、作者、时间）
4. 回滚到指定快照
5. 文件状态标识（🟢新增 🟡修改 🔴删除）

**验收标准**:
1. WHEN 用户创建快照，THE 应用 SHALL 显示文件选择对话框
2. WHEN 用户未选择文件，THE 应用 SHALL 默认包含所有变更文件
3. WHEN 用户查看历史，THE 应用 SHALL 按时间倒序显示
4. WHEN 用户回滚版本，THE 应用 SHALL 显示确认对话框
5. THE 应用 SHALL 在回滚后自动刷新文件列表

#### 3.3 分支管理

**功能列表**:
1. 创建分支（副本）
2. 切换分支
3. 合并分支
4. 查看分支列表
5. 显示当前分支

**验收标准**:
1. WHEN 用户创建分支，THE 应用 SHALL 自动切换到新分支
2. WHEN 用户切换分支，THE 应用 SHALL 更新文件列表
3. WHEN 用户合并分支，THE 应用 SHALL 检测冲突
4. WHEN 存在冲突，THE 应用 SHALL 显示冲突文件列表
5. THE 应用 SHALL 在分支列表中高亮当前分支

#### 3.4 文件管理

**功能列表**:
1. 文件树状展示（支持多层文件夹）
2. 展开/折叠文件夹
3. 文件搜索和过滤
4. 系统文件自动忽略（.DS_Store, .git 等）
5. 文件状态实时更新

**验收标准**:
1. WHEN 文件夹包含 10,000 个文件，THE 应用 SHALL 在 2 秒内完成扫描
2. WHEN 用户滚动文件列表，THE 应用 SHALL 保持 60 FPS 流畅度
3. THE 应用 SHALL 使用虚拟滚动优化性能
4. THE 应用 SHALL 自动过滤系统文件
5. WHEN 文件变更，THE 应用 SHALL 自动更新状态

---

### 需求 4: 性能要求

**用户故事**: 作为用户，当我的文件夹包含大量文件时，我希望应用仍然快速响应。

#### 性能指标

**启动性能**:
- 应用启动时间 < 3 秒
- 首屏渲染时间 < 1 秒

**文件扫描性能**:
- 扫描 1,000 文件 < 200ms
- 扫描 10,000 文件 < 2 秒
- 扫描 100,000 文件 < 20 秒

**UI 响应性能**:
- 按钮点击响应 < 100ms
- 文件列表滚动 60 FPS
- 搜索结果显示 < 500ms

**内存占用**:
- 空闲状态 < 200MB
- 10,000 文件 < 500MB
- 100,000 文件 < 1GB

#### 性能优化策略

**文件扫描优化**:
1. 使用 Worker 线程进行文件扫描
2. 增量扫描，只扫描变更的文件
3. 使用 chokidar 监听文件变化
4. 缓存文件树结构（SQLite）

**UI 渲染优化**:
1. 虚拟滚动（react-window）
2. 懒加载，按需渲染
3. 防抖和节流
4. React.memo 避免不必要的重渲染

**数据处理优化**:
1. 使用 SQLite 缓存数据
2. 分页加载历史记录
3. 压缩存储大数据
4. LRU Cache 内存缓存

#### 验收标准

1. THE 应用 SHALL 在 3 秒内启动完成
2. WHEN 扫描 10,000 文件，THE 应用 SHALL 在 2 秒内完成
3. WHEN 用户滚动文件列表，THE 应用 SHALL 保持 60 FPS
4. THE 应用 SHALL 在处理大量文件时内存占用不超过 1GB

---


### 需求 5: 代码质量要求

**用户故事**: 作为开发者，我需要确保代码质量高、鲁棒性强、易于维护。

#### 架构设计

**分层架构**:
```
┌─────────────────────────────────────┐
│  Presentation Layer (UI)            │
│  - React Components                 │
│  - Ant Design                       │
├─────────────────────────────────────┤
│  Application Layer (Business Logic) │
│  - Services                         │
│  - Stores (Zustand)                 │
├─────────────────────────────────────┤
│  Domain Layer (Core Logic)          │
│  - Entities                         │
│  - Use Cases                        │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  - Git Wrapper                      │
│  - File System                      │
│  - Database (SQLite)                │
└─────────────────────────────────────┘
```

**设计原则**:
1. 单一职责原则（SRP）
2. 开闭原则（OCP）
3. 依赖倒置原则（DIP）
4. 接口隔离原则（ISP）

#### 代码规范

**TypeScript**:
- 严格模式（strict: true）
- 所有函数有类型定义
- 所有公共 API 有 JSDoc 注释
- 禁止使用 any（除非必要）

**命名规范**:
- 组件：PascalCase（UserProfile.tsx）
- 函数：camelCase（getUserData）
- 常量：UPPER_SNAKE_CASE（MAX_FILE_SIZE）
- 类型：PascalCase（UserData）

**文件组织**:
- 每个文件 < 300 行
- 每个函数 < 50 行
- 相关代码放在同一目录

#### 测试要求

**测试覆盖率**:
- 总体覆盖率 > 80%
- 核心业务逻辑 > 90%
- UI 组件 > 70%

**测试类型**:
1. 单元测试（Vitest）
   - 测试独立函数和类
   - 测试边界条件
   - 测试错误处理

2. 集成测试（Vitest）
   - 测试 API 端点
   - 测试数据库操作
   - 测试文件系统操作

3. E2E 测试（Playwright）
   - 测试完整用户流程
   - 测试跨浏览器兼容性

**测试策略**:
- 每个新功能必须有测试
- 每个 Bug 修复必须有回归测试
- CI/CD 自动运行测试

#### 错误处理

**错误处理原则**:
1. 所有异步操作必须有 try-catch
2. 所有用户输入必须验证
3. 所有错误必须有友好提示
4. 所有错误必须记录日志

**错误类型**:
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
  }
}

// 使用示例
throw new AppError(
  'REPO_NOT_FOUND',
  '仓库不存在',
  { path: '/path/to/repo' }
)
```

#### 验收标准

1. THE 代码 SHALL 通过 TypeScript 严格模式检查
2. THE 代码 SHALL 通过 ESLint 检查（0 errors, 0 warnings）
3. THE 代码 SHALL 通过 Prettier 格式化
4. THE 测试覆盖率 SHALL > 80%
5. THE 所有公共 API SHALL 有 JSDoc 注释

---

### 需求 6: 自动化流程

**用户故事**: 作为开发者，我希望有自动化的测试和提交流程，确保代码质量。

#### Hook 1: 保存时自动测试

**触发时机**: 保存 `.ts` 或 `.tsx` 文件时

**执行动作**:
1. 运行相关文件的单元测试
2. 显示测试结果
3. 如果测试失败，显示错误信息

**配置文件**: `.kiro/hooks/test-on-save.json`

**验收标准**:
1. WHEN 开发者保存代码文件，THE Hook SHALL 自动运行相关测试
2. WHEN 测试通过，THE Hook SHALL 显示绿色提示
3. WHEN 测试失败，THE Hook SHALL 显示失败原因
4. THE Hook SHALL 在 5 秒内完成

#### Hook 2: 提交前质量检查

**触发时机**: 手动触发（按钮或命令）

**执行动作**:
1. 运行所有单元测试
2. 运行 TypeScript 类型检查
3. 运行 ESLint 检查
4. 运行 Prettier 格式化检查
5. 如果全部通过，提示用户输入 commit message
6. 执行 git commit
7. 询问是否推送到远程

**配置文件**: `.kiro/hooks/commit-check.json`

**验收标准**:
1. THE Hook SHALL 在提交前运行所有质量检查
2. WHEN 检查失败，THE Hook SHALL 阻止提交并显示错误
3. WHEN 检查通过，THE Hook SHALL 提示用户输入 commit message
4. THE Hook SHALL 支持推送到远程仓库

#### Hook 3: 版本发布流程

**触发时机**: 手动触发（按钮或命令）

**执行动作**:
1. 运行完整测试套件
2. 更新版本号（package.json）
3. 生成 CHANGELOG
4. 创建 Git tag
5. 构建应用（本地 Web + 云端 Web + 桌面应用）
6. 推送到远程

**配置文件**: `.kiro/hooks/release.json`

**验收标准**:
1. THE Hook SHALL 自动化整个发布流程
2. THE Hook SHALL 生成符合规范的 CHANGELOG
3. THE Hook SHALL 创建正确的 Git tag
4. THE Hook SHALL 构建所有版本的应用

---

### 需求 7: 用户体验

**用户故事**: 作为用户，我希望应用界面友好、操作简单、提示清晰。

#### 界面设计

**布局**:
```
┌─────────────────────────────────────────────┐
│  Header: Chronos - 文件时光机                │
│  [返回首页] [刷新] [创建快照] [使用说明]     │
├──────────────┬──────────────────────────────┤
│  左侧面板     │  右侧面板                     │
│  (40%)       │  (60%)                       │
│              │                              │
│  文件夹状态   │  历史记录                     │
│  - 当前分支   │  - 快照时间线                 │
│  - 待保存文件 │  - 展开查看详情               │
│  - 文件树     │  - 回滚按钮                   │
│              │                              │
│  分支管理     │                              │
│  - 分支列表   │                              │
│  - 创建分支   │                              │
│  - 切换分支   │                              │
│  - 合并分支   │                              │
└──────────────┴──────────────────────────────┘
```

**友好术语**:
- 仓库 → 时光机文件夹
- 提交 → 快照/备份
- 分支 → 副本
- 回滚 → 恢复
- 合并 → 合并副本

#### 交互设计

**操作反馈**:
- 所有操作有 Loading 状态
- 所有操作有成功/失败提示
- 危险操作有确认对话框

**错误提示**:
- 错误信息清晰易懂
- 提供解决方案
- 避免技术术语

**帮助系统**:
- 使用说明（右侧抽屉）
- 软件更新说明
- 常见问题解答

#### 验收标准

1. THE 应用 SHALL 使用中文界面
2. THE 应用 SHALL 使用友好术语（避免技术术语）
3. THE 所有操作 SHALL 有明确的反馈
4. THE 危险操作 SHALL 有确认对话框
5. THE 应用 SHALL 提供完整的使用说明

---

## 📊 技术架构总结

### 目录结构

```
chronos-v2/
├── src/
│   ├── server/                     # Node.js 后端（本地模式）
│   │   ├── index.ts               # 服务器入口
│   │   ├── routes/                # API 路由
│   │   ├── services/              # 业务服务
│   │   │   ├── git-service.ts    # Git 操作
│   │   │   ├── file-service.ts   # 文件操作
│   │   │   └── db-service.ts     # 数据库操作
│   │   └── utils/                 # 工具函数
│   │
│   ├── client/                    # React 前端
│   │   ├── src/
│   │   │   ├── App.tsx           # 主应用
│   │   │   ├── pages/            # 页面
│   │   │   ├── components/       # UI 组件
│   │   │   ├── hooks/            # 自定义 Hooks
│   │   │   ├── stores/           # 状态管理
│   │   │   ├── services/         # 前端服务
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
│       ├── constants/            # 常量
│       └── utils/                # 工具函数
│
├── tests/                         # 测试
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── e2e/                      # E2E 测试
│
├── .kiro/                         # Kiro 配置
│   ├── hooks/                    # Agent Hooks
│   │   ├── test-on-save.json
│   │   ├── commit-check.json
│   │   └── release.json
│   ├── specs/                    # 功能规格
│   └── steering/                 # AI 执行规则
│
├── docs/                          # 文档
│   └── CLAUDE.md                 # 项目总文档
│
├── scripts/                       # 脚本
│   ├── dev.js                    # 开发脚本
│   └── build.js                  # 构建脚本
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ✅ 验收标准总结

### 功能完整性
- [ ] 支持三种运行模式（本地 Web + 云端 Web + 桌面应用）
- [ ] 保留所有 v1.x 功能
- [ ] 支持 Windows 和 macOS

### 性能指标
- [ ] 启动时间 < 3 秒
- [ ] 扫描 10,000 文件 < 2 秒
- [ ] UI 响应 < 100ms
- [ ] 内存占用 < 1GB（100,000 文件）

### 代码质量
- [ ] 测试覆盖率 > 80%
- [ ] 无 TypeScript 错误
- [ ] 通过所有 ESLint 检查
- [ ] 所有公共 API 有文档

### 自动化
- [ ] 保存时自动测试
- [ ] 提交前质量检查
- [ ] 版本发布自动化

---

**文档版本**: 1.0  
**创建日期**: 2025-11-02  
**作者**: Kiro AI Assistant  
**审核状态**: 待审核
