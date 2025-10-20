import { useState, useCallback } from 'react'
import { apiClient } from '../api'
import type { StatusData } from '../types/api'

interface UseRepositoryState {
  status: StatusData | null
  loading: boolean
  error: string | null
}

interface UseRepositoryReturn extends UseRepositoryState {
  refreshStatus: (repoPath: string) => Promise<void>
  initRepository: (path: string) => Promise<boolean>
}

/**
 * useRepository Hook
 * 管理仓库状态数据，提供初始化和刷新功能
 */
export function useRepository(): UseRepositoryReturn {
  const [state, setState] = useState<UseRepositoryState>({
    status: null,
    loading: false,
    error: null,
  })

  /**
   * 刷新仓库状态
   */
  const refreshStatus = useCallback(async (repoPath: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiClient.getStatus(repoPath)

      if (result.success && result.data) {
        setState({
          status: result.data,
          loading: false,
          error: null,
        })
      } else {
        setState({
          status: null,
          loading: false,
          error: result.error || '获取状态失败',
        })
      }
    } catch (error) {
      setState({
        status: null,
        loading: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }, [])

  /**
   * 初始化仓库
   */
  const initRepository = useCallback(async (path: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiClient.initRepository(path)

      if (result.success) {
        setState((prev) => ({ ...prev, loading: false, error: null }))
        return true
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || '初始化失败',
        }))
        return false
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '未知错误',
      }))
      return false
    }
  }, [])

  return {
    ...state,
    refreshStatus,
    initRepository,
  }
}
