import { useState } from 'react'
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
} from 'antd'
import {
  FolderOpenOutlined,
  CameraOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { SnapshotDialog, HistoryViewer, BranchManager } from './components'
import { useRepository, useHistory, useBranches } from './hooks'
import { apiClient } from './api'

const { Header, Content } = Layout
const { Title, Text } = Typography

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

  // 快照对话框状态
  const [snapshotDialogVisible, setSnapshotDialogVisible] = useState(false)

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

    const success = await repository.initRepository(pathInput)
    if (success) {
      setRepoPath(pathInput)
      setRepoInitialized(true)
      setInitModalVisible(false)
      refreshAll()
    }
  }

  // 打开现有仓库
  const handleOpenRepository = () => {
    if (!pathInput.trim()) {
      Modal.error({ title: '错误', content: '请输入仓库路径' })
      return
    }

    setRepoPath(pathInput)
    setRepoInitialized(true)
    setInitModalVisible(false)
    refreshAll()
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
                        <Text strong>变更文件: </Text>
                        <Text>{repository.status.changes.length} 个</Text>
                      </div>
                      
                      {/* 文件列表 */}
                      {repository.status.changes.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                            文件列表:
                          </Text>
                          <div style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            padding: '8px'
                          }}>
                            {repository.status.changes.map((change, index) => (
                              <div 
                                key={index}
                                style={{ 
                                  padding: '4px 0',
                                  borderBottom: index < repository.status.changes.length - 1 ? '1px solid #f0f0f0' : 'none'
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

      {/* 初始化/打开仓库对话框 */}
      <Modal
        title="打开仓库"
        open={initModalVisible}
        onCancel={() => setInitModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setInitModalVisible(false)}>
            取消
          </Button>,
          <Button key="open" onClick={handleOpenRepository}>
            打开现有仓库
          </Button>,
          <Button
            key="init"
            type="primary"
            onClick={handleInitRepository}
            loading={repository.loading}
          >
            初始化新仓库
          </Button>,
        ]}
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
            onPressEnter={handleOpenRepository}
          />
          <Alert
            message="提示"
            description={
              <div>
                <p>• 打开现有仓库：选择已经初始化的Git仓库路径</p>
                <p>• 初始化新仓库：在指定路径创建新的Git仓库</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </Layout>
  )
}

export default App
