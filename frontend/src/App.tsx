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
  Tree,
} from 'antd'
import type { TreeDataNode } from 'antd'
import {
  FolderOpenOutlined,
  CameraOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
  FolderOutlined,
  FileOutlined,
} from '@ant-design/icons'
import { open } from '@tauri-apps/plugin-dialog'
import { SnapshotDialog, HistoryViewer, BranchManager } from './components'
import { useRepository, useHistory, useBranches } from './hooks'
import { apiClient } from './api'

const { Header, Content } = Layout
const { Title, Text } = Typography

// LocalStorage key
const RECENT_REPOS_KEY = 'chronos_recent_repos'

/**
 * 将文件列表转换为树状结构（最多展示4级）
 */
function buildFileTree(changes: Array<{ status: string; file: string }>): TreeDataNode[] {
  const MAX_DEPTH = 4
  const tree: { [key: string]: any } = {}

  changes.forEach((change) => {
    const parts = change.file.split('/')
    let current = tree

    // 限制最多4级
    const displayParts = parts.slice(0, MAX_DEPTH)
    const hasMore = parts.length > MAX_DEPTH

    displayParts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          isFile: index === displayParts.length - 1 && !hasMore,
          children: {},
          status: change.status,
          fullPath: parts.slice(0, index + 1).join('/'),
        }
      }
      // 如果是最后一级但还有更多层级，添加省略提示
      if (index === displayParts.length - 1 && hasMore) {
        const remainingPath = parts.slice(MAX_DEPTH).join('/')
        const ellipsisKey = `.../${remainingPath}`
        current[part].children[ellipsisKey] = {
          isFile: true,
          children: {},
          status: change.status,
          fullPath: change.file,
        }
      }
      current = current[part].children
    })
  })

  function convertToTreeData(obj: any, depth: number = 0): TreeDataNode[] {
    return Object.keys(obj).map((key) => {
      const node = obj[key]
      const isFile = node.isFile

      // 状态标签
      const statusText = node.status === 'added' ? '新增' :
        node.status === 'modified' ? '修改' :
          node.status === 'deleted' ? '删除' : ''

      const statusColor = node.status === 'added' ? '#52c41a' :
        node.status === 'modified' ? '#faad14' :
          node.status === 'deleted' ? '#ff4d4f' : '#999'

      const hasChildren = Object.keys(node.children).length > 0

      return {
        title: (
          <Space size={4}>
            <span style={{ fontSize: '13px' }}>{key}</span>
            {isFile && statusText && (
              <span style={{
                fontSize: '11px',
                color: statusColor,
                fontWeight: 'bold',
                marginLeft: '4px'
              }}>
                [{statusText}]
              </span>
            )}
          </Space>
        ),
        key: node.fullPath || key,
        icon: isFile ? <FileOutlined style={{ fontSize: '12px' }} /> : <FolderOutlined style={{ fontSize: '12px' }} />,
        children: hasChildren && depth < MAX_DEPTH - 1
          ? convertToTreeData(node.children, depth + 1)
          : undefined,
        isLeaf: isFile || !hasChildren,
      }
    })
  }

  return convertToTreeData(tree)
}

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

                      {/* 待提交的变更列表 - 树状结构 */}
                      {repository.status.changes.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>待提交的变更:</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              (最多展示4级目录)
                            </Text>
                          </div>
                          <div style={{
                            maxHeight: '250px',
                            overflowY: 'auto',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            padding: '8px',
                            backgroundColor: '#fafafa'
                          }}>
                            <Tree
                              showIcon
                              showLine
                              defaultExpandAll
                              treeData={buildFileTree(repository.status.changes)}
                              style={{ background: 'transparent' }}
                            />
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
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>仓库路径</Text>
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
        width={450}
        open={helpDrawerVisible}
        onClose={() => setHelpDrawerVisible(false)}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 核心用法 */}
          <div>
            <Title level={4}>📝 核心用法</Title>
            <Text>
              1. 打开文件夹 → 2. 修改文件 → 3. 创建备份 → 4. 查看历史
            </Text>
          </div>

          <Divider />

          {/* 功能按钮说明 */}
          <div>
            <Title level={4}>🔘 功能按钮</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>📂 打开项目文件夹</Text>
                <br />
                <Text type="secondary">选择要管理的文件夹</Text>
              </div>

              <div>
                <Text strong>💾 创建备份</Text>
                <br />
                <Text type="secondary">为当前文件状态创建一个备份点</Text>
              </div>

              <div>
                <Text strong>🔄 刷新</Text>
                <br />
                <Text type="secondary">更新文件变更状态和历史记录</Text>
              </div>

              <div>
                <Text strong>⏮️ 恢复</Text>
                <br />
                <Text type="secondary">将文件恢复到某个历史备份点</Text>
              </div>

              <div>
                <Text strong>📋 创建副本</Text>
                <br />
                <Text type="secondary">创建独立的工作副本，互不影响</Text>
              </div>

              <div>
                <Text strong>🔀 合并副本</Text>
                <br />
                <Text type="secondary">将副本的修改合并到主版本</Text>
              </div>
            </Space>
          </div>

          <Divider />

          {/* 联系方式 */}
          <Alert
            message="需要帮助？"
            description={
              <Space direction="vertical">
                <Text>联系开发者：</Text>
                <Text strong copyable>sunshunda@gmail.com</Text>
              </Space>
            }
            type="info"
            showIcon
          />
        </Space>
      </Drawer>
    </Layout>
  )
}

export default App
