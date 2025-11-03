/**
 * Chronos v2.0 - Repository Page
 * 
 * 仓库管理页面
 */

import React, { useState, useMemo } from 'react'
import { Layout, Button, Space, Typography, Card, Tag, Tabs, Modal } from 'antd'
import {
  HomeOutlined,
  ReloadOutlined,
  SaveOutlined,
  QuestionCircleOutlined,
  FolderOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useRepository } from '../hooks/useRepository'
import { FileTree } from '../components/FileTree'
import { HistoryViewer } from '../components/HistoryViewer'
import { BranchManager } from '../components/BranchManager'
import { SnapshotDialog } from '../components/SnapshotDialog'
import { ReleaseNotesDrawer } from '../components/ReleaseNotesDrawer'
import { HelpDrawer } from '../components/HelpDrawer'
import type { FileNode } from '../../../shared/types'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

export const RepositoryPage: React.FC = () => {
  const {
    currentRepository,
    status,
    files,
    snapshots,
    branches,
    loading,
    closeRepository,
    refreshStatus,
    createSnapshot,
    checkoutSnapshot,
    createBranch,
    switchBranch,
    mergeBranch,
  } = useRepository()

  const [snapshotDialogVisible, setSnapshotDialogVisible] = useState(false)
  const [helpDrawerVisible, setHelpDrawerVisible] = useState(false)
  const [releaseNotesVisible, setReleaseNotesVisible] = useState(false)

  // 递归统计文件数量（不包括文件夹）
  const countFiles = (fileList: FileNode[]): number => {
    let count = 0
    for (const file of fileList) {
      if (file.type === 'directory' && file.children) {
        count += countFiles(file.children) // 递归统计子文件
      } else {
        count += 1 // 只统计文件
      }
    }
    return count
  }

  // 创建变更文件路径集合（用于快速查找）
  const changedPathsSet = useMemo(() => {
    if (!status) return new Set<string>()
    return new Set(status.changes.map(c => c.path))
  }, [status])

  // 计算有变更的文件 - 使用 status.changes 路径集合判断
  const changedFiles = useMemo(() => {
    if (!status || status.changes.length === 0) return []

    const findChangedFiles = (fileList: FileNode[]): FileNode[] => {
      const result: FileNode[] = []

      for (const file of fileList) {
        if (file.type === 'directory' && file.children) {
          const changedChildren = findChangedFiles(file.children)
          if (changedChildren.length > 0) {
            result.push({
              ...file,
              children: changedChildren
            })
          }
        } else if (changedPathsSet.has(file.path)) {
          // 使用 status.changes 中的路径来判断文件是否有变更
          result.push(file)
        }
      }

      return result
    }

    return findChangedFiles(files)
  }, [files, status, changedPathsSet])

  // 计算已追踪但未变更的文件 - 不在 status.changes 中的文件
  const trackedFiles = useMemo(() => {
    if (!status) return files

    const filterTrackedFiles = (fileList: FileNode[]): FileNode[] => {
      const result: FileNode[] = []

      for (const file of fileList) {
        if (file.type === 'directory' && file.children) {
          const filteredChildren = filterTrackedFiles(file.children)
          if (filteredChildren.length > 0) {
            result.push({
              ...file,
              children: filteredChildren
            })
          }
        } else if (!changedPathsSet.has(file.path)) {
          // 不在变更列表中的文件，说明是已追踪但未变更的文件
          result.push(file)
        }
      }

      return result
    }

    return filterTrackedFiles(files)
  }, [files, status, changedPathsSet])

  // 计算文件数量（使用 countFiles 函数）
  const changedFilesCount = useMemo(() => countFiles(changedFiles), [changedFiles])
  const trackedFilesCount = useMemo(() => countFiles(trackedFiles), [trackedFiles])

  if (!currentRepository) {
    return null
  }

  const handleCreateSnapshot = async (message: string) => {
    await createSnapshot(message)
    setSnapshotDialogVisible(false)
  }

  const handleBackToHome = () => {
    Modal.confirm({
      title: '确认返回首页？',
      icon: <ExclamationCircleOutlined />,
      content: '返回首页后，当前仓库将被关闭。',
      okText: '确认',
      cancelText: '取消',
      onOk: closeRepository,
    })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Chronos - {currentRepository.name}
        </Title>

        <Space>
          <Button icon={<HomeOutlined />} onClick={handleBackToHome}>
            返回首页
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshStatus}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => setSnapshotDialogVisible(true)}
            disabled={status?.isClean}
          >
            创建快照
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setReleaseNotesVisible(true)}
          >
            软件更新说明
          </Button>
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={() => setHelpDrawerVisible(true)}
          >
            使用说明
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={400}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: 20 }}>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text strong>当前分支: </Text>
                  <Tag color="blue">{status?.branch || 'main'}</Tag>
                </div>
                <div>
                  <Text strong>状态: </Text>
                  {status?.isClean ? (
                    <Tag color="green">干净</Tag>
                  ) : (
                    <Tag color="orange">{status?.changes.length} 个变更</Tag>
                  )}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <FolderOutlined /> {currentRepository.path}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* 有变动但未保存的文件 */}
            {status && status.changes.length > 0 && changedFiles.length > 0 && (
              <Card
                size="small"
                style={{ marginBottom: 16 }}
                title={
                  <Space>
                    <Text strong>有变动但未保存的文件:</Text>
                    <Tag color="orange">共 {changedFilesCount} 个文件</Tag>
                  </Space>
                }
              >
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  <FileTree 
                    files={changedFiles} 
                    showStatus
                    showCheckbox
                  />
                </div>
              </Card>
            )}

            {/* 已追踪的文件 */}
            {trackedFiles.length > 0 && (
              <Card
                size="small"
                style={{ marginBottom: 16, background: '#f0f9ff' }}
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    已追踪的文件 ({trackedFilesCount}):
                  </Text>
                }
              >
                <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                  <FileTree files={trackedFiles} showCheckbox={false} />
                </div>
              </Card>
            )}

            <Tabs
              defaultActiveKey="branches"
              items={[
                {
                  key: 'branches',
                  label: '分支管理',
                  children: (
                    <BranchManager
                      branches={branches}
                      onCreateBranch={createBranch}
                      onSwitchBranch={switchBranch}
                      onMergeBranch={mergeBranch}
                      loading={loading}
                    />
                  ),
                },
              ]}
            />
          </div>
        </Sider>

        <Content style={{ padding: 20, background: '#fff', overflow: 'auto' }}>
          <Title level={5}>历史记录</Title>
          <HistoryViewer
            snapshots={snapshots}
            onCheckout={checkoutSnapshot}
            loading={loading}
          />
        </Content>
      </Layout>

      <SnapshotDialog
        visible={snapshotDialogVisible}
        onOk={handleCreateSnapshot}
        onCancel={() => setSnapshotDialogVisible(false)}
        loading={loading}
      />

      <ReleaseNotesDrawer
        visible={releaseNotesVisible}
        onClose={() => setReleaseNotesVisible(false)}
      />

      <HelpDrawer
        visible={helpDrawerVisible}
        onClose={() => setHelpDrawerVisible(false)}
      />
    </Layout>
  )
}
