import React, { useMemo, useState, useEffect } from 'react'
import { Empty } from 'antd'
import { TreeNodeComponent } from './TreeNodeComponent'
import { buildTree } from '../utils/treeBuilder'
import {
  getSelectedFiles,
  updateNodeSelection,
  initializeSelection,
} from '../utils/treeSelection'
import type { TreeNode } from '../types/tree'
import type { FileChange } from '../types/api'

interface FileTreeViewProps {
  changes: FileChange[]
  selectedFiles?: string[]
  onSelectionChange?: (files: string[]) => void
  showCheckbox?: boolean
  defaultExpandAll?: boolean
}

/**
 * 文件树视图组件
 */
export const FileTreeView: React.FC<FileTreeViewProps> = ({
  changes,
  selectedFiles = [],
  onSelectionChange,
  showCheckbox = false,
  defaultExpandAll = true,
}) => {
  // 构建树结构（使用 useMemo 缓存）
  const initialTreeData = useMemo(() => {
    const tree = buildTree(changes)

    // 如果不默认展开，设置所有节点为折叠状态
    if (!defaultExpandAll) {
      function collapseAll(nodes: TreeNode[]) {
        for (const node of nodes) {
          if (node.type === 'folder') {
            node.expanded = false
            if (node.children) {
              collapseAll(node.children)
            }
          }
        }
      }
      collapseAll(tree)
    }

    return tree
  }, [changes, defaultExpandAll])

  // 初始化树数据
  const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData)

  // 当 initialTreeData 变化时，更新树数据（仅在 changes 变化时）
  useEffect(() => {
    setTreeData(initialTreeData)
  }, [initialTreeData])

  // 当 selectedFiles 变化时，更新选中状态（仅在 showCheckbox 模式下）
  useEffect(() => {
    if (showCheckbox && selectedFiles.length > 0) {
      setTreeData((prevData) => {
        return initializeSelection(prevData, selectedFiles)
      })
    }
  }, [selectedFiles, showCheckbox])

  // 处理节点展开/折叠
  const handleToggle = (nodeId: string) => {
    setTreeData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)) as TreeNode[]

      function toggleNode(nodes: TreeNode[]): boolean {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.expanded = !node.expanded
            return true
          }
          if (node.children && toggleNode(node.children)) {
            return true
          }
        }
        return false
      }

      toggleNode(newData)
      return newData
    })
  }

  // 处理节点选择
  const handleSelect = (nodeId: string, selected: boolean) => {
    const { nodes: newNodes, selectedKeys } = updateNodeSelection(
      treeData,
      nodeId,
      selected
    )

    setTreeData(newNodes)

    // 触发回调
    if (onSelectionChange) {
      const files = getSelectedFiles(newNodes, selectedKeys)
      onSelectionChange(files)
    }
  }

  // 空数据处理
  if (!changes || changes.length === 0) {
    return <Empty description="没有文件变更" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div
      style={{
        maxHeight: '250px',
        overflowY: 'auto',
        overflowX: 'auto',
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
      }}
    >
      {treeData.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          showCheckbox={showCheckbox}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
