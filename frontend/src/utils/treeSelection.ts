import type { TreeNode } from '../types/tree'

/**
 * 从树中获取所有选中的文件路径
 */
export function getSelectedFiles(
  nodes: TreeNode[],
  selectedKeys: Set<string>
): string[] {
  const files: string[] = []

  function traverse(node: TreeNode) {
    if (selectedKeys.has(node.id)) {
      // 如果节点被选中
      if (node.type === 'file') {
        files.push(node.path)
      } else if (node.children) {
        // 文件夹被选中，添加所有子文件
        collectAllFiles(node, files)
      }
    } else if (node.children) {
      // 节点未被选中，但可能有子节点被选中
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return files
}

/**
 * 收集节点下的所有文件
 */
function collectAllFiles(node: TreeNode, files: string[]) {
  if (node.type === 'file') {
    files.push(node.path)
  } else if (node.children) {
    for (const child of node.children) {
      collectAllFiles(child, files)
    }
  }
}

/**
 * 更新节点的选择状态
 */
export function updateNodeSelection(
  nodes: TreeNode[],
  nodeId: string,
  selected: boolean
): { nodes: TreeNode[]; selectedKeys: Set<string> } {
  const selectedKeys = new Set<string>()

  // 深拷贝树结构
  const newNodes = JSON.parse(JSON.stringify(nodes)) as TreeNode[]

  // 找到目标节点并更新
  function findAndUpdate(nodes: TreeNode[]): boolean {
    for (const node of nodes) {
      if (node.id === nodeId) {
        // 找到目标节点
        updateNodeAndChildren(node, selected)
        return true
      }

      if (node.children) {
        if (findAndUpdate(node.children)) {
          return true
        }
      }
    }
    return false
  }

  // 更新节点及其所有子节点
  function updateNodeAndChildren(node: TreeNode, selected: boolean) {
    node.selected = selected
    node.indeterminate = false

    if (node.children) {
      for (const child of node.children) {
        updateNodeAndChildren(child, selected)
      }
    }
  }

  // 更新父节点的状态
  function updateParentStates(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // 递归更新子节点
        updateParentStates(node.children)

        // 计算当前节点的状态
        const selectedCount = node.children.filter((c) => c.selected).length
        const indeterminateCount = node.children.filter(
          (c) => c.indeterminate
        ).length

        if (selectedCount === node.children.length) {
          // 所有子节点都选中
          node.selected = true
          node.indeterminate = false
        } else if (selectedCount > 0 || indeterminateCount > 0) {
          // 部分子节点选中
          node.selected = false
          node.indeterminate = true
        } else {
          // 没有子节点选中
          node.selected = false
          node.indeterminate = false
        }
      }
    }
  }

  // 收集所有选中的节点ID
  function collectSelectedKeys(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.selected) {
        selectedKeys.add(node.id)
      }
      if (node.children) {
        collectSelectedKeys(node.children)
      }
    }
  }

  // 执行更新
  findAndUpdate(newNodes)
  updateParentStates(newNodes)
  collectSelectedKeys(newNodes)

  return { nodes: newNodes, selectedKeys }
}

/**
 * 根据文件路径列表初始化选中状态
 */
export function initializeSelection(
  nodes: TreeNode[],
  selectedFiles: string[]
): TreeNode[] {
  const selectedSet = new Set(selectedFiles)

  // 深拷贝树结构
  const newNodes = JSON.parse(JSON.stringify(nodes)) as TreeNode[]

  // 标记选中的文件节点
  function markSelected(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.type === 'file' && selectedSet.has(node.path)) {
        node.selected = true
      }
      if (node.children) {
        markSelected(node.children)
      }
    }
  }

  // 更新父节点状态
  function updateParentStates(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        updateParentStates(node.children)

        const selectedCount = node.children.filter((c) => c.selected).length
        const indeterminateCount = node.children.filter(
          (c) => c.indeterminate
        ).length

        if (selectedCount === node.children.length) {
          node.selected = true
          node.indeterminate = false
        } else if (selectedCount > 0 || indeterminateCount > 0) {
          node.selected = false
          node.indeterminate = true
        } else {
          node.selected = false
          node.indeterminate = false
        }
      }
    }
  }

  markSelected(newNodes)
  updateParentStates(newNodes)

  return newNodes
}
