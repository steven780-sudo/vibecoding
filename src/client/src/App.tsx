/**
 * Chronos v2.0 - Main App Component
 */

import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { HomePage } from './pages/HomePage'
import { RepositoryPage } from './pages/RepositoryPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useRepositoryStore } from './stores/repository-store'

const App: React.FC = () => {
  const { currentRepository } = useRepositoryStore()

  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary>
        {currentRepository ? <RepositoryPage /> : <HomePage />}
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
