/**
 * Chronos v2.0 - BranchManager Component
 * 
 * 分支管理组件
 */

import React, { useState } from 'react'
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  message,
} from 'antd'
import {
  BranchesOutlined,
  PlusOutlined,
  SwapOutlined,
  MergeCellsOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import type { Branch } from '@/shared/types'
import { formatDate } from '@/shared/utils'

interface BranchManagerProps {
  branches: Branch[]
  onCreateBranch: (branchName: string) => Promise<void>
  onSwitchBranch: (branchName: string) => Promise<void>
  onMergeBranch: (sourceBranch: string) => Promise<void>
  loading?: boolean
}

export const BranchManager: React.FC<BranchManagerProps> = ({
  branches,
  onCreateBranch,
  onSwitchBranch,
  onMergeBranch,
  loading = false,
}) => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [selectedMergeBranch, setSelectedMergeBranch] = useState<string>('')

  const currentBranch = branches.find((b) => b.isCurrent)

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      message.warning('请输入分支名称')
      return
    }

    try {
      await onCreateBranch(newBranchName.trim())
      setCreateModalVisible(false)
      setNewBranchName('')
    } catch (error) {
      // 错误已在 Hook 中处理
    }
  }

  const handleMergeBranch = async () => {
    if (!selectedMergeBranch) {
      message.warning('请选择要合并的分支')
      return
    }

    try {
      await onMergeBranch(selectedMergeBranch)
      setMergeModalVisible(false)
      setSelectedMergeBranch('')
    } catch (error) {
      // 错误已在 Hook 中处理
    }
  }

  return (
    <Card
      title={
        <Space>
          <BranchesOutlined />
          <span>分支管理</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            loading={loading}
          >
            创建分支
          </Button>
          <Button
            size="small"
            icon={<MergeCellsOutlined />}
            onClick={() => setMergeModalVisible(true)}
            loading={loading}
            disabled={branches.length <= 1}
          >
            合并分支
          </Button>
        </Space>
      }
    >
      <List
        dataSource={branches}
        renderItem={(branch) => (
          <List.Item
            actions={[
              branch.isCurrent ? (
                <Tag color="blue" icon={<CheckOutlined />}>
                  当前分支
                </Tag>
              ) : (
                <Button
                  type="link"
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => onSwitchBranch(branch.name)}
                  loading={loading}
                >
                  切换
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span>{branch.name}</span>
                  {branch.isCurrent && <Tag color="blue">当前</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <span>最后提交: {formatDate(branch.lastCommitDate)}</span>
                  {branch.lastCommit && (
                    <span style={{ fontSize: 12, color: '#999' }}>
                      {branch.lastCommit.substring(0, 7)}
                    </span>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {/* 创建分支对话框 */}
      <Modal
        title="创建新分支"
        open={createModalVisible}
        onOk={handleCreateBranch}
        onCancel={() => {
          setCreateModalVisible(false)
          setNewBranchName('')
        }}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <span>当前分支: </span>
            <Tag color="blue">{currentBranch?.name}</Tag>
          </div>
          <Input
            placeholder="输入新分支名称"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onPressEnter={handleCreateBranch}
          />
        </Space>
      </Modal>

      {/* 合并分支对话框 */}
      <Modal
        title="合并分支"
        open={mergeModalVisible}
        onOk={handleMergeBranch}
        onCancel={() => {
          setMergeModalVisible(false)
          setSelectedMergeBranch('')
        }}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <span>目标分支: </span>
            <Tag color="blue">{currentBranch?.name}</Tag>
          </div>
          <div>
            <span>选择要合并的分支:</span>
          </div>
          <List
            size="small"
            dataSource={branches.filter((b) => !b.isCurrent)}
            renderItem={(branch) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  background:
                    selectedMergeBranch === branch.name ? '#e6f7ff' : 'transparent',
                }}
                onClick={() => setSelectedMergeBranch(branch.name)}
              >
                <Space>
                  {selectedMergeBranch === branch.name && <CheckOutlined />}
                  <span>{branch.name}</span>
                </Space>
              </List.Item>
            )}
          />
        </Space>
      </Modal>
    </Card>
  )
}
