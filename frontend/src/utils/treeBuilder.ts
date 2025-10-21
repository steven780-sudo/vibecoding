import type { TreeNode } from '../types/tree'
import type { FileChange } from '../types/api'

/**
 * 将扁平的文件变更列表转换为树状结构
 */
export function buildTree(changes: FileChange[]): TreeNode[] {
  if (!changes || changes.length === 0) {
    return []
  }

  // 使用路径作为key的节点映射，用于快速查找
  const nodeMap = new Map<string, TreeNode>()
  
  // 根节点数组
  const roots: TreeNode[] = []

  // 遍历每个文件变更
  for (const change of changes) {
    const { file, status } = change

    // 跳过空路径
    if (!file || !file.trim()) {
      continue
    }

    // 分割路径
    const parts = file.split('/').filter((p) => p.trim())

    if (parts.length === 0) {
      continue
    }

    // 构建路径上的所有节点
    let currentPath = ''
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLastPart = i === parts.length - 1
      
      // 构建当前完整路径
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      // 如果节点不存在，创建它
      if (!nodeMap.has(currentPath)) {
        const node: TreeNode = {
          id: currentPath,
          name: part,
          path: currentPath,
          type: isLastPart ? 'file' : 'folder',
          status: isLastPart ? (status as 'added' | 'modified' | 'deleted') : undefined,
          children: isLastPart ? undefined : [],
          expanded: true,
          selected: false,
          indeterminate: false,
        }

        nodeMap.set(currentPath, node)

        // 将节点添加到父节点的children或根数组
        if (parentPath) {
          const parentNode = nodeMap.get(parentPath)
          if (parentNode && parentNode.children) {
            parentNode.children.push(node)
          }
        } else {
          roots.push(node)
        }
      }
    }
  }

  // 递归排序所有节点
  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      // 文件夹在前，文件在后
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      // 同类型按名称排序
      return a.name.localeCompare(b.name, 'zh-CN')
    })

    // 递归排序子节点
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }

  sortNodes(roots)

  return roots
}

/**
 * 从树中提取所有文件节点的路径
 */
export function getAllFilePaths(nodes: TreeNode[]): string[] {
  const paths: string[] = []

  function traverse(node: TreeNode) {
    if (node.type === 'file') {
      paths.push(node.path)
    } else if (node.children) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return paths
}
