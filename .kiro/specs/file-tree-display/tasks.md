# 实现计划 - 文件树状展示功能

## 任务列表

- [x] 1. 创建核心数据结构和工具函数
  - 创建 `frontend/src/types/tree.ts` 定义 TreeNode 接口
  - 创建 `frontend/src/utils/treeBuilder.ts` 实现 buildTree 函数
  - 创建 `frontend/src/utils/treeSelection.ts` 实现选择相关函数
  - _需求: 1.1, 1.2, 2.1_

- [x] 2. 创建 TreeNode 组件
  - [x] 2.1 创建 `frontend/src/components/TreeNode.tsx` 基础组件
    - 实现节点渲染（图标、文本、状态）
    - 实现缩进显示
    - 实现展开/折叠图标
    - _需求: 2.1, 2.2, 4.1, 4.2, 4.3_
  
  - [x] 2.2 添加交互功能
    - 实现点击展开/折叠
    - 实现复选框选择
    - 实现悬停效果
    - _需求: 2.4, 3.2_

- [x] 3. 创建 FileTreeView 组件
  - [x] 3.1 创建 `frontend/src/components/FileTreeView.tsx` 基础组件
    - 实现 buildTree 调用
    - 实现树状结构渲染
    - 实现状态管理（展开/选择）
    - _需求: 2.1, 2.3_
  
  - [x] 3.2 实现选择功能
    - 实现父子节点联动选择
    - 实现半选状态计算
    - 实现 onSelectionChange 回调
    - _需求: 3.3, 3.4, 3.5_
  
  - [x] 3.3 添加性能优化
    - 使用 React.memo 优化 TreeNode
    - 使用 useMemo 缓存树结构
    - 添加空数据处理
    - _需求: 5.1, 5.4, 5.5_

- [x] 4. 集成到现有界面
  - [x] 4.1 更新 App.tsx
    - 导入 FileTreeView 组件
    - 替换"待提交的变更"区域的文件列表展示
    - 保持现有功能不变
    - _需求: 2.1_
  
  - [x] 4.2 更新 SnapshotDialog.tsx
    - 导入 FileTreeView 组件
    - 替换文件选择列表
    - 集成文件选择功能
    - _需求: 3.1, 3.2_
  
  - [x] 4.3 更新组件导出
    - 在 `frontend/src/components/index.ts` 中导出新组件
    - 确保类型定义正确导出

- [x] 5. 样式优化
  - 添加树节点样式（缩进、图标、悬停效果）
  - 添加状态颜色（新增绿色、修改黄色、删除红色）
  - 确保响应式布局
  - _需求: 4.3, 4.4, 4.5_

- [x] 6. 测试和验证
  - 测试单层文件展示
  - 测试多层文件夹展示
  - 测试展开/折叠功能
  - 测试文件选择功能
  - 测试父子联动选择
  - 测试半选状态
  - 测试空数据情况
  - _需求: 所有_
