import { useState, useCallback } from 'react'
import { apiClient } from '../api'
import type { CommitLog } from '../types/api'

interface UseHistoryState {
  commits: CommitLog[]
  loading: boolean
  error: string | null
}

interface UseHistoryReturn extends UseHistoryState {
  refreshHistory: (repoPath: string) => Promise<void>
  checkoutCommit: (repoPath: string, commitId: string) => Promise<boolean>
}

/**
 * useHistory Hook
 * 管理提交历史数据，提供刷新和回滚功能
 */
export function useHistory(): UseHistoryReturn {
  const [state, setState] = useState<UseHistoryState>({
    commits: [],
    loading: false,
    error: null,
  })

  /**
   * 刷新提交历史
   */
  const refreshHistory = useCallback(async (repoPath: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiClient.getLog(repoPath)

      if (result.success && result.data) {
        setState({
          commits: result.data.logs || [],
          loading: false,
          error: null,
        })
      } else {
        setState({
          commits: [],
          loading: false,
          error: result.error || '获取历史失败',
        })
      }
    } catch (error) {
      setState({
        commits: [],
        loading: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }, [])

  /**
   * 回滚到指定提交
   */
  const checkoutCommit = useCallback(
    async (repoPath: string, commitId: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiClient.checkoutCommit(repoPath, commitId)

        if (result.success) {
          setState((prev) => ({ ...prev, loading: false, error: null }))
          return true
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error || '回滚失败',
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
    },
    []
  )

  return {
    ...state,
    refreshHistory,
    checkoutCommit,
  }
}
