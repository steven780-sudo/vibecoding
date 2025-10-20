import React, { useState, useEffect } from 'react'
import { Modal, Checkbox, Input, Button, Space, message, Divider } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { FileChange } from '../types/api'

const { TextArea } = Input

interface SnapshotDialogProps {
  visible: boolean
  changes: FileChange[]
  repoPath: string
  onClose: () => void
  onSuccess: () => void
  onCreateCommit: (
    repoPath: string,
    message: string,
    files: string[]
  ) => Promise<boolean>
}

/**
 * SnapshotDialog 组件
 * 创建快照对话框，允许用户选择文件并输入描述
 */
export const SnapshotDialog: React.FC<SnapshotDialogProps> = ({
  visible,
  changes,
  repoPath,
  onClose,
  onSuccess,
  onCreateCommit,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [detailedDescription, setDetailedDescription] = useState('')
  const [loading, setLoading] = useState(false)

  // 当对话框打开时，默认选中所有文件
  useEffect(() => {
    if (visible && changes.length > 0) {
      setSelectedFiles(changes.map((c) => c.file))
    }
  }, [visible, changes])

  // 重置表单
  const resetForm = () => {
    setSelectedFiles([])
    setDescription('')
    setDetailedDescription('')
    setLoading(false)
  }

  // 处理关闭
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // 处理全选/取消全选
  const handleSelectAll = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setSelectedFiles(changes.map((c) => c.file))
    } else {
      setSelectedFiles([])
    }
  }

  // 处理文件选择
  const handleFileChange = (checkedValues: string[]) => {
    setSelectedFiles(checkedValues)
  }

  // 处理确认创建快照
  const handleConfirm = async () => {
    // 验证必填字段
    if (!description.trim()) {
      message.error('请输入快照描述')
      return
    }

    if (selectedFiles.length === 0) {
      message.error('请至少选择一个文件')
      return
    }

    setLoading(true)

    try {
      // 组合描述信息
      const fullMessage = detailedDescription.trim()
        ? `${description}\n\n${detailedDescription}`
        : description

      const success = await onCreateCommit(repoPath, fullMessage, selectedFiles)

      if (success) {
        message.success('快照创建成功')
        handleClose()
        onSuccess()
      } else {
        message.error('快照创建失败')
      }
    } catch (error) {
      message.error('快照创建失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取文件状态标签
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'A':
        return '新增'
      case 'M':
        return '修改'
      case 'D':
        return '删除'
      default:
        return status
    }
  }

  // 获取文件状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A':
        return '#52c41a' // 绿色
      case 'M':
        return '#1890ff' // 蓝色
      case 'D':
        return '#ff4d4f' // 红色
      default:
        return '#666'
    }
  }

  const allSelected =
    selectedFiles.length === changes.length && changes.length > 0
  const indeterminate =
    selectedFiles.length > 0 && selectedFiles.length < changes.length

  return (
    <Modal
      title="创建快照"
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleConfirm}
        >
          确认创建
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 快照描述 */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#ff4d4f' }}>* </span>
            快照描述
          </div>
          <Input
            placeholder="请输入快照描述（必填）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={100}
            showCount
          />
        </div>

        {/* 详细描述（可选） */}
        <div>
          <div style={{ marginBottom: 8 }}>详细描述（可选）</div>
          <TextArea
            placeholder="可以添加更详细的说明..."
            value={detailedDescription}
            onChange={(e) => setDetailedDescription(e.target.value)}
            rows={3}
            maxLength={500}
            showCount
          />
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 文件选择 */}
        <div>
          <div
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              选择要包含的文件 ({selectedFiles.length}/{changes.length})
            </span>
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={handleSelectAll}
            >
              全选
            </Checkbox>
          </div>

          {changes.length === 0 ? (
            <div
              style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}
            >
              没有变更的文件
            </div>
          ) : (
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedFiles}
              onChange={handleFileChange}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {changes.map((change) => (
                  <Checkbox key={change.file} value={change.file}>
                    <Space>
                      <span
                        style={{
                          color: getStatusColor(change.status),
                          fontWeight: 'bold',
                          minWidth: 40,
                        }}
                      >
                        [{getStatusLabel(change.status)}]
                      </span>
                      <span>{change.file}</span>
                    </Space>
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </div>
      </Space>
    </Modal>
  )
}
