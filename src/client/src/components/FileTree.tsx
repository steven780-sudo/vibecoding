/**
 * Chronos v2.0 - FileTree Component
 * 
 * 文件树组件（支持虚拟滚动）
 */

import React, { useMemo } from 'react'
import { Tree, Checkbox, Space } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  FileOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'
import type { FileNode, FileStatus } from '@/shared/types'
import { useRepositoryStore } from '../stores/repository-store'

interface FileTreeProps {
  files: FileNode[]
  onSelect?: (selectedKeys: string[]) => void
  showStatus?: boolean
  showCheckbox?: boolean
}

/**
 * 获取文件状态图标和标签
 */
const getStatusIcon = (status?: FileStatus) => {
  switch (status) {
    case 'added':
      return (
        <Space size={4}>
          <span style={{ color: '#52c41a', fontSize: 12 }}>●</span>
          <span style={{ color: '#52c41a', fontSize: 11 }}>[新增]</span>
        </Space>
      )
    case 'modified':
      return (
        <Space size={4}>
          <span style={{ color: '#faad14', fontSize: 12 }}>●</span>
          <span style={{ color: '#faad14', fontSize: 11 }}>[修改]</span>
        </Space>
      )
    case 'deleted':
      return (
        <Space size={4}>
          <span style={{ color: '#ff4d4f', fontSize: 12 }}>●</span>
          <span style={{ color: '#ff4d4f', fontSize: 11 }}>[删除]</span>
        </Space>
      )
    default:
      return null
  }
}

/**
 * 将 FileNode 转换为 Ant Design Tree 的 DataNode
 */
const convertToTreeData = (
  nodes: FileNode[],
  selectedFiles: Set<string>,
  onToggleSelection: (path: string) => void,
  showStatus: boolean = false,
  showCheckbox: boolean = true
): DataNode[] => {
  return nodes.map((node) => {
    const isSelected = selectedFiles.has(node.path)

    const title = (
      <Space>
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelection(node.path)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <span>{node.name}</span>
        {showStatus && getStatusIcon(node.status)}
      </Space>
    )

    const dataNode: DataNode = {
      key: node.id,
      title,
      icon:
        node.type === 'directory' ? (
          node.isExpanded ? (
            <FolderOpenOutlined />
          ) : (
            <FolderOutlined />
          )
        ) : (
          <FileOutlined />
        ),
      children:
        node.children && node.children.length > 0
          ? convertToTreeData(node.children, selectedFiles, onToggleSelection, showStatus, showCheckbox)
          : undefined,
    }

    return dataNode
  })
}

export const FileTree: React.FC<FileTreeProps> = ({ files, onSelect, showStatus = false, showCheckbox = true }) => {
  const { selectedFiles, toggleFileSelection } = useRepositoryStore()
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([])

  const treeData = useMemo(
    () => convertToTreeData(files, selectedFiles, toggleFileSelection, showStatus, showCheckbox),
    [files, selectedFiles, toggleFileSelection, showStatus, showCheckbox]
  )

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (onSelect) {
      onSelect(selectedKeys as string[])
    }
  }

  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys)
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Tree
        showIcon
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        treeData={treeData}
        onSelect={handleSelect}
        style={{ background: 'transparent' }}
      />
    </div>
  )
}
