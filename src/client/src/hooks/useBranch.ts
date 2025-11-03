/**
 * Chronos v2.0 - useBranch Hook
 * 
 * 分支操作的自定义 Hook
 */

import { useState, useCallback } from 'react'
import { message } from 'antd'
import { apiService } from '../services/api-service'
import type { Branch } from '../../../shared/types'

interface UseBranchReturn {
  branches: Branch[]
  currentBranch: string
  loading: boolean
  error: string | null
  loadBranches: (path: string) => Promise<void>
  createBranch: (path: string, branchName: string) => Promise<void>
  switchBranch: (path: string, branchName: string) => Promise<void>
  mergeBranch: (path: string, sourceBranch: string) => Promise<void>
  refreshBranches: () => Promise<void>
}

/**
 * 分支操作 Hook
 */
export const useBranch = (): UseBranchReturn => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<string>('main')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>('')

  /**
   * 加载分支列表
   */
  const loadBranches = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)
    setCurrentPath(path)

    try {
      const branchList = await apiService.getBranches(path)
      setBranches(branchList)
      
      // 找到当前分支
      const current = branchList.find(b => b.isCurrent)
      if (current) {
        setCurrentBranch(current.name)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载分支列表失败'
      setError(errorMessage)
      message.error(errorMessage)
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 创建新分支
   */
  const createBranch = useCallback(async (path: string, branchName: string) => {
    setLoading(true)
    setError(null)

    try {
      await apiService.createBranch(path, branchName)
      message.success(`分支 "${branchName}" 创建成功`)
      
      // 刷新分支列表
      await loadBranches(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建分支失败'
      setError(errorMessage)
      message.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBranches])

  /**
   * 切换分支
   */
  const switchBranch = useCallback(async (path: string, branchName: string) => {
    setLoading(true)
    setError(null)

    try {
      await apiService.switchBranch(path, branchName)
      message.success(`已切换到分支 "${branchName}"`)
      setCurrentBranch(branchName)
      
      // 刷新分支列表
      await loadBranches(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '切换分支失败'
      setError(errorMessage)
      message.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBranches])

  /**
   * 合并分支
   */
  const mergeBranch = useCallback(async (path: string, sourceBranch: string) => {
    setLoading(true)
    setError(null)

    try {
      await apiService.mergeBranch(path, sourceBranch)
      message.success(`分支 "${sourceBranch}" 合并成功`)
      
      // 刷新分支列表
      await loadBranches(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '合并分支失败'
      setError(errorMessage)
      message.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBranches])

  /**
   * 刷新分支列表
   */
  const refreshBranches = useCallback(async () => {
    if (currentPath) {
      await loadBranches(currentPath)
    }
  }, [currentPath, loadBranches])

  return {
    branches,
    currentBranch,
    loading,
    error,
    loadBranches,
    createBranch,
    switchBranch,
    mergeBranch,
    refreshBranches
  }
}
