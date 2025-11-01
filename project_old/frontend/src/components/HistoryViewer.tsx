import React, { useState } from 'react'
import { Timeline, Card, Button, Modal, Empty, Space, Tag, message } from 'antd'
import {
  ClockCircleOutlined,
  UserOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import { apiClient } from '../api'
import type { CommitLog } from '../types/api'

interface HistoryViewerProps {
  commits: CommitLog[]
  loading: boolean
  repoPath: string
  onCheckout: (repoPath: string, commitId: string) => Promise<boolean>
  onRefresh: () => void
}

/**
 * HistoryViewer 组件
 * 显示提交历史时间线，支持恢复操作
 */
export const HistoryViewer: React.FC<HistoryViewerProps> = ({
  commits,
  loading,
  repoPath,
  onCheckout: _onCheckout,
  onRefresh,
}) => {
  const [selectedCommit, setSelectedCommit] = useState<CommitLog | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set())

  // 切换展开/折叠状态
  const toggleExpand = (commitId: string) => {
    setExpandedCommits((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commitId)) {
        newSet.delete(commitId)
      } else {
        newSet.add(commitId)
      }
      return newSet
    })
  }

  // 显示恢复确认对话框
  const showCheckoutConfirm = (commit: CommitLog) => {
    // 只显示提交消息的第一行（标题）
    const commitTitle = commit.message.split('\n')[0]
    
    Modal.confirm({
      title: '确认恢复',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>您确定要恢复到以下版本吗？</p>
          <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5' }}>
            <p>
              <strong>备份ID:</strong> {commit.id.substring(0, 8)}
            </p>
            <p>
              <strong>描述:</strong> {commitTitle}
            </p>
            <p>
              <strong>作者:</strong> {commit.author}
            </p>
            <p>
              <strong>时间:</strong> {commit.date}
            </p>
          </div>
          <p style={{ marginTop: 12, color: '#ff4d4f' }}>
            ⚠️
            警告：恢复操作会将工作目录恢复到该版本的状态，未保存的更改可能会丢失。
          </p>
        </div>
      ),
      okText: '确认恢复',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => handleCheckout(commit),
    })
  }

  // 处理恢复操作
  const handleCheckout = async (commit: CommitLog) => {
    setCheckoutLoading(true)
    setSelectedCommit(commit)

    try {
      // 直接调用API获取详细的错误信息
      const result = await apiClient.checkoutCommit(repoPath, commit.id)

      if (result.success) {
        message.success('恢复成功')
        onRefresh()
      } else {
        // 显示Backend返回的详细错误消息
        message.error(result.error || '恢复失败')
      }
    } catch (error) {
      message.error('恢复操作异常，请重试')
    } finally {
      setCheckoutLoading(false)
      setSelectedCommit(null)
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // 空状态
  if (!loading && commits.length === 0) {
    return (
      <Card>
        <Empty
          description="暂无历史记录"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    )
  }

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>历史记录</span>
          <Tag color="blue">{commits.length} 个备份</Tag>
        </Space>
      }
      loading={loading}
    >
      <Timeline>
        {commits.map((commit, index) => (
          <Timeline.Item
            key={commit.id}
            color={index === 0 ? 'green' : 'blue'}
            dot={
              index === 0 ? (
                <ClockCircleOutlined style={{ fontSize: '16px' }} />
              ) : undefined
            }
          >
            <Card
              size="small"
              style={{ 
                marginBottom: 8,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              hoverable
              extra={
                <Button
                  type="link"
                  icon={<RollbackOutlined />}
                  loading={checkoutLoading && selectedCommit?.id === commit.id}
                  onClick={(e) => {
                    e.stopPropagation() // 防止触发卡片点击
                    showCheckoutConfirm(commit)
                  }}
                  disabled={checkoutLoading}
                >
                  恢复到此版本
                </Button>
              }
              onClick={() => toggleExpand(commit.id)}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {/* 提交信息 */}
                <div>
                  <strong>{commit.message.split('\n')[0]}</strong>
                  {index === 0 && (
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      最新
                    </Tag>
                  )}
                  {commit.message.includes('\n') && (
                    <Tag 
                      color="blue" 
                      style={{ marginLeft: 8, fontSize: '11px' }}
                    >
                      {expandedCommits.has(commit.id) ? '收起详情 ▲' : '展开详情 ▼'}
                    </Tag>
                  )}
                </div>

                {/* 详细描述（如果有且已展开） */}
                {commit.message.includes('\n') && expandedCommits.has(commit.id) && (
                  <div
                    style={{
                      color: '#666',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      padding: '8px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      marginTop: '8px'
                    }}
                  >
                    {commit.message.split('\n').slice(1).join('\n').trim()}
                  </div>
                )}

                {/* 元信息 */}
                <Space size="large" style={{ fontSize: '12px', color: '#999' }}>
                  <span>
                    <UserOutlined /> {commit.author}
                  </span>
                  <span>
                    <ClockCircleOutlined /> {formatDate(commit.date)}
                  </span>
                  <span>
                    <IdcardOutlined /> ID: <Tag>{commit.id.substring(0, 8)}</Tag>
                  </span>
                </Space>
              </Space>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  )
}
