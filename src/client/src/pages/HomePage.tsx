/**
 * Chronos v2.0 - Home Page
 * 
 * 首页：选择或打开仓库
 */

import React, { useState, useEffect } from 'react'
import { Button, Card, Typography, Space, Input, message as antMessage, List, Modal, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { FolderOpenOutlined, PlusOutlined, ClockCircleOutlined, MoreOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { useRepository } from '../hooks/useRepository'
import { apiService } from '../services/api-service'
import type { Repository } from '@/shared/types'

const { Title, Paragraph, Text } = Typography

export const HomePage: React.FC = () => {
  const { initRepository, openRepository, loading } = useRepository()
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [isElectron, setIsElectron] = useState(false)
  const [recentRepos, setRecentRepos] = useState<Repository[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  useEffect(() => {
    // 检查是否在 Electron 环境中
    setIsElectron(typeof window !== 'undefined' && !!(window as any).electronAPI)
    
    // 加载最近使用的仓库
    loadRecentRepositories()
  }, [])

  /**
   * 加载最近使用的仓库
   */
  const loadRecentRepositories = async () => {
    setLoadingRecent(true)
    try {
      const repos = await apiService.getRecentRepositories(10)
      setRecentRepos(repos)
    } catch (error) {
      console.error('Failed to load recent repositories:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  /**
   * 处理路径输入
   */
  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPath(e.target.value)
  }

  /**
   * 使用 Electron 选择文件夹
   */
  const handleSelectFolder = async () => {
    if (!isElectron) {
      return
    }

    try {
      const path = await (window as any).electronAPI.selectDirectory()
      if (path) {
        setSelectedPath(path)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
      antMessage.error('选择文件夹失败')
    }
  }

  /**
   * 初始化新仓库
   */
  const handleInit = async () => {
    if (!selectedPath.trim()) {
      antMessage.warning('请输入文件夹路径')
      return
    }
    await initRepository(selectedPath.trim())
    // 刷新最近使用列表
    await loadRecentRepositories()
  }

  /**
   * 打开已有仓库
   */
  const handleOpen = async () => {
    if (!selectedPath.trim()) {
      antMessage.warning('请输入文件夹路径')
      return
    }
    await openRepository(selectedPath.trim())
    // 刷新最近使用列表
    await loadRecentRepositories()
  }

  /**
   * 打开最近使用的仓库
   */
  const handleOpenRecentRepo = async (repo: Repository) => {
    await openRepository(repo.path)
    // 刷新最近使用列表
    await loadRecentRepositories()
  }

  /**
   * 软删除：从列表移除（保留 .git）
   */
  const handleRemoveRecentRepo = async (repo: Repository, e: React.MouseEvent) => {
    e.stopPropagation()

    Modal.confirm({
      title: '从列表移除',
      content: (
        <div>
          <p>确定要从最近使用列表中移除 "{repo.name}" 吗？</p>
          <p style={{ color: '#666', fontSize: 12 }}>
            注意：这只会从列表中移除记录，不会删除文件夹中的 .git 历史数据。
            你可以随时重新添加这个文件夹。
          </p>
        </div>
      ),
      okText: '移除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiService.deleteRepository(repo.id)
          antMessage.success('已从列表移除')
          await loadRecentRepositories()
        } catch (error) {
          console.error('Failed to delete repository:', error)
          antMessage.error('移除失败')
        }
      },
    })
  }

  /**
   * 硬删除：完全移除时光机管理（删除 .git）
   */
  const handleDestroyRepo = async (repo: Repository, e: React.MouseEvent) => {
    e.stopPropagation()

    Modal.confirm({
      title: '完全移除时光机管理',
      content: (
        <div>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ 警告：此操作不可恢复！
          </p>
          <p>确定要完全移除 "{repo.name}" 的时光机管理吗？</p>
          <p style={{ color: '#666', fontSize: 12 }}>
            此操作将：
          </p>
          <ul style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
            <li>删除 .git 文件夹（所有历史记录将永久丢失）</li>
            <li>从列表中移除记录</li>
            <li>文件夹将恢复为普通文件夹，无法再回滚</li>
          </ul>
        </div>
      ),
      okText: '确认移除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiService.destroyRepository(repo.id)
          antMessage.success('已完全移除时光机管理')
          await loadRecentRepositories()
        } catch (error) {
          console.error('Failed to destroy repository:', error)
          antMessage.error('移除失败')
        }
      },
    })
  }



  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* 版权信息 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: '#999',
          fontSize: 12,
        }}
      >
        Copyright © sunshunda
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 600,
          textAlign: 'center',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Chronos - 文件时光机</Title>
            <Paragraph type="secondary">
              告别混乱的文件命名，轻松管理文件版本
            </Paragraph>
          </div>

          <div style={{ width: '100%' }}>
            <Paragraph>
              <strong>请输入文件夹的完整路径：</strong>
            </Paragraph>
            <Input
              size="large"
              placeholder="例如：/Users/username/Documents/my-project"
              value={selectedPath}
              onChange={handlePathChange}
              prefix={<FolderOpenOutlined />}
              onPressEnter={handleInit}
            />
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              💡 提示：
              <br />
              • macOS: /Users/你的用户名/Documents/项目文件夹
              <br />
              • Windows: C:\Users\你的用户名\Documents\项目文件夹
              <br />
              • 按 Enter 键快速初始化
            </Paragraph>
          </div>

          <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
            {isElectron && (
              <Button
                size="large"
                icon={<FolderOpenOutlined />}
                onClick={handleSelectFolder}
              >
                浏览文件夹
              </Button>
            )}

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleInit}
              loading={loading}
              disabled={!selectedPath}
            >
              初始化时光机
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<FolderOpenOutlined />}
              onClick={handleOpen}
              loading={loading}
              disabled={!selectedPath}
            >
              打开时光机
            </Button>
          </Space>

          {/* 最近使用的时光机文件夹 */}
          {recentRepos.length > 0 && (
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <Card size="small" type="inner">
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>最近使用的时光机文件夹</Text>
                  </Space>
                </div>
                <List
                  size="small"
                  bordered
                  loading={loadingRecent}
                  dataSource={recentRepos}
                  renderItem={(repo) => {
                    const menuItems: MenuProps['items'] = [
                      {
                        key: 'remove',
                        label: '从列表移除',
                        icon: <CloseCircleOutlined />,
                        onClick: (e) => {
                          e.domEvent.stopPropagation()
                          handleRemoveRecentRepo(repo, e.domEvent as any)
                        },
                      },
                      {
                        type: 'divider',
                      },
                      {
                        key: 'destroy',
                        label: '完全移除时光机管理',
                        icon: <WarningOutlined />,
                        danger: true,
                        onClick: (e) => {
                          e.domEvent.stopPropagation()
                          handleDestroyRepo(repo, e.domEvent as any)
                        },
                      },
                    ]

                    return (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onClick={() => handleOpenRecentRepo(repo)}
                        actions={[
                          <Dropdown
                            key="actions"
                            menu={{ items: menuItems }}
                            trigger={['click']}
                          >
                            <Button
                              type="text"
                              size="small"
                              icon={<MoreOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Dropdown>,
                        ]}
                      >
                        <Text ellipsis style={{ maxWidth: '400px' }}>
                          {repo.path}
                        </Text>
                      </List.Item>
                    )
                  }}
                />
              </Card>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'left' }}>
            <Card size="small" type="inner">
              <Space direction="vertical" size="small">
                <Paragraph strong style={{ marginBottom: 8 }}>
                  {isElectron ? '🖥️ 桌面应用模式' : '📌 关于本地 Web 模式'}
                </Paragraph>
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                  {isElectron ? (
                    <>
                      • 点击&ldquo;浏览文件夹&rdquo;按钮选择文件夹
                      <br />
                      • 或手动输入完整路径
                      <br />
                      • 初始化会在文件夹中创建 .git 目录来管理版本
                    </>
                  ) : (
                    <>
                      • 本地 Web 模式需要手动输入路径（浏览器安全限制）
                      <br />
                      • 如需更好的体验，请使用 Electron 桌面应用
                      <br />
                      • 初始化会在文件夹中创建 .git 目录来管理版本
                    </>
                  )}
                </Paragraph>
              </Space>
            </Card>
          </div>
        </Space>
      </Card>
    </div>
  )
}
