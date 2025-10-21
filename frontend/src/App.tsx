import { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Alert,
  Input,
  Modal,
  List,
} from 'antd'
import {
  FolderOpenOutlined,
  CameraOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { SnapshotDialog, HistoryViewer, BranchManager } from './components'
import { useRepository, useHistory, useBranches } from './hooks'
import { apiClient } from './api'

const { Header, Content } = Layout
const { Title, Text } = Typography

// LocalStorage key
const RECENT_REPOS_KEY = 'chronos_recent_repos'

/**
 * 将HTTP错误转换为用户友好的错误消息
 */
function getErrorMessage(error: any): string {
  // 检查是否有response对象（axios错误）
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return '文件目录不存在！'
      case 403:
        return '没有访问权限！'
      case 404:
        return '资源不存在！'
      case 500:
        return '服务器错误，请稍后重试！'
      default:
        return '操作失败，请重试！'
    }
  }

  // 如果是Error对象或字符串，检查是否包含HTTP状态码
  const message = error instanceof Error ? error.message : String(error)

  // 匹配 "HTTP错误: 400" 这种格式
  const httpErrorMatch = message.match(/HTTP错误[：:]\s*(\d+)/)
  if (httpErrorMatch) {
    const statusCode = parseInt(httpErrorMatch[1])
    switch (statusCode) {
      case 400:
        return '文件目录不存在！'
      case 403:
        return '没有访问权限！'
      case 404:
        return '资源不存在！'
      case 500:
        return '服务器错误，请稍后重试！'
      default:
        return '操作失败，请重试！'
    }
  }

  // 检查其他常见错误关键词
  if (message.includes('400') || message.includes('Bad Request')) {
    return '文件目录不存在！'
  }
  if (message.includes('403') || message.includes('Forbidden')) {
    return '没有访问权限！'
  }
  if (message.includes('404') || message.includes('Not Found')) {
    return '资源不存在！'
  }
  if (message.includes('500') || message.includes('Internal Server Error')) {
    return '服务器错误，请稍后重试！'
  }

  return '操作失败，请重试！'
}

/**
 * 获取最近使用的仓库列表
 */
function getRecentRepos(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_REPOS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * 保存仓库到最近使用列表
 */
function saveRecentRepo(path: string) {
  try {
    const recent = getRecentRepos()
    // 移除重复项
    const filtered = recent.filter((p) => p !== path)
    // 添加到开头
    const updated = [path, ...filtered].slice(0, 10) // 最多保存10个
    localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('保存最近仓库失败:', error)
  }
}

/**
 * 从最近使用列表中删除仓库
 */
function removeRecentRepo(path: string) {
  try {
    const recent = getRecentRepos()
    const updated = recent.filter((p) => p !== path)
    localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('删除最近仓库失败:', error)
  }
}

/**
 * App主组件
 * 集成所有功能模块，提供完整的应用界面
 */
function App() {
  // 仓库路径状态
  const [repoPath, setRepoPath] = useState<string>('')
  const [repoInitialized, setRepoInitialized] = useState(false)
  const [initModalVisible, setInitModalVisible] = useState(false)
  const [pathInput, setPathInput] = useState('')

  // 最近使用的仓库列表
  const [recentRepos, setRecentRepos] = useState<string[]>([])

  // 快照对话框状态
  const [snapshotDialogVisible, setSnapshotDialogVisible] = useState(false)

  // 加载最近使用的仓库
  useEffect(() => {
    setRecentRepos(getRecentRepos())
  }, [])

  // 使用自定义Hooks
  const repository = useRepository()
  const history = useHistory()
  const branches = useBranches()

  // 全局加载状态
  const globalLoading =
    repository.loading || history.loading || branches.loading

  // 初始化仓库
  const handleInitRepository = async () => {
    if (!pathInput.trim()) {
      Modal.error({ title: '错误', content: '请输入仓库路径' })
      return
    }

    try {
      const result = await apiClient.initRepository(pathInput)

      if (result.success) {
        // 保存到最近使用列表
        saveRecentRepo(pathInput)
        setRecentRepos(getRecentRepos())

        // 设置仓库状态
        setRepoPath(pathInput)
        setRepoInitialized(true)
        setInitModalVisible(false)

        // 立即刷新数据（使用pathInput而不是repoPath）
        repository.refreshStatus(pathInput)
        history.refreshHistory(pathInput)
        branches.refreshBranches(pathInput)
      } else {
        Modal.error({
          title: '打开失败',
          content: getErrorMessage(result.error || '无法打开仓库，请检查路径是否正确'),
        })
      }
    } catch (error) {
      Modal.error({
        title: '打开失败',
        content: getErrorMessage(error),
      })
    }
  }

  // 从最近列表打开仓库
  const handleOpenRecentRepo = (path: string) => {
    setPathInput(path)
    setRepoPath(path)
    setRepoInitialized(true)

    // 立即刷新数据
    repository.refreshStatus(path)
    history.refreshHistory(path)
    branches.refreshBranches(path)
  }

  // 删除最近使用的仓库
  const handleRemoveRecentRepo = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRecentRepo(path)
    setRecentRepos(getRecentRepos())
  }

  // 刷新所有数据
  const refreshAll = () => {
    if (repoPath) {
      repository.refreshStatus(repoPath)
      history.refreshHistory(repoPath)
      branches.refreshBranches(repoPath)
    }
  }

  // 创建快照
  const handleCreateCommit = async (
    path: string,
    message: string,
    files: string[]
  ): Promise<boolean> => {
    const result = await apiClient.createCommit(path, message, files)
    return result.success
  }

  // 显示错误边界
  if (repository.error || history.error || branches.error) {
    const errorMessage =
      repository.error || history.error || branches.error || '未知错误'

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px' }}>
          <Alert
            message="发生错误"
            description={errorMessage}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={refreshAll}>
                重试
              </Button>
            }
          />
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            Chronos - 文件时光机
          </Title>
          {repoInitialized && (
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {repoPath}
            </Text>
          )}
        </Space>

        <Space size="large">
          <Text
            type="secondary"
            style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: '#8c8c8c'
            }}
          >
            Copyright © sunshunda
          </Text>

          <Space>
            {repoInitialized && (
              <>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refreshAll}
                  loading={globalLoading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={() => setSnapshotDialogVisible(true)}
                  disabled={
                    !repository.status || repository.status.changes.length === 0
                  }
                >
                  创建快照
                </Button>
              </>
            )}
            {!repoInitialized && (
              <Button
                type="primary"
                icon={<FolderOpenOutlined />}
                onClick={() => setInitModalVisible(true)}
              >
                打开仓库
              </Button>
            )}
          </Space>
        </Space>
      </Header>

      {/* 主内容区 */}
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {!repoInitialized ? (
          // 欢迎页面
          <div
            style={{
              maxWidth: '600px',
              margin: '100px auto',
              textAlign: 'center',
            }}
          >
            <Card>
              <Space
                direction="vertical"
                size="large"
                style={{ width: '100%' }}
              >
                <FolderOpenOutlined
                  style={{ fontSize: '64px', color: '#1890ff' }}
                />
                <Title level={2}>欢迎使用 Chronos</Title>
                <Text type="secondary">
                  开始使用前，请先打开或初始化一个仓库
                </Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<FolderOpenOutlined />}
                  onClick={() => setInitModalVisible(true)}
                >
                  打开仓库
                </Button>

                {/* 最近使用的仓库列表 */}
                {recentRepos.length > 0 && (
                  <div style={{ width: '100%', marginTop: '24px' }}>
                    <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                      <Space>
                        <ClockCircleOutlined />
                        <Text strong>最近使用的仓库</Text>
                      </Space>
                    </div>
                    <List
                      size="small"
                      bordered
                      dataSource={recentRepos}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onClick={() => handleOpenRecentRepo(item)}
                          actions={[
                            <Button
                              key="delete"
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => handleRemoveRecentRepo(item, e)}
                            />,
                          ]}
                        >
                          <Text ellipsis style={{ maxWidth: '400px' }}>
                            {item}
                          </Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Space>
            </Card>
          </div>
        ) : (
          // 主工作区
          <Row gutter={[16, 16]}>
            {/* 左侧：状态和分支管理 */}
            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                {/* 仓库状态卡片 */}
                <Card
                  title={
                    <Space>
                      <FolderOpenOutlined />
                      <span>仓库状态</span>
                    </Space>
                  }
                  loading={repository.loading}
                >
                  {repository.status && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>当前分支: </Text>
                        <Text>{repository.status.branch}</Text>
                      </div>
                      <div>
                        <Text strong>待提交的变更: </Text>
                        <Text>{repository.status.changes.length} 个</Text>
                      </div>

                      {/* 待提交的变更列表 */}
                      {repository.status.changes.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                            待提交的变更:
                          </Text>
                          <div style={{
                            maxHeight: '150px',
                            overflowY: 'auto',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            padding: '8px',
                            backgroundColor: '#fafafa'
                          }}>
                            {repository.status.changes.map((change, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '4px 0',
                                  borderBottom: index < (repository.status?.changes.length || 0) - 1 ? '1px solid #f0f0f0' : 'none'
                                }}
                              >
                                <Space>
                                  <Text
                                    type={
                                      change.status === 'added' ? 'success' :
                                        change.status === 'modified' ? 'warning' :
                                          change.status === 'deleted' ? 'danger' : 'secondary'
                                    }
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      minWidth: '50px'
                                    }}
                                  >
                                    {change.status === 'added' ? '新增' :
                                      change.status === 'modified' ? '修改' :
                                        change.status === 'deleted' ? '删除' : change.status}
                                  </Text>
                                  <Text style={{ fontSize: '13px' }}>{change.file}</Text>
                                </Space>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 已追踪的文件列表 */}
                      {repository.trackedFiles.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                            已追踪的文件 ({repository.trackedFiles.length}):
                          </Text>
                          <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #e6f7ff',
                            borderRadius: '4px',
                            padding: '8px',
                            backgroundColor: '#f0f9ff'
                          }}>
                            {repository.trackedFiles.map((file, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '4px 0',
                                  borderBottom: index < repository.trackedFiles.length - 1 ? '1px solid #e6f7ff' : 'none'
                                }}
                              >
                                <Text style={{ fontSize: '13px', color: '#1890ff' }}>
                                  📄 {file}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {repository.status.changes.length > 0 && (
                        <Button
                          type="primary"
                          icon={<CameraOutlined />}
                          onClick={() => setSnapshotDialogVisible(true)}
                          block
                          style={{ marginTop: '12px' }}
                        >
                          创建快照
                        </Button>
                      )}
                    </Space>
                  )}
                </Card>

                {/* 分支管理 */}
                <BranchManager
                  branches={branches.branches}
                  currentBranch={branches.currentBranch}
                  loading={branches.loading}
                  repoPath={repoPath}
                  onCreateBranch={branches.createBranch}
                  onSwitchBranch={branches.switchBranch}
                  onMergeBranch={branches.mergeBranch}
                  onRefresh={refreshAll}
                />
              </Space>
            </Col>

            {/* 右侧：历史记录 */}
            <Col xs={24} lg={16}>
              <HistoryViewer
                commits={history.commits}
                loading={history.loading}
                repoPath={repoPath}
                onCheckout={history.checkoutCommit}
                onRefresh={refreshAll}
              />
            </Col>
          </Row>
        )}
      </Content>

      {/* 快照创建对话框 */}
      {repoInitialized && (
        <SnapshotDialog
          visible={snapshotDialogVisible}
          changes={repository.status?.changes || []}
          repoPath={repoPath}
          onClose={() => setSnapshotDialogVisible(false)}
          onSuccess={refreshAll}
          onCreateCommit={handleCreateCommit}
        />
      )}

      {/* 打开仓库对话框 */}
      <Modal
        title="打开仓库"
        open={initModalVisible}
        onCancel={() => setInitModalVisible(false)}
        onOk={handleInitRepository}
        okText="打开"
        cancelText="取消"
        confirmLoading={repository.loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>仓库路径</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              (必填)
            </Text>
          </div>
          <Input
            placeholder="例如: /Users/username/my-project"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onPressEnter={handleInitRepository}
          />
          <Alert
            message="智能识别"
            description="系统会自动检测文件夹状态：如果未初始化则自动初始化，如果已初始化则直接打开"
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </Layout>
  )
}

export default App
