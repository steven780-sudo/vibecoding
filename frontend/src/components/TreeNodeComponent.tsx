import React from 'react'
import { Checkbox } from 'antd'
import type { TreeNode } from '../types/tree'

interface TreeNodeProps {
  node: TreeNode
  level: number
  showCheckbox: boolean
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, selected: boolean) => void
}

// 状态图标
const STATUS_ICONS = {
  added: '🟢',
  modified: '🟡',
  deleted: '🔴',
}

const STATUS_TEXT = {
  added: '[新增]',
  modified: '[修改]',
  deleted: '[删除]',
}

// 类型图标
const TYPE_ICONS = {
  folder: '📁',
  file: '📄',
}

/**
 * 树节点组件
 */
export const TreeNodeComponent: React.FC<TreeNodeProps> = React.memo(
  ({ node, level, showCheckbox, onToggle, onSelect }) => {
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (node.type === 'folder') {
        onToggle(node.id)
      }
    }

    const handleCheckboxChange = (e: any) => {
      e.stopPropagation()
      onSelect(node.id, e.target.checked)
    }

    const handleRowClick = () => {
      if (node.type === 'folder') {
        onToggle(node.id)
      }
    }

    return (
      <div>
        {/* 当前节点 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: `${level * 24 + 8}px`,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.2s',
          }}
          onClick={handleRowClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {/* 展开/折叠图标 */}
          {node.type === 'folder' && (
            <span
              onClick={handleToggle}
              style={{
                marginRight: '4px',
                fontSize: '12px',
                width: '16px',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              {node.expanded ? '▼' : '▶️'}
            </span>
          )}

          {/* 占位符（文件节点） */}
          {node.type === 'file' && (
            <span style={{ marginRight: '4px', width: '16px' }} />
          )}

          {/* 复选框 */}
          {showCheckbox && (
            <Checkbox
              checked={node.selected}
              indeterminate={node.indeterminate}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              style={{ marginRight: '8px' }}
            />
          )}

          {/* 类型图标 */}
          <span style={{ marginRight: '8px', fontSize: '16px' }}>
            {TYPE_ICONS[node.type]}
          </span>

          {/* 文件/文件夹名称 */}
          <span
            style={{
              flex: 1,
              fontSize: '13px',
              color: '#333',
            }}
          >
            {node.name}
          </span>

          {/* 状态指示器（仅文件） */}
          {node.type === 'file' && node.status && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#666',
              }}
            >
              {STATUS_ICONS[node.status]} {STATUS_TEXT[node.status]}
            </span>
          )}
        </div>

        {/* 子节点 */}
        {node.type === 'folder' &&
          node.expanded &&
          node.children &&
          node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              showCheckbox={showCheckbox}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
      </div>
    )
  }
)

TreeNodeComponent.displayName = 'TreeNodeComponent'
