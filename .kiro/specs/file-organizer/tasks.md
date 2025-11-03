# 文件整理助手 - 实现任务清单

## 任务概述

本任务清单将文件整理助手功能分解为可执行的开发任务。每个任务都是独立的、可测试的，并按照依赖关系排序。任务标记为可选的（带*后缀）表示非核心功能，可以在后续迭代中实现。

## 任务列表

- [ ] 1. 创建基础类型定义和常量
  - 在 `src/shared/types/organizer.ts` 中定义所有数据类型（FileInfo, FileGroup, OrganizerSession等）
  - 在 `src/shared/constants/organizer.ts` 中定义常量（文件类型映射、默认配置等）
  - _需求: 1.1, 2.1, 3.1_

- [ ] 2. 实现后端核心服务

- [ ] 2.1 实现文件扫描服务
  - 创建 `src/server/services/file-scanner.ts`
  - 实现递归文件扫描功能，支持配置选项（包含子文件夹、忽略系统文件、文件类型过滤）
  - 实现文件信息提取（名称、大小、时间戳、类型）
  - 添加错误处理和日志记录
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 2.2 编写文件扫描服务单元测试
  - 创建 `tests/unit/file-scanner.test.ts`
  - 测试基本扫描功能、子文件夹扫描、文件过滤、错误处理
  - _需求: 1.1, 1.2, 1.3_

- [ ] 2.3 实现相似度计算服务
  - 创建 `src/server/services/similarity-service.ts`
  - 实现Levenshtein距离算法
  - 实现文件名相似度计算
  - 实现文件大小接近度计算
  - 实现修改时间接近度计算
  - 实现综合相似度计算（加权平均）
  - 实现相似度缓存机制
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.4 编写相似度计算服务单元测试
  - 创建 `tests/unit/similarity-service.test.ts`
  - 测试各种相似度计算场景（相同文件、相似文件、不同文件）
  - 测试缓存机制
  - _需求: 2.1, 2.2, 2.3_

- [ ] 2.5 实现文件分组服务
  - 在 `src/server/services/similarity-service.ts` 中添加分组功能
  - 实现基于相似度阈值的文件分组算法
  - 实现组内文件排序（按修改时间）
  - 实现代表文件选择（最新文件）
  - 实现组相似度计算
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.6 实现整理器核心服务
  - 创建 `src/server/services/organizer-service.ts`
  - 实现会话管理（创建、获取、更新、删除）
  - 实现扫描流程控制
  - 实现暂存区管理
  - 实现文件保存功能（复制/移动模式）
  - 实现文件命名规则（保持原名/统一重命名）
  - 实现文件清理功能（永久删除/回收站/归档）
  - 实现统计信息计算
  - _需求: 1.1, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 7.2_

- [ ]* 2.7 编写整理器服务单元测试
  - 创建 `tests/unit/organizer-service.test.ts`
  - 测试会话管理、文件保存、文件清理等核心功能
  - _需求: 4.1, 5.1, 6.1_

- [ ] 3. 实现后端API路由

- [ ] 3.1 创建整理器API路由
  - 创建 `src/server/routes/organizer.ts`
  - 实现 POST /api/organizer/scan - 开始扫描
  - 实现 GET /api/organizer/scan/:sessionId/progress - 获取扫描进度
  - 实现 GET /api/organizer/scan/:sessionId/result - 获取扫描结果
  - 实现 POST /api/organizer/:sessionId/staging - 更新暂存区
  - 实现 POST /api/organizer/:sessionId/save - 保存文件
  - 实现 POST /api/organizer/:sessionId/cleanup - 清理文件
  - 实现 GET /api/organizer/:sessionId - 获取会话信息
  - 实现 DELETE /api/organizer/:sessionId - 取消会话
  - 实现 POST /api/organizer/:sessionId/create-repository - 创建时光库
  - 添加请求验证和错误处理
  - _需求: 1.1, 4.1, 5.1, 6.1, 11.1_

- [ ]* 3.2 编写API集成测试
  - 创建 `tests/integration/organizer-api.test.ts`
  - 测试所有API端点的正常流程和错误处理
  - _需求: 1.1, 4.1, 5.1, 6.1_

- [ ] 3.3 在主服务器中注册整理器路由
  - 在 `src/server/index.ts` 中导入并注册整理器路由
  - _需求: 1.1_

- [ ] 4. 实现数据库支持

- [ ] 4.1 创建数据库Schema
  - 在 `src/server/services/database-service.ts` 中添加整理器相关表
  - 创建 organizer_sessions 表
  - 创建 organizer_files 表
  - 创建 organizer_groups 表
  - 创建 organizer_logs 表
  - _需求: 7.5, 8.5_

- [ ] 4.2 实现数据库操作方法
  - 在 `src/server/services/database-service.ts` 中添加整理器数据操作方法
  - 实现会话CRUD操作
  - 实现文件记录操作
  - 实现操作日志记录
  - _需求: 7.5, 8.5_

- [ ] 5. 实现前端状态管理

- [ ] 5.1 创建整理器Store
  - 创建 `src/client/src/stores/organizer-store.ts`
  - 使用Zustand实现状态管理
  - 定义所有状态（session, currentStep, scanConfig, fileGroups, stagingArea等）
  - 实现所有actions（startScan, addToStaging, saveFiles, cleanup等）
  - 实现WebSocket连接和事件监听（实时进度更新）
  - _需求: 1.5, 4.1, 5.7, 6.8, 7.1_

- [ ] 6. 实现前端API服务

- [ ] 6.1 创建整理器API服务
  - 创建 `src/client/src/services/organizer-api.ts`
  - 实现所有API调用方法（scan, getScanProgress, getScanResult, updateStaging, saveFiles, cleanup等）
  - 实现错误处理和重试机制
  - _需求: 1.1, 4.1, 5.1, 6.1_

- [ ] 7. 实现前端核心组件

- [ ] 7.1 创建主页面组件
  - 创建 `src/client/src/pages/FileOrganizerPage.tsx`
  - 实现步骤式向导界面
  - 实现步骤切换逻辑
  - 实现页面布局（头部、步骤指示器、内容区、操作栏）
  - _需求: 9.1, 9.2, 9.3_

- [ ] 7.2 实现扫描配置组件
  - 创建 `src/client/src/components/organizer/ScanConfig.tsx`
  - 实现文件夹选择器（使用Electron dialog）
  - 实现扫描选项复选框（包含子文件夹、忽略系统文件、文件类型过滤）
  - 实现表单验证
  - _需求: 1.1, 1.2, 1.3, 1.4_

- [ ] 7.3 实现扫描进度组件
  - 创建 `src/client/src/components/organizer/ScanProgress.tsx`
  - 实现进度条显示
  - 实现实时统计信息显示（已扫描文件数、发现相似组数）
  - 实现取消扫描功能
  - _需求: 1.5_

- [ ] 7.4 实现文件分组列表组件
  - 创建 `src/client/src/components/organizer/FileGroupList.tsx`
  - 实现分组列表展示（使用虚拟滚动优化性能）
  - 实现排序功能（相似度、文件大小、修改时间）
  - 实现搜索过滤功能
  - 实现全选/全不选功能
  - 实现智能推荐（自动选中最新文件）
  - _需求: 2.4, 2.5, 3.1, 4.6, 4.7, 4.8, 9.8_

- [ ] 7.5 实现文件分组项组件
  - 创建 `src/client/src/components/organizer/FileGroupItem.tsx`
  - 实现分组展开/折叠
  - 实现相似度显示
  - 实现组级别全选/全不选
  - 实现添加到暂存区功能
  - _需求: 2.5, 3.1, 4.6_

- [ ] 7.6 实现文件项组件
  - 创建 `src/client/src/components/organizer/FileItem.tsx`
  - 实现文件信息展示（名称、大小、时间）
  - 实现文件类型图标
  - 实现文件状态颜色标识
  - 实现复选框选择
  - 实现预览和删除按钮
  - _需求: 3.1, 3.4, 3.5_

- [ ] 7.7 实现暂存区组件
  - 创建 `src/client/src/components/organizer/StagingArea.tsx`
  - 实现暂存文件列表展示
  - 实现文件数量和总大小统计
  - 实现移除文件功能
  - 实现清空暂存区功能
  - 实现拖拽排序
  - _需求: 4.1, 4.2, 4.3, 4.4, 4.5, 9.7_

- [ ]* 7.8 实现文件预览组件
  - 创建 `src/client/src/components/organizer/FilePreview.tsx`
  - 实现文本文件预览
  - 实现图片文件预览
  - 实现PDF文件预览
  - 实现预览对话框
  - _需求: 3.2_

- [ ]* 7.9 实现文件对比组件
  - 创建 `src/client/src/components/organizer/FileCompare.tsx`
  - 实现文件差异对比
  - 实现对比对话框
  - _需求: 3.3_

- [ ] 7.10 实现保存配置组件
  - 创建 `src/client/src/components/organizer/SaveConfig.tsx`
  - 实现保存模式选择（复制/移动）
  - 实现目标文件夹选择器
  - 实现命名规则选择（保持原名/统一重命名）
  - 实现文件名预览
  - 实现文件冲突处理对话框
  - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_

- [ ] 7.11 实现保存进度组件
  - 创建 `src/client/src/components/organizer/SaveProgress.tsx`
  - 实现进度条显示
  - 实现实时统计信息显示（已保存文件数）
  - 实现错误信息展示
  - _需求: 5.7_

- [ ] 7.12 实现清理配置组件
  - 创建 `src/client/src/components/organizer/CleanupConfig.tsx`
  - 实现待删除文件列表展示
  - 实现清理模式选择（永久删除/回收站/归档）
  - 实现归档位置选择器
  - 实现二次确认对话框
  - 实现安全警告提示
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 7.13 实现清理进度组件
  - 创建 `src/client/src/components/organizer/CleanupProgress.tsx`
  - 实现进度条显示
  - 实现实时统计信息显示（已删除文件数）
  - _需求: 6.8_

- [ ] 7.14 实现完成摘要组件
  - 创建 `src/client/src/components/organizer/CompletionSummary.tsx`
  - 实现统计信息展示（扫描文件数、相似组数、保存文件数、删除文件数、节省空间）
  - 实现创建时光库按钮
  - 实现导出报告功能
  - _需求: 7.1, 7.2, 7.3, 7.4, 11.1_

- [ ] 8. 实现前端Hooks

- [ ] 8.1 创建useOrganizer Hook
  - 创建 `src/client/src/hooks/useOrganizer.ts`
  - 封装整理器业务逻辑
  - 实现扫描流程控制
  - 实现保存流程控制
  - 实现清理流程控制
  - _需求: 1.1, 5.1, 6.1_

- [ ] 8.2 创建useSimilarity Hook
  - 创建 `src/client/src/hooks/useSimilarity.ts`
  - 封装相似度相关逻辑
  - 实现分组排序
  - 实现分组过滤
  - _需求: 2.4, 2.5_

- [ ] 8.3 创建useStaging Hook
  - 创建 `src/client/src/hooks/useStaging.ts`
  - 封装暂存区操作逻辑
  - 实现添加/移除文件
  - 实现批量操作
  - _需求: 4.1, 4.4, 4.5, 4.6, 4.7_

- [ ] 9. 实现Electron集成

- [ ] 9.1 添加文件夹选择对话框
  - 在 `src/electron/main.ts` 中添加IPC处理器
  - 实现 dialog.showOpenDialog 调用
  - 实现文件夹路径返回
  - _需求: 1.1_

- [ ] 9.2 添加文件操作权限处理
  - 在 `src/electron/preload.ts` 中暴露文件操作API
  - 实现安全的文件系统访问
  - _需求: 10.4_

- [ ] 10. 实现路由和导航

- [ ] 10.1 添加整理器路由
  - 在 `src/client/src/App.tsx` 中添加 /organizer 路由
  - 配置路由参数和权限
  - _需求: 9.1_

- [ ] 10.2 添加导航入口
  - 在主页面添加"文件整理助手"入口按钮
  - 实现导航跳转
  - _需求: 9.1_

- [ ] 11. 实现与Chronos集成

- [ ] 11.1 实现创建时光库功能
  - 在整理器服务中添加创建仓库方法
  - 调用现有的仓库初始化API
  - 实现初始快照创建
  - 实现跳转到仓库管理页面
  - _需求: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 12. 性能优化

- [ ] 12.1 实现虚拟滚动
  - 在FileGroupList组件中集成react-window
  - 优化大量文件的渲染性能
  - _需求: 10.1, 10.2_

- [ ] 12.2 实现Worker并行扫描
  - 创建 `src/server/workers/file-scanner-worker.ts`
  - 实现多Worker并行扫描
  - 实现任务分配和结果合并
  - _需求: 10.1, 10.2_

- [ ]* 12.3 实现相似度计算缓存
  - 在相似度服务中添加缓存层
  - 实现LRU缓存策略
  - _需求: 10.2_

- [ ] 13. 错误处理和日志

- [ ] 13.1 实现统一错误处理
  - 创建 `src/shared/utils/organizer-errors.ts`
  - 定义所有错误类型和错误码
  - 实现错误处理中间件
  - 实现用户友好的错误提示
  - _需求: 10.4_

- [ ] 13.2 实现操作日志记录
  - 在整理器服务中添加日志记录
  - 记录所有关键操作（扫描、保存、删除）
  - 实现日志查询功能
  - _需求: 7.5, 8.5_

- [ ] 14. 样式和UI优化

- [ ] 14.1 实现响应式布局
  - 使用Ant Design Grid系统
  - 适配不同屏幕尺寸
  - _需求: 9.5_

- [ ] 14.2 实现主题样式
  - 创建 `src/client/src/styles/organizer.css`
  - 实现组件样式
  - 实现颜色标识系统
  - _需求: 3.5, 9.6_

- [ ] 14.3 实现图标系统
  - 实现文件类型图标映射
  - 使用Ant Design Icons
  - _需求: 3.4_

- [ ]* 15. 编写E2E测试
  - 创建 `tests/e2e/organizer.test.ts`
  - 测试完整的整理流程
  - 测试各种边界情况和错误场景
  - _需求: 1.1, 4.1, 5.1, 6.1, 7.1_

- [ ]* 16. 编写用户文档
  - 创建 `docs/FILE_ORGANIZER_GUIDE.md`
  - 编写功能说明和使用教程
  - 添加截图和示例
  - _需求: 9.1_

- [ ] 17. 最终集成和测试

- [ ] 17.1 集成测试
  - 测试所有功能模块的集成
  - 测试与现有Chronos功能的兼容性
  - 修复集成问题
  - _需求: 11.1_

- [ ] 17.2 性能测试
  - 测试大量文件场景（1000+文件）
  - 测试内存占用
  - 优化性能瓶颈
  - _需求: 10.1, 10.2, 10.3_

- [ ] 17.3 用户验收测试
  - 按照需求文档进行功能验收
  - 收集用户反馈
  - 修复发现的问题
  - _需求: 所有需求_

## 任务执行说明

### 执行顺序
1. 首先完成基础类型定义（任务1）
2. 然后实现后端服务和API（任务2-4）
3. 接着实现前端状态管理和API服务（任务5-6）
4. 再实现前端组件和Hooks（任务7-8）
5. 实现Electron集成和路由（任务9-10）
6. 实现Chronos集成（任务11）
7. 进行性能优化（任务12）
8. 完善错误处理和样式（任务13-14）
9. 最后进行测试和文档（任务15-17）

### 可选任务说明
带*后缀的任务为可选任务，包括：
- 单元测试和集成测试
- 文件预览和对比功能
- 相似度计算缓存
- E2E测试
- 用户文档

这些任务可以在核心功能完成后根据时间和优先级决定是否实现。

### 依赖关系
- 任务2（后端服务）必须在任务3（API路由）之前完成
- 任务5（状态管理）必须在任务7（组件）之前完成
- 任务9（Electron集成）必须在任务7.2（扫描配置）之前完成
- 任务11（Chronos集成）依赖现有的仓库管理功能

### 测试策略
- 每个核心服务完成后立即编写单元测试（可选）
- API完成后编写集成测试（可选）
- 所有功能完成后进行E2E测试（可选）
- 最后进行完整的用户验收测试（必需）
