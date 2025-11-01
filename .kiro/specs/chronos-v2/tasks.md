# Chronos v2.0 - 任务清单

**项目名称**: Chronos - 本地文件时光机 v2.0  
**创建日期**: 2025-11-02  
**状态**: 待开始

---

## 📋 任务概述

本文档列出 Chronos v2.0 的所有开发任务，按优先级和依赖关系组织。

### 开发阶段

1. **阶段 1**: 项目搭建和基础设施（1-2 天）
2. **阶段 2**: 核心功能开发（3-5 天）
3. **阶段 3**: UI 开发（2-3 天）
4. **阶段 4**: 性能优化和测试（1-2 天）
5. **阶段 5**: 打包和部署（1 天）

---

## 阶段 1: 项目搭建和基础设施

### 1.1 项目初始化

- [ ] 1.1.1 创建项目目录结构
  - 创建 `src/server/`, `src/client/`, `src/shared/` 等目录
  - 创建 `tests/`, `docs/`, `scripts/` 目录
  - _需求: requirements.md 第 5 节_

- [ ] 1.1.2 配置 TypeScript
  - 创建 `tsconfig.json`（严格模式）
  - 配置路径别名（@/）
  - 配置编译选项
  - _需求: requirements.md 第 5 节_

- [ ] 1.1.3 配置构建工具
  - 配置 Vite（前端）
  - 配置 ts-node（后端）
  - 配置 nodemon（开发热重载）
  - _需求: requirements.md 第 2 节_

- [ ] 1.1.4 配置代码质量工具
  - 配置 ESLint
  - 配置 Prettier
  - 配置 Husky（Git hooks）
  - 配置 lint-staged
  - _需求: requirements.md 第 5 节_

### 1.2 测试环境搭建

- [ ] 1.2.1 配置 Vitest
  - 创建 `vitest.config.ts`
  - 配置测试环境
  - 配置覆盖率报告
  - _需求: requirements.md 第 5 节_

- [ ] 1.2.2 配置 Playwright
  - 安装 Playwright
  - 配置浏览器
  - 创建测试脚本
  - _需求: requirements.md 第 5 节_

- [ ] 1.2.3 创建测试工具函数
  - 创建测试仓库工具
  - 创建 Mock 数据
  - 创建测试辅助函数
  - _需求: requirements.md 第 5 节_

### 1.3 基础设施

- [ ] 1.3.1 配置数据库
  - 创建 SQLite 数据库
  - 创建数据库 schema
  - 创建数据库服务
  - _需求: design.md 数据库设计_

- [ ] 1.3.2 配置日志系统
  - 创建 Logger 工具
  - 配置日志级别
  - 配置日志输出
  - _需求: requirements.md 第 5 节_

- [ ] 1.3.3 配置错误处理
  - 创建 AppError 类
  - 创建错误码常量
  - 创建错误处理中间件
  - _需求: design.md 错误处理_

---

## 阶段 2: 核心功能开发

### 2.1 Git 服务层

- [ ] 2.1.1 集成 isomorphic-git
  - 安装 isomorphic-git 依赖
  - 配置 Node.js fs 适配器
  - 配置浏览器 LightningFS 适配器（云端模式）
  - 编写测试验证 Git 操作
  - _需求: requirements.md 第 2 节_

- [ ] 2.1.2 实现 GitService 基础功能
  - 实现 `init()` 方法（使用 isomorphic-git）
  - 实现 `getStatus()` 方法
  - 实现 `getFiles()` 方法
  - 创建默认 .gitignore
  - 编写单元测试
  - _需求: requirements.md 第 3.1 节_

- [ ] 2.1.3 实现快照管理
  - 实现 `createCommit()` 方法（使用 isomorphic-git）
  - 实现 `getLog()` 方法
  - 实现 `checkout()` 方法
  - 编写单元测试
  - _需求: requirements.md 第 3.2 节_

- [ ] 2.1.4 实现分支管理
  - 实现 `getBranches()` 方法（使用 isomorphic-git）
  - 实现 `createBranch()` 方法
  - 实现 `switchBranch()` 方法
  - 实现 `mergeBranch()` 方法
  - 实现冲突检测
  - 编写单元测试
  - _需求: requirements.md 第 3.3 节_

### 2.2 文件服务层

- [ ] 2.2.1 实现 FileService
  - 实现 `scanDirectory()` 方法
  - 实现 `watchDirectory()` 方法
  - 实现系统文件过滤
  - 编写单元测试
  - _需求: requirements.md 第 3.4 节_

- [ ] 2.2.2 实现文件树构建
  - 实现树结构构建算法
  - 实现树节点展开/折叠
  - 实现文件选择逻辑
  - 编写单元测试
  - _需求: requirements.md 第 3.4 节_

### 2.3 数据库服务层

- [ ] 2.3.1 实现 DatabaseService
  - 实现仓库 CRUD 操作
  - 实现最近使用列表
  - 实现文件缓存
  - 编写单元测试
  - _需求: design.md 数据库设计_

### 2.4 后端 API

- [ ] 2.4.1 实现仓库 API
  - `POST /api/repository/init`
  - `POST /api/repository/open`
  - `GET /api/repository/status`
  - `GET /api/repository/files`
  - 编写集成测试
  - _需求: requirements.md 第 3.1 节_

- [ ] 2.4.2 实现快照 API
  - `POST /api/repository/commit`
  - `GET /api/repository/log`
  - `POST /api/repository/checkout`
  - 编写集成测试
  - _需求: requirements.md 第 3.2 节_

- [ ] 2.4.3 实现分支 API
  - `GET /api/repository/branches`
  - `POST /api/repository/branch`
  - `POST /api/repository/switch`
  - `POST /api/repository/merge`
  - 编写集成测试
  - _需求: requirements.md 第 3.3 节_

---

## 阶段 3: UI 开发

### 3.1 基础组件

- [ ] 3.1.1 创建布局组件
  - Header 组件
  - LeftPanel 组件
  - RightPanel 组件
  - 响应式布局
  - _需求: design.md 组件设计_

- [ ] 3.1.2 创建通用组件
  - Button 组件
  - Input 组件
  - Modal 组件
  - Message 组件
  - _需求: requirements.md 第 7 节_

### 3.2 页面组件

- [ ] 3.2.1 实现 HomePage
  - 最近使用列表
  - 打开文件夹按钮
  - 使用说明
  - 编写组件测试
  - _需求: requirements.md 第 3.1 节_

- [ ] 3.2.2 实现 RepositoryPage
  - 页面布局
  - 数据加载
  - 错误处理
  - 编写组件测试
  - _需求: requirements.md 第 3 节_

### 3.3 功能组件

- [ ] 3.3.1 实现 FileTree 组件
  - 树状结构展示
  - 展开/折叠功能
  - 文件选择功能
  - 虚拟滚动优化
  - 编写组件测试
  - _需求: requirements.md 第 3.4 节_

- [ ] 3.3.2 实现 HistoryViewer 组件
  - 时间线展示
  - 快照详情
  - 回滚功能
  - 编写组件测试
  - _需求: requirements.md 第 3.2 节_

- [ ] 3.3.3 实现 BranchManager 组件
  - 分支列表
  - 创建分支
  - 切换分支
  - 合并分支
  - 编写组件测试
  - _需求: requirements.md 第 3.3 节_

- [ ] 3.3.4 实现 SnapshotDialog 组件
  - 文件选择
  - 消息输入
  - 创建快照
  - 编写组件测试
  - _需求: requirements.md 第 3.2 节_

### 3.4 状态管理

- [ ] 3.4.1 实现 RepositoryStore
  - 仓库状态管理
  - 文件状态管理
  - 操作方法
  - 编写测试
  - _需求: design.md 状态管理_

- [ ] 3.4.2 实现 UIStore
  - UI 状态管理
  - Loading 状态
  - Error 状态
  - 编写测试
  - _需求: design.md 状态管理_

### 3.5 自定义 Hooks

- [ ] 3.5.1 实现 useRepository Hook
  - 仓库操作封装
  - 错误处理
  - Loading 状态
  - 编写测试
  - _需求: design.md 组件设计_

- [ ] 3.5.2 实现 useSnapshot Hook
  - 快照操作封装
  - 历史记录加载
  - 编写测试
  - _需求: design.md 组件设计_

- [ ] 3.5.3 实现 useBranch Hook
  - 分支操作封装
  - 分支列表加载
  - 编写测试
  - _需求: design.md 组件设计_

---

## 阶段 4: 性能优化和测试

### 4.1 性能优化

- [ ] 4.1.1 实现文件扫描优化
  - 使用 Worker 线程
  - 实现增量扫描
  - 实现缓存机制
  - 性能测试
  - _需求: requirements.md 第 4 节_

- [ ] 4.1.2 实现 UI 渲染优化
  - 虚拟滚动（react-window）
  - React.memo 优化
  - 懒加载
  - 性能测试
  - _需求: requirements.md 第 4 节_

- [ ] 4.1.3 实现数据缓存
  - LRU Cache
  - SQLite 缓存
  - IndexedDB（云端模式）
  - 性能测试
  - _需求: requirements.md 第 4 节_

### 4.2 测试完善

- [ ] 4.2.1 完善单元测试
  - 确保覆盖率 > 80%
  - 测试边界条件
  - 测试错误处理
  - _需求: requirements.md 第 5 节_

- [ ] 4.2.2 完善集成测试
  - 测试所有 API 端点
  - 测试数据库操作
  - 测试文件系统操作
  - _需求: requirements.md 第 5 节_

- [ ] 4.2.3 编写 E2E 测试
  - 测试完整用户流程
  - 测试跨浏览器兼容性
  - 测试错误场景
  - _需求: requirements.md 第 5 节_

### 4.3 文档完善

- [ ] 4.3.1 编写 API 文档
  - 所有 API 端点文档
  - 请求/响应示例
  - 错误码说明
  - _需求: requirements.md 第 5 节_

- [ ] 4.3.2 编写用户指南
  - 快速开始
  - 功能说明
  - 常见问题
  - _需求: requirements.md 第 7 节_

- [ ] 4.3.3 编写开发文档
  - 架构说明
  - 开发流程
  - 贡献指南
  - _需求: requirements.md 第 5 节_

---

## 阶段 5: 打包和部署

### 5.1 本地 Web 应用

- [ ] 5.1.1 配置生产构建
  - 配置 Vite 生产构建
  - 配置 TypeScript 编译
  - 优化打包体积
  - _需求: requirements.md 第 1.1 节_

- [ ] 5.1.2 创建启动脚本
  - 创建 start.sh / start.bat
  - 配置环境变量
  - 添加健康检查
  - _需求: requirements.md 第 1.1 节_

- [ ] 5.1.3 编写部署文档
  - 安装说明
  - 配置说明
  - 故障排除
  - _需求: requirements.md 第 1.1 节_

### 5.2 云端 Web 应用

- [ ] 5.2.1 实现云端模式
  - 配置 LightningFS（浏览器文件系统）
  - 实现 File System Access API 集成
  - 实现 IndexedDB 存储
  - 测试 isomorphic-git 在浏览器中运行
  - _需求: requirements.md 第 1.2 节_

- [ ] 5.2.2 配置 PWA
  - 创建 Service Worker
  - 配置离线缓存
  - 配置 manifest.json
  - _需求: requirements.md 第 1.2 节_

- [ ] 5.2.3 部署到 Vercel
  - 配置 vercel.json
  - 配置环境变量
  - 配置自定义域名
  - _需求: requirements.md 第 1.2 节_

### 5.3 桌面应用

- [ ] 5.3.1 配置 Electron
  - 创建 main.ts
  - 创建 preload.ts
  - 配置 IPC 通信
  - _需求: requirements.md 第 1.3 节_

- [ ] 5.3.2 配置 electron-builder
  - 配置 Windows 打包
  - 配置 macOS 打包
  - 配置代码签名
  - 配置自动更新
  - _需求: requirements.md 第 1.3 节_

- [ ] 5.3.3 测试桌面应用
  - 测试 Windows 版本
  - 测试 macOS 版本
  - 测试自动更新
  - _需求: requirements.md 第 1.3 节_

---

## 📊 任务统计

### 按阶段统计

- 阶段 1: 9 个任务
- 阶段 2: 13 个任务
- 阶段 3: 15 个任务
- 阶段 4: 9 个任务
- 阶段 5: 9 个任务

**总计**: 55 个任务

### 按优先级统计

- P0（必须完成）: 40 个任务
- P1（重要）: 10 个任务
- P2（可选）: 5 个任务

---

## ✅ 完成标准

每个任务完成时必须满足：

1. ✅ 代码通过 TypeScript 检查
2. ✅ 代码通过 ESLint 检查
3. ✅ 代码通过 Prettier 格式化
4. ✅ 有相应的单元测试（如适用）
5. ✅ 测试覆盖率 > 80%（如适用）
6. ✅ 有 JSDoc 注释（公共 API）
7. ✅ 功能经过手动测试验证

---

## 📝 注意事项

1. **测试优先**: 每个功能开发完成后立即编写测试
2. **增量开发**: 每完成一个任务就提交代码
3. **文档同步**: 代码和文档同步更新
4. **代码审查**: 使用 commit-check Hook 确保代码质量
5. **性能监控**: 关注性能指标，及时优化

---

**文档版本**: 1.0  
**创建日期**: 2025-11-02  
**预计完成时间**: 10-15 天  
**当前进度**: 0/55 (0%)
