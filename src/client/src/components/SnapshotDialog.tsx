/**
 * Chronos v2.0 - SnapshotDialog Component
 * 
 * 创建快照对话框
 */

import React, { useState } from 'react'
import { Modal, Input, Space, Typography, Tag } from 'antd'
import { useRepositoryStore } from '../stores/repository-store'

const { TextArea } = Input
const { Text } = Typography

interface SnapshotDialogProps {
  visible: boolean
  onOk: (message: string) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const SnapshotDialog: React.FC<SnapshotDialogProps> = ({
  visible,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { status, selectedFiles } = useRepositoryStore()

  const handleOk = async () => {
    if (!title.trim()) {
      return
    }

    // 组合标题和描述
    const message = description.trim() 
      ? `${title.trim()}\n\n${description.trim()}`
      : title.trim()

    await onOk(message)
    setTitle('')
    setDescription('')
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    onCancel()
  }

  const changesCount = status?.changes.length || 0
  const selectedCount = selectedFiles.size

  return (
    <Modal
      title="创建快照"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
      cancelText="取消"
      okButtonProps={{ disabled: !title.trim() }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Space>
            <Text>变更文件:</Text>
            <Tag color="blue">{changesCount} 个</Tag>
          </Space>
          {selectedCount > 0 && (
            <Space style={{ marginLeft: 16 }}>
              <Text>已选择:</Text>
              <Tag color="green">{selectedCount} 个</Tag>
            </Space>
          )}
        </div>

        <div>
          <Text>快照标题: <Text type="danger">*</Text></Text>
          <Input
            placeholder="请输入快照标题（必填）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            showCount
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text>快照描述: <Text type="secondary">（选填）</Text></Text>
          <TextArea
            placeholder="请输入详细描述（例如：添加了新功能、修复了 Bug 等）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedCount > 0
              ? `将创建包含 ${selectedCount} 个选中文件的快照`
              : `将创建包含所有 ${changesCount} 个变更文件的快照`}
          </Text>
        </div>
      </Space>
    </Modal>
  )
}
