import React, { useState } from 'react'
import {
  Card,
  Select,
  Button,
  Space,
  Modal,
  Input,
  message,
  Tag,
  Divider,
} from 'antd'
import {
  BranchesOutlined,
  PlusOutlined,
  SwapOutlined,
  MergeCellsOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

interface BranchManagerProps {
  branches: string[]
  currentBranch: string | null
  loading: boolean
  repoPath: string
  onCreateBranch: (repoPath: string, name: string) => Promise<boolean>
  onSwitchBranch: (repoPath: string, branch: string) => Promise<boolean>
  onMergeBranch: (
    repoPath: string,
    sourceBranch: string,
    targetBranch: string
  ) => Promise<{ success: boolean; conflicts?: string[] }>
  onRefresh: () => void
}

/**
 * BranchManager 组件
 * 管理分支：创建、切换、合并
 */
export const BranchManager: React.FC<BranchManagerProps> = ({
  branches,
  currentBranch,
  loading,
  repoPath,
  onCreateBranch,
  onSwitchBranch,
  onMergeBranch,
  onRefresh,
}) => {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [targetBranch, setTargetBranch] = useState('main')
  const [actionLoading, setActionLoading] = useState(false)

  // 处理创建分支
  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      message.error('请输入分支名称')
      return
    }

    // 验证分支名称格式
    if (!/^[a-zA-Z0-9_-]+$/.test(newBranchName)) {
      message.error('分支名称只能包含字母、数字、下划线和连字符')
      return
    }

    // 检查分支是否已存在
    if (branches.includes(newBranchName)) {
      message.error('分支已存在')
      return
    }

    setActionLoading(true)

    try {
      const success = await onCreateBranch(repoPath, newBranchName)

      if (success) {
        message.success(`分支 "${newBranchName}" 创建成功`)
        setCreateModalVisible(false)
        const createdBranchName = newBranchName
        setNewBranchName('')
        
        // 自动切换到新创建的分支
        try {
          const switchSuccess = await onSwitchBranch(repoPath, createdBranchName)
          if (switchSuccess) {
            message.success(`已自动切换到分支 "${createdBranchName}"`)
          }
        } catch (error) {
          // 切换失败不影响创建成功的提示
          console.error('自动切换分支失败:', error)
        }
        
        onRefresh()
      } else {
        message.error('创建分支失败')
      }
    } catch (error) {
      message.error('创建分支失败')
    } finally {
      setActionLoading(false)
    }
  }

  // 处理切换分支
  const handleSwitchBranch = async (branch: string) => {
    if (branch === currentBranch) {
      return
    }

    Modal.confirm({
      title: '确认切换分支',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            您确定要从 <Tag color="blue">{currentBranch}</Tag> 切换到{' '}
            <Tag color="green">{branch}</Tag> 吗？
          </p>
          <p style={{ color: '#ff4d4f' }}>
            ⚠️ 请确保当前分支的更改已保存为快照。
          </p>
        </div>
      ),
      okText: '确认切换',
      cancelText: '取消',
      onOk: async () => {
        setActionLoading(true)
        try {
          const success = await onSwitchBranch(repoPath, branch)
          if (success) {
            message.success(`已切换到分支 "${branch}"`)
            onRefresh()
          } else {
            message.error('切换分支失败')
          }
        } catch (error) {
          message.error('切换分支失败')
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  // 显示合并预览对话框
  const showMergeModal = () => {
    if (!currentBranch) {
      message.error('无法确定当前分支')
      return
    }

    if (currentBranch === 'main') {
      message.warning('当前已在主分支，无需合并')
      return
    }

    setTargetBranch('main')
    setMergeModalVisible(true)
  }

  // 处理合并分支
  const handleMergeBranch = async () => {
    if (!currentBranch) {
      message.error('无法确定当前分支')
      return
    }

    setActionLoading(true)

    try {
      const result = await onMergeBranch(repoPath, currentBranch, targetBranch)

      if (result.success) {
        if (result.conflicts && result.conflicts.length > 0) {
          Modal.warning({
            title: '合并完成，但存在冲突',
            content: (
              <div>
                <p>以下文件存在冲突，需要手动解决：</p>
                <ul>
                  {result.conflicts.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
            ),
          })
        } else {
          message.success(
            `分支 "${currentBranch}" 已成功合并到 "${targetBranch}"`
          )
        }
        setMergeModalVisible(false)
        onRefresh()
      } else {
        message.error('合并分支失败')
      }
    } catch (error) {
      message.error('合并分支失败')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <Card
        title={
          <Space>
            <BranchesOutlined />
            <span>分支管理</span>
          </Space>
        }
        loading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 当前分支显示 */}
          <div>
            <div style={{ marginBottom: 8, color: '#666' }}>当前分支</div>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
              <BranchesOutlined /> {currentBranch || '未知'}
            </Tag>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* 分支选择器 */}
          <div>
            <div style={{ marginBottom: 8, color: '#666' }}>切换分支</div>
            <Select
              style={{ width: '100%' }}
              value={currentBranch}
              onChange={handleSwitchBranch}
              disabled={actionLoading || branches.length === 0}
              placeholder="选择分支"
              suffixIcon={<SwapOutlined />}
            >
              {branches.map((branch) => (
                <Select.Option key={branch} value={branch}>
                  <Space>
                    <BranchesOutlined />
                    {branch}
                    {branch === currentBranch && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        当前
                      </Tag>
                    )}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* 操作按钮 */}
          <Space style={{ width: '100%' }} direction="vertical">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              disabled={actionLoading}
              block
            >
              创建新分支
            </Button>

            {currentBranch && currentBranch !== 'main' && (
              <Button
                icon={<MergeCellsOutlined />}
                onClick={showMergeModal}
                disabled={actionLoading}
                block
              >
                合并到主版本
              </Button>
            )}
          </Space>
        </Space>
      </Card>

      {/* 创建分支对话框 */}
      <Modal
        title="创建新分支"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          setNewBranchName('')
        }}
        onOk={handleCreateBranch}
        confirmLoading={actionLoading}
        okText="创建"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              分支名称 <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <Input
              placeholder="例如: feature-new-ui"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onPressEnter={handleCreateBranch}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              只能包含字母、数字、下划线和连字符
            </div>
          </div>
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              新分支将基于当前分支 <Tag color="blue">{currentBranch}</Tag> 创建
            </div>
          </div>
        </Space>
      </Modal>

      {/* 合并预览对话框 */}
      <Modal
        title="合并分支"
        open={mergeModalVisible}
        onCancel={() => setMergeModalVisible(false)}
        onOk={handleMergeBranch}
        confirmLoading={actionLoading}
        okText="确认合并"
        okType="primary"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <p>
              将分支 <Tag color="green">{currentBranch}</Tag> 合并到{' '}
              <Tag color="blue">{targetBranch}</Tag>
            </p>
          </div>

          <div style={{ padding: 12, background: '#fff7e6', borderRadius: 4 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span style={{ marginLeft: 8, color: '#666' }}>
              合并操作会将当前分支的所有更改应用到目标分支
            </span>
          </div>

          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <p style={{ margin: 0 }}>
                <strong>提示：</strong>
              </p>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>如果存在冲突，需要手动解决</li>
                <li>建议在合并前创建快照</li>
              </ul>
            </div>
          </div>
        </Space>
      </Modal>
    </>
  )
}
