/**
 * 树节点接口
 */
export interface TreeNode {
  // 节点标识
  id: string // 唯一标识，如 "one/file1.txt"
  name: string // 显示名称，如 "file1.txt"
  path: string // 完整路径，如 "one/file1.txt"

  // 节点类型
  type: 'file' | 'folder'

  // 文件状态（仅文件节点有效）
  status?: 'added' | 'modified' | 'deleted'

  // 树结构
  children?: TreeNode[] // 子节点（仅文件夹有效）

  // UI状态
  expanded: boolean // 是否展开（仅文件夹有效）
  selected: boolean // 是否选中
  indeterminate: boolean // 半选状态（仅文件夹有效）
}
