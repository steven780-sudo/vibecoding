import { useEffect, useState } from 'react'
import { Card, Typography, Spin, Alert } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface BackendStatus {
  success: boolean
  data?: {
    message: string
    version: string
  }
}

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/')
        const data = await response.json()
        setBackendStatus(data)
        setError(null)
      } catch (err) {
        setError('无法连接到后端服务。请确保后端服务正在运行。')
      } finally {
        setLoading(false)
      }
    }

    checkBackend()
  }, [])

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Chronos - 文件时光机</Title>
        <Paragraph>欢迎使用 Chronos MVP 开发环境</Paragraph>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: '16px' }}>
              正在连接后端服务...
            </Paragraph>
          </div>
        )}

        {!loading && error && (
          <Alert message="连接失败" description={error} type="error" showIcon />
        )}

        {!loading && backendStatus?.success && (
          <Alert
            message="系统状态正常"
            description={
              <div>
                <p>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />{' '}
                  {backendStatus.data?.message}
                </p>
                <p>版本: {backendStatus.data?.version}</p>
              </div>
            }
            type="success"
            showIcon
          />
        )}
      </Card>
    </div>
  )
}

export default App
