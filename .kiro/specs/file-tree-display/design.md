# 设计文档 - 文件树状展示功能

## 概述

本设计文档描述了如何将扁平的文件变更列表转换为树状结构展示，并提供交互功能（展开/折叠、文件选择）。

## 架构

### 整体架构

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  App.tsx                             │  │
│  │  - 使用 FileTreeView 组件            │  │
│  └──────────────────────────────────────┘  │
│                    │                        │
│                    ▼                        │
│  ┌──────────────────────────────────────┐  │
│  │  FileTreeView.tsx (新组件)           │  │
│  │  - 接收扁平文件列表                  │  │
│  │  - 构建树状结构                      │  │
│  │  - 渲染树节点                        │  │
│  └──────────────────────────────────────┘  │
│                    │                        │
│                    ▼                        │
│  ┌──────────────────────────────────────┐  │
│  │  TreeNode.tsx (新组件)               │  │
│  │  - 渲染单个节点                      │  │
│  │  - 处理展开/折叠                     │  │
│  │  - 处理复选框选择                    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 组件和接口

### 1. 数据结构

#### TreeNode 接口

```typescript
interface TreeNode {
  // 节点标识
  id: string;                    // 唯一标识，如 "one/file1.txt"
  name: string;                  // 显示名称，如 "file1.txt"
  path: string;                  // 完整路径，如 "one/file1.txt"
  
  // 节点类型
  type: 'file' | 'folder';       // 文件或文件夹
  
  // 文件状态（仅文件节点有效）
  status?: 'added' | 'modified' | 'deleted';
  
  // 树结构
  children?: TreeNode[];         // 子节点（仅文件夹有效）
  parent?: TreeNode;             // 父节点引用
  
  // UI状态
  expanded: boolean;             // 是否展开（仅文件夹有效）
  selected: boolean;             // 是否选中
  indeterminate: boolean;        // 半选状态（仅文件夹有效）
}
```

#### FileChange 接口（已存在）

```typescript
interface FileChange {
  file: string;                  // 文件路径，如 "one/file1.txt"
  status: 'added' | 'modified' | 'deleted';
}
```

### 2. 核心组件

#### FileTreeView 组件

**职责**：
- 接收扁平的文件变更列表
- 构建树状结构
- 管理树的状态（展开/折叠、选择）
- 渲染树结构

**Props**：
```typescript
interface FileTreeViewProps {
  changes: FileChange[];         // 文件变更列表
  selectedFiles?: string[];      // 已选中的文件路径
  onSelectionChange?: (files: string[]) => void;  // 选择变化回调
  showCheckbox?: boolean;        // 是否显示复选框
  defaultExpandAll?: boolean;    // 默认展开所有节点
}
```

**State**：
```typescript
interface FileTreeViewState {
  treeData: TreeNode[];          // 树状数据
  expandedKeys: Set<string>;     // 展开的节点ID集合
  selectedKeys: Set<string>;     // 选中的节点ID集合
}
```

#### TreeNode 组件

**职责**：
- 渲染单个树节点
- 处理节点的展开/折叠
- 处理节点的选择
- 递归渲染子节点

**Props**：
```typescript
interface TreeNodeProps {
  node: TreeNode;                // 节点数据
  level: number;                 // 缩进层级
  showCheckbox: boolean;         // 是否显示复选框
  onToggle: (nodeId: string) => void;        // 展开/折叠回调
  onSelect: (nodeId: string, selected: boolean) => void;  // 选择回调
}
```

### 3. 工具函数

#### buildTree 函数

**功能**：将扁平的文件路径列表转换为树状结构

**签名**：
```typescript
function buildTree(changes: FileChange[]): TreeNode[]
```

**算法**：
```
1. 创建根节点映射 Map<string, TreeNode>
2. 遍历每个文件路径：
   a. 分割路径为各个部分（如 "one/three/file.txt" -> ["one", "three", "file.txt"]）
   b. 从根开始，逐级查找或创建文件夹节点
   c. 在最后一级创建文件节点
3. 返回根节点数组
```

**示例**：
```typescript
输入：
[
  { file: "one/file1.txt", status: "added" },
  { file: "one/three/file3.txt", status: "added" },
  { file: "file1.txt", status: "added" }
]

输出：
[
  {
    id: "one",
    name: "one",
    type: "folder",
    children: [
      { id: "one/file1.txt", name: "file1.txt", type: "file", status: "added" },
      {
        id: "one/three",
        name: "three",
        type: "folder",
        children: [
          { id: "one/three/file3.txt", name: "file3.txt", type: "file", status: "added" }
        ]
      }
    ]
  },
  { id: "file1.txt", name: "file1.txt", type: "file", status: "added" }
]
```

#### getSelectedFiles 函数

**功能**：从树状结构中提取所有选中的文件路径

**签名**：
```typescript
function getSelectedFiles(treeData: TreeNode[], selectedKeys: Set<string>): string[]
```

**算法**：
```
1. 递归遍历树节点
2. 如果节点是文件且被选中，添加到结果数组
3. 如果节点是文件夹且被选中，添加其所有子文件到结果数组
4. 返回文件路径数组
```

#### updateSelectionState 函数

**功能**：更新节点的选择状态（包括父节点的半选状态）

**签名**：
```typescript
function updateSelectionState(
  treeData: TreeNode[],
  nodeId: string,
  selected: boolean
): { treeData: TreeNode[], selectedKeys: Set<string> }
```

**算法**：
```
1. 找到目标节点
2. 更新节点的选中状态
3. 如果是文件夹，递归更新所有子节点
4. 向上更新父节点的半选状态：
   - 所有子节点都选中 -> 父节点选中
   - 部分子节点选中 -> 父节点半选
   - 没有子节点选中 -> 父节点未选中
5. 返回更新后的树数据和选中键集合
```

## 数据模型

### 树构建过程

```
扁平列表:
[
  "one/file1.txt",
  "one/three/file3.txt",
  "file1.txt"
]

↓ buildTree()

树状结构:
{
  "one": {
    type: "folder",
    children: {
      "file1.txt": { type: "file" },
      "three": {
        type: "folder",
        children: {
          "file3.txt": { type: "file" }
        }
      }
    }
  },
  "file1.txt": { type: "file" }
}
```

### 状态管理

```typescript
// 展开状态
expandedKeys: Set<string> = new Set(["one", "one/three"])

// 选中状态
selectedKeys: Set<string> = new Set(["one/file1.txt", "one/three/file3.txt"])

// 半选状态（计算得出）
indeterminateKeys: Set<string> = new Set(["one"])  // one文件夹部分子节点被选中
```

## 错误处理

### 1. 空数据处理

```typescript
if (!changes || changes.length === 0) {
  return <Empty description="没有文件变更" />
}
```

### 2. 无效路径处理

```typescript
// 过滤掉空路径或无效路径
const validChanges = changes.filter(c => c.file && c.file.trim())
```

### 3. 深层嵌套处理

```typescript
// 限制最大展示层级（如10层），防止性能问题
const MAX_DEPTH = 10
if (level > MAX_DEPTH) {
  console.warn(`Path too deep: ${node.path}`)
  return null
}
```

## 测试策略

### 1. 单元测试

**buildTree 函数测试**：
```typescript
describe('buildTree', () => {
  test('应该正确构建单层文件树', () => {
    const changes = [
      { file: 'file1.txt', status: 'added' },
      { file: 'file2.txt', status: 'modified' }
    ]
    const tree = buildTree(changes)
    expect(tree).toHaveLength(2)
    expect(tree[0].type).toBe('file')
  })

  test('应该正确构建多层文件树', () => {
    const changes = [
      { file: 'one/file1.txt', status: 'added' },
      { file: 'one/two/file2.txt', status: 'added' }
    ]
    const tree = buildTree(changes)
    expect(tree).toHaveLength(1)
    expect(tree[0].type).toBe('folder')
    expect(tree[0].children).toHaveLength(2)
  })

  test('应该处理空数组', () => {
    const tree = buildTree([])
    expect(tree).toEqual([])
  })
})
```

**getSelectedFiles 函数测试**：
```typescript
describe('getSelectedFiles', () => {
  test('应该返回所有选中的文件路径', () => {
    const treeData = buildTree([
      { file: 'one/file1.txt', status: 'added' },
      { file: 'file2.txt', status: 'added' }
    ])
    const selectedKeys = new Set(['one/file1.txt', 'file2.txt'])
    const files = getSelectedFiles(treeData, selectedKeys)
    expect(files).toEqual(['one/file1.txt', 'file2.txt'])
  })

  test('选中文件夹应该返回所有子文件', () => {
    const treeData = buildTree([
      { file: 'one/file1.txt', status: 'added' },
      { file: 'one/file2.txt', status: 'added' }
    ])
    const selectedKeys = new Set(['one'])
    const files = getSelectedFiles(treeData, selectedKeys)
    expect(files).toEqual(['one/file1.txt', 'one/file2.txt'])
  })
})
```

### 2. 组件测试

**FileTreeView 组件测试**：
```typescript
describe('FileTreeView', () => {
  test('应该渲染文件树', () => {
    const changes = [
      { file: 'file1.txt', status: 'added' }
    ]
    render(<FileTreeView changes={changes} />)
    expect(screen.getByText('file1.txt')).toBeInTheDocument()
  })

  test('应该支持展开/折叠', () => {
    const changes = [
      { file: 'one/file1.txt', status: 'added' }
    ]
    render(<FileTreeView changes={changes} />)
    
    const folderNode = screen.getByText('one')
    fireEvent.click(folderNode)
    
    // 验证子节点是否显示/隐藏
  })

  test('应该支持文件选择', () => {
    const onSelectionChange = jest.fn()
    const changes = [
      { file: 'file1.txt', status: 'added' }
    ]
    render(
      <FileTreeView 
        changes={changes} 
        showCheckbox 
        onSelectionChange={onSelectionChange}
      />
    )
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onSelectionChange).toHaveBeenCalledWith(['file1.txt'])
  })
})
```

### 3. 集成测试

**完整流程测试**：
```typescript
describe('文件树集成测试', () => {
  test('用户可以展开文件夹并选择文件', async () => {
    // 1. 渲染组件
    const changes = [
      { file: 'one/file1.txt', status: 'added' },
      { file: 'one/file2.txt', status: 'added' }
    ]
    const onSelectionChange = jest.fn()
    render(
      <FileTreeView 
        changes={changes} 
        showCheckbox 
        onSelectionChange={onSelectionChange}
      />
    )
    
    // 2. 展开文件夹
    const folderNode = screen.getByText('one')
    fireEvent.click(folderNode)
    
    // 3. 选择文件
    const checkbox = screen.getByLabelText('file1.txt')
    fireEvent.click(checkbox)
    
    // 4. 验证回调
    expect(onSelectionChange).toHaveBeenCalledWith(['one/file1.txt'])
  })
})
```

## 性能优化

### 1. 虚拟滚动

当文件数量超过1000个时，使用虚拟滚动：

```typescript
import { FixedSizeList } from 'react-window'

// 将树节点扁平化为可见节点列表
const visibleNodes = flattenTree(treeData, expandedKeys)

<FixedSizeList
  height={600}
  itemCount={visibleNodes.length}
  itemSize={32}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TreeNode node={visibleNodes[index]} />
    </div>
  )}
</FixedSizeList>
```

### 2. React.memo 优化

```typescript
export const TreeNode = React.memo<TreeNodeProps>(({ node, ...props }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.expanded === nextProps.node.expanded &&
    prevProps.node.selected === nextProps.node.selected
  )
})
```

### 3. 缓存树结构

```typescript
const treeDataCache = useMemo(() => {
  return buildTree(changes)
}, [changes])  // 只在 changes 变化时重新构建
```

### 4. 延迟渲染

```typescript
// 使用 requestIdleCallback 延迟渲染大量节点
useEffect(() => {
  const handle = requestIdleCallback(() => {
    setTreeData(buildTree(changes))
  })
  return () => cancelIdleCallback(handle)
}, [changes])
```

## 视觉设计

### 1. 节点样式

```css
.tree-node {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
}

.tree-node:hover {
  background-color: #f5f5f5;
}

.tree-node-indent {
  width: 24px;  /* 每层缩进24px */
}

.tree-node-icon {
  margin-right: 8px;
  font-size: 16px;
}

.tree-node-label {
  flex: 1;
  font-size: 13px;
}

.tree-node-status {
  margin-left: 8px;
  font-size: 12px;
}
```

### 2. 状态图标

```typescript
const STATUS_ICONS = {
  added: '🟢',
  modified: '🟡',
  deleted: '🔴'
}

const STATUS_TEXT = {
  added: '[新增]',
  modified: '[修改]',
  deleted: '[删除]'
}

const TYPE_ICONS = {
  folder: '📁',
  file: '📄'
}

const EXPAND_ICONS = {
  expanded: '▼',
  collapsed: '▶️'
}
```

### 3. 颜色方案

```typescript
const COLORS = {
  added: '#52c41a',      // 绿色
  modified: '#faad14',   // 黄色
  deleted: '#ff4d4f',    // 红色
  folder: '#1890ff',     // 蓝色
  text: '#333',          // 深灰
  textSecondary: '#999'  // 浅灰
}
```

## 实现步骤

### 阶段1：核心功能（必需）
1. 创建 TreeNode 数据结构
2. 实现 buildTree 函数
3. 创建 FileTreeView 组件（基础渲染）
4. 创建 TreeNode 组件（基础渲染）
5. 实现展开/折叠功能

### 阶段2：交互功能（必需）
1. 实现文件选择功能（复选框）
2. 实现父子节点联动选择
3. 实现半选状态
4. 集成到 App.tsx 和 SnapshotDialog.tsx

### 阶段3：优化（可选）
1. 添加虚拟滚动
2. 添加搜索过滤功能
3. 添加全选/全不选按钮
4. 性能优化和测试

## 集成点

### 1. App.tsx 集成

```typescript
// 替换现有的文件列表展示
<FileTreeView 
  changes={repository.status.changes}
  showCheckbox={false}
  defaultExpandAll={true}
/>
```

### 2. SnapshotDialog.tsx 集成

```typescript
// 替换现有的文件选择列表
<FileTreeView 
  changes={changes}
  selectedFiles={selectedFiles}
  onSelectionChange={setSelectedFiles}
  showCheckbox={true}
  defaultExpandAll={true}
/>
```

## 技术栈

- **React 18**：组件框架
- **TypeScript**：类型安全
- **Ant Design**：UI组件库（Checkbox、Empty等）
- **react-window**：虚拟滚动（可选）

## 依赖项

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "antd": "^5.0.0"
  },
  "devDependencies": {
    "react-window": "^1.8.10"  // 可选，用于虚拟滚动
  }
}
```
