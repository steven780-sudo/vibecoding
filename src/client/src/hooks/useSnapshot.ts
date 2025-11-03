/**
 * Chronos v2.0 - useSnapshot Hook
 * 
 * 快照操作的自定义 Hook
 */

import { useState, useCallback } from 'react'
import { message } from 'antd'
import { apiService } from '../services/api-service'
import type { Snapshot } from '../../../shared/types'

interface UseSnapshotReturn {
  history: Snapshot[]
  loading: boolean
  error: string | null
  loadHistory: (path: string) => Promise<void>
  createSnapshot: (path: string, files: string[], commitMessage: string) => Promise<void>
  checkoutSnapshot: (path: string, commitHash: string) => Promise<void>
  refreshHistory: () => Promise<void>
}

/**
 * 快照操作 Hook
 */
export const useSnapshot = (): UseSnapshotReturn => {
  const [history, setHistory] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>('')

  /**
   * 加载历史记录
   */
  const loadHistory = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)
    setCurrentPath(path)

    try {
      const log = await apiService.getLog(path)
      setHistory(log)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载历史记录失败'
      setError(errorMessage)
      message.error(errorMessage)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 创建快照
   */
  const createSnapshot = useCallback(async (
    path: string,
    files: string[],
    commitMessage: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      await apiService.createSnapshot(path, commitMessage, files)
      message.success('快照创建成功')
      
      // 刷新历史记录
      await loadHistory(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建快照失败'
      setError(errorMessage)
      message.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadHistory])

  /**
   * 回滚到指定快照
   */
  const checkoutSnapshot = useCallback(async (path: string, commitHash: string) => {
    setLoading(true)
    setError(null)

    try {
      await apiService.checkout(path, commitHash)
      message.success('已回滚到指定快照')
      
      // 刷新历史记录
      await loadHistory(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '回滚失败'
      setError(errorMessage)
      message.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadHistory])

  /**
   * 刷新历史记录
   */
  const refreshHistory = useCallback(async () => {
    if (currentPath) {
      await loadHistory(currentPath)
    }
  }, [currentPath, loadHistory])

  return {
    history,
    loading,
    error,
    loadHistory,
    createSnapshot,
    checkoutSnapshot,
    refreshHistory
  }
}
