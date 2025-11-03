/**
 * Chronos v2.0 - HistoryViewer Component
 * 
 * 历史记录查看器（时间线展示）
 */

import React, { useState } from 'react'
import { Timeline, Card, Button, Tag, Space, Typography, Empty } from 'antd'
import { ClockCircleOutlined, UserOutlined, RollbackOutlined, IdcardOutlined } from '@ant-design/icons'
import type { Snapshot } from '@/shared/types'
import { formatDate } from '@/shared/utils'

const { Text } = Typography

interface HistoryViewerProps {
  snapshots: Snapshot[]
  onCheckout: (commitId: string) => void
  loading?: boolean
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({
  snapshots,
  onCheckout,
  loading = false,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  console.log('[HistoryViewer] Rendering with snapshots:', snapshots.length)

  /**
   * 切换展开/收起状态
   */
  const toggleExpand = (commitId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commitId)) {
        newSet.delete(commitId)
      } else {
        newSet.add(commitId)
      }
      return newSet
    })
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <Empty
        description="暂无历史记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 40 }}
      />
    )
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <Timeline>
        {snapshots.map((snapshot, index) => {
          try {
            console.log(`[HistoryViewer] Rendering snapshot ${index}:`, {
              id: snapshot.id,
              message: snapshot.message,
              timestamp: snapshot.timestamp,
              timestampType: typeof snapshot.timestamp,
            })

            const isExpanded = expandedIds.has(snapshot.id)
            const hasMultilineMessage = snapshot.message.includes('\n')
            const messageLines = snapshot.message.split('\n')
            const messageTitle = messageLines[0]
            const messageDetail = messageLines.slice(1).join('\n').trim()

            return (
              <Timeline.Item
                key={snapshot.id}
                dot={<ClockCircleOutlined style={{ fontSize: 16 }} />}
                color={index === 0 ? 'green' : snapshot.isMerge ? 'green' : 'blue'}
              >
                <Card
                  size="small"
                  style={{
                    marginBottom: 16,
                    cursor: hasMultilineMessage ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                  }}
                  hoverable={hasMultilineMessage}
                  extra={
                    <Button
                      type="link"
                      size="small"
                      icon={<RollbackOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCheckout(snapshot.id)
                      }}
                      loading={loading}
                    >
                      回滚
                    </Button>
                  }
                  onClick={() => hasMultilineMessage && toggleExpand(snapshot.id)}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {/* 提交信息 */}
                    <div>
                      <Text strong>{messageTitle}</Text>
                      {index === 0 && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          最新
                        </Tag>
                      )}
                      {snapshot.isMerge && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          合并
                        </Tag>
                      )}
                      {hasMultilineMessage && (
                        <Tag
                          color="blue"
                          style={{ marginLeft: 8, cursor: 'pointer' }}
                        >
                          {isExpanded ? '收起详情 ▲' : '展开详情 ▼'}
                        </Tag>
                      )}
                    </div>

                    {/* 详细描述（如果有且已展开） */}
                    {hasMultilineMessage && isExpanded && messageDetail && (
                      <div
                        style={{
                          color: '#666',
                          fontSize: '12px',
                          whiteSpace: 'pre-wrap',
                          padding: '8px',
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          marginTop: '8px',
                        }}
                      >
                        {messageDetail}
                      </div>
                    )}

                    {/* 元信息 */}
                    <Space size="large" style={{ fontSize: '12px', color: '#999' }}>
                      <span>
                        <UserOutlined /> {snapshot.author}
                      </span>
                      <span>
                        <ClockCircleOutlined /> {formatDate(snapshot.timestamp)}
                      </span>
                      <span>
                        <IdcardOutlined /> ID: <Tag>{snapshot.shortId}</Tag>
                      </span>
                    </Space>

                    {/* 变更文件数量 */}
                    {snapshot.files && snapshot.files.length > 0 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          变更文件: {snapshot.files.length} 个
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Timeline.Item>
            )
          } catch (error) {
            console.error(`[HistoryViewer] Error rendering snapshot ${index}:`, error, snapshot)
            return (
              <Timeline.Item
                key={snapshot.id || `error-${index}`}
                dot={<ClockCircleOutlined style={{ fontSize: 16 }} />}
                color="red"
              >
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Text type="danger">快照渲染错误</Text>
                </Card>
              </Timeline.Item>
            )
          }
        })}
      </Timeline>
    </div>
  )
}
