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
  message,
  Drawer,
  Divider,
} from 'antd'
import {
  FolderOpenOutlined,
  CameraOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { open } from '@tauri-apps/plugin-dialog'
import { SnapshotDialog, HistoryViewer, BranchManager, FileTreeView, ReleaseNotes } from './components'
import { useRepository, useHistory, useBranches } from './hooks'
import { apiClient } from './api'

const { Header, Content } = Layout
const { Title, Text } = Typography

// LocalStorage key
const RECENT_REPOS_KEY = 'chronos_recent_repos'

// 不需要复杂的树结构函数了

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

  // 只有当错误消息是通用的HTTP错误时才转换为友好提示
  // 如果是具体的错误信息（如"不是Git仓库"），直接返回
  if (message === 'Not Found') {
    return '资源不存在！'
  }
  if (message === 'Bad Request') {
    return '请求参数错误！'
  }
  if (message === 'Forbidden') {
    return '没有访问权限！'
  }
  if (message === 'Internal Server Error') {
    return '服务器错误，请稍后重试！'
  }

  // 如果没有匹配到任何HTTP状态码，直接返回原始错误消息
  // 这样可以显示后端返回的实际错误信息
  if (message && message !== '[object Object]' && message !== 'undefined') {
    return message
  }

  return '操作失败，请重试！'
}

/**
 * 获取最近使用的项目文件夹列表
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

  // 使用说明抽屉状态
  const [helpDrawerVisible, setHelpDrawerVisible] = useState(false)

  // 软件更新说明抽屉状态
  const [releaseNotesVisible, setReleaseNotesVisible] = useState(false)

  // 加载最近使用的仓库
  useEffect(() => {
    setRecentRepos(getRecentRepos())

    // 检查 Tauri 环境
    console.log('=== Tauri 环境检查 ===')
    console.log('window.__TAURI__:', typeof (window as any).__TAURI__)
    console.log('@tauri-apps/plugin-dialog 导入:', typeof open)

    // 检查是否在 Tauri 环境中运行
    if (typeof (window as any).__TAURI__ === 'undefined') {
      console.warn('警告: 不在 Tauri 环境中运行，某些功能可能不可用')
    } else {
      console.log('✅ Tauri 环境正常')
    }

    // 检查后端服务器健康状态
    const checkBackendHealth = async () => {
      console.log('=== 检查后端服务器 ===')

      // 给后端3秒的初始启动时间
      console.log('等待后端启动...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      let attempts = 0
      const maxAttempts = 10
      const delay = 1000 // 1秒

      while (attempts < maxAttempts) {
        attempts++
        console.log(`尝试连接后端 (${attempts}/${maxAttempts})...`)

        const isHealthy = await apiClient.checkHealth()
        if (isHealthy) {
          console.log('✅ 后端服务器已就绪')
          message.success('应用已就绪', 2)
          return
        }

        if (attempts < maxAttempts) {
          console.log(`等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      console.error('❌ 后端服务器启动失败')
      Modal.error({
        title: '后端服务启动失败',
        content: (
          <div>
            <p>无法连接到后端服务器，请尝试：</p>
            <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>重启应用</li>
              <li>检查是否有其他程序占用8765端口</li>
              <li>查看控制台日志获取详细信息</li>
            </ol>
          </div>
        ),
      })
    }

    checkBackendHealth()
  }, [])

  // 使用自定义Hooks
  const repository = useRepository()
  const history = useHistory()
  const branches = useBranches()

  // 全局加载状态
  const globalLoading =
    repository.loading || history.loading || branches.loading

  // 打开文件夹选择对话框
  const handleSelectFolder = async () => {
    console.log('=== 开始打开文件夹选择对话框 ===')
    console.log('Tauri API 是否可用:', typeof open === 'function')

    try {
      console.log('调用 open() 函数...')
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择要打开的文件夹',
      })

      console.log('选择结果:', selected)
      console.log('选择结果类型:', typeof selected)

      if (selected && typeof selected === 'string') {
        console.log('设置路径:', selected)
        setPathInput(selected)
        message.success('文件夹选择成功')
      } else if (selected === null) {
        console.log('用户取消了选择')
        message.info('已取消选择')
      } else {
        console.log('未知的返回值:', selected)
      }
    } catch (error) {
      console.error('=== 选择文件夹失败 ===')
      console.error('错误对象:', error)
      console.error('错误类型:', typeof error)
      console.error('错误消息:', error instanceof Error ? error.message : String(error))
      console.error('错误堆栈:', error instanceof Error ? error.stack : 'N/A')

      Modal.error({
        title: '文件选择失败',
        content: (
          <div>
            <p>无法打开文件选择对话框</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              错误详情: {error instanceof Error ? error.message : String(error)}
            </p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              请检查浏览器控制台查看详细日志
            </p>
          </div>
        ),
      })
    }
  }

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
  const handleOpenRecentRepo = async (path: string) => {
    try {
      // 先尝试获取状态，验证路径是否有效
      const result = await apiClient.getStatus(path)

      if (result.success) {
        setPathInput(path)
        setRepoPath(path)
        setRepoInitialized(true)

        // 立即刷新数据
        repository.refreshStatus(path)
        history.refreshHistory(path)
        branches.refreshBranches(path)
      } else {
        // 路径无效，显示错误并删除记录
        message.error('该文件夹不存在或已被删除')
        removeRecentRepo(path)
        setRecentRepos(getRecentRepos())
      }
    } catch (error) {
      // 发生错误，显示提示并删除记录
      message.error('无法打开该文件夹，可能已被删除')
      removeRecentRepo(path)
      setRecentRepos(getRecentRepos())
    }
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

  // 返回首页
  const handleBackToHome = () => {
    Modal.confirm({
      title: '返回首页',
      content: '确定要返回首页吗？当前文件夹将被关闭。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setRepoPath('')
        setRepoInitialized(false)
        setPathInput('')
      },
    })
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
        <Title level={3} style={{ margin: 0 }}>
          Chronos - 文件时光机
        </Title>

        <Space size="large">
          {!repoInitialized && (
            <Text
              type="secondary"
              style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#8c8c8c'
              }}
            >
              Copyright © sunshunda
            </Text>
          )}

          <Space>
            {repoInitialized && (
              <>
                <Button
                  icon={<HomeOutlined />}
                  onClick={handleBackToHome}
                >
                  返回首页
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
                  创建备份
                </Button>
              </>
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
                  开始使用前，请先打开或初始化一个本地文件夹作为时光机文件夹
                </Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<FolderOpenOutlined />}
                  onClick={() => setInitModalVisible(true)}
                >
                  打开文件夹
                </Button>

                {/* 最近使用的仓库列表 */}
                {recentRepos.length > 0 && (
                  <div style={{ width: '100%', marginTop: '24px' }}>
                    <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                      <Space>
                        <ClockCircleOutlined />
                        <Text strong>最近使用的时光机文件夹</Text>
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
            <Col xs={24} lg={10}>
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {/* 时光机文件夹状态卡片 */}
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Space>
                        <FolderOpenOutlined />
                        <span>文件夹状态</span>
                      </Space>
                      <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        {repoPath}
                      </Text>
                    </div>
                  }
                  loading={repository.loading}
                >
                  {repository.status && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>当前副本: </Text>
                        <Text>{repository.status.branch}</Text>
                      </div>

                      {/* 有变动但未保存的文件列表 */}
                      {repository.status.changes.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>有变动但未保存的文件:</Text>
                            <Text strong>
                              共 {repository.status.changes.length} 个文件
                            </Text>
                          </div>
                          <FileTreeView
                            changes={repository.status.changes}
                            showCheckbox={false}
                            defaultExpandAll={false}
                          />
                        </div>
                      )}

                      {/* 已追踪的文件列表 */}
                      {repository.trackedFiles.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <Text strong style={{ marginBottom: '4px', display: 'block', fontSize: '13px' }}>
                            已追踪的文件 ({repository.trackedFiles.length}):
                          </Text>
                          <div style={{
                            maxHeight: '120px',
                            overflowY: 'auto',
                            border: '1px solid #e6f7ff',
                            borderRadius: '4px',
                            padding: '6px',
                            backgroundColor: '#f0f9ff'
                          }}>
                            {repository.trackedFiles.map((file, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '2px 0',
                                  borderBottom: index < repository.trackedFiles.length - 1 ? '1px solid #e6f7ff' : 'none'
                                }}
                              >
                                <Text style={{ fontSize: '12px', color: '#1890ff' }}>
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
                          创建备份
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
            <Col xs={24} lg={14}>
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

      {/* 备份创建对话框 */}
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

      {/* 打开时光机文件夹对话框 */}
      <Modal
        title="打开时光机文件夹"
        open={initModalVisible}
        onCancel={() => setInitModalVisible(false)}
        onOk={handleInitRepository}
        okText="打开"
        cancelText="取消"
        confirmLoading={repository.loading}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>文件夹路径</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              (必填)
            </Text>
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="例如: /Users/username/my-project"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onPressEnter={handleInitRepository}
            />
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              onClick={handleSelectFolder}
            >
              选择文件夹
            </Button>
          </Space.Compact>
          <Alert
            message="智能识别"
            description="系统会自动检测文件夹状态：如果未初始化则自动初始化，如果已初始化则直接打开"
            type="info"
            showIcon
          />
        </Space>
      </Modal>

      {/* 使用说明抽屉 */}
      <Drawer
        title={
          <Space>
            <QuestionCircleOutlined />
            <span>使用说明</span>
          </Space>
        }
        placement="right"
        width={400}
        open={helpDrawerVisible}
        onClose={() => setHelpDrawerVisible(false)}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 核心用法 */}
          <div>
            <Title level={5} style={{ marginBottom: '8px' }}>📝 核心用法</Title>
            <Text style={{ fontSize: '13px' }}>
              1. 打开文件夹 → 2. 修改文件 → 3. 创建备份 → 4. 查看历史
            </Text>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 功能按钮说明 */}
          <div>
            <Title level={5} style={{ marginBottom: '8px' }}>🔘 功能按钮</Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '13px' }}>📂 打开时光机文件夹</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>选择要管理的文件夹</Text>
              </div>

              <div>
                <Text strong style={{ fontSize: '13px' }}>💾 创建备份</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>为当前文件状态创建备份点</Text>
              </div>

              <div>
                <Text strong style={{ fontSize: '13px' }}>🔄 刷新</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>更新文件变更状态</Text>
              </div>

              <div>
                <Text strong style={{ fontSize: '13px' }}>⏮️ 恢复</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>恢复到历史备份点</Text>
              </div>

              <div>
                <Text strong style={{ fontSize: '13px' }}>📋 创建副本</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>创建独立工作副本</Text>
              </div>

              <div>
                <Text strong style={{ fontSize: '13px' }}>🔀 合并副本</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>合并副本到主版本</Text>
              </div>
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 联系方式 */}
          <Alert
            message="需要帮助？"
            description={
              <div>
                <Text style={{ fontSize: '12px' }}>联系开发者：</Text>
                <br />
                <Text strong copyable style={{ fontSize: '13px' }}>sunshunda@gmail.com</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ padding: '8px 12px' }}
          />
        </Space>
      </Drawer>

      {/* 软件更新说明抽屉 */}
      <ReleaseNotes
        visible={releaseNotesVisible}
        onClose={() => setReleaseNotesVisible(false)}
      />
    </Layout>
  )
}

export default App
