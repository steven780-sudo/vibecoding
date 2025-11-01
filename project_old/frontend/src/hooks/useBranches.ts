import { useState, useCallback } from 'react'
import { apiClient } from '../api'

interface UseBranchesState {
  branches: string[]
  currentBranch: string | null
  loading: boolean
  error: string | null
}

interface UseBranchesReturn extends UseBranchesState {
  refreshBranches: (repoPath: string) => Promise<void>
  createBranch: (repoPath: string, name: string) => Promise<boolean>
  switchBranch: (repoPath: string, branch: string) => Promise<boolean>
  mergeBranch: (
    repoPath: string,
    sourceBranch: string,
    targetBranch: string
  ) => Promise<{ success: boolean; conflicts?: string[] }>
}

/**
 * useBranches Hook
 * 管理分支列表数据，提供分支操作功能
 */
export function useBranches(): UseBranchesReturn {
  const [state, setState] = useState<UseBranchesState>({
    branches: [],
    currentBranch: null,
    loading: false,
    error: null,
  })

  /**
   * 刷新分支列表
   */
  const refreshBranches = useCallback(async (repoPath: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiClient.getBranches(repoPath)

      if (result.success && result.data) {
        // Backend返回的branches是对象数组 [{name: "main", is_current: true}]
        // 需要转换为字符串数组 ["main", "feature-test"]
        const branchNames = Array.isArray(result.data.branches)
          ? result.data.branches.map((b: any) => 
              typeof b === 'string' ? b : b.name
            )
          : []
        
        setState({
          branches: branchNames,
          currentBranch: result.data.current || null,
          loading: false,
          error: null,
        })
      } else {
        setState({
          branches: [],
          currentBranch: null,
          loading: false,
          error: result.error || '获取分支列表失败',
        })
      }
    } catch (error) {
      setState({
        branches: [],
        currentBranch: null,
        loading: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }, [])

  /**
   * 创建新分支
   */
  const createBranch = useCallback(
    async (repoPath: string, name: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiClient.createBranch(repoPath, name)

        if (result.success) {
          setState((prev) => ({ ...prev, loading: false, error: null }))
          return true
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error || '创建分支失败',
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

  /**
   * 切换分支
   */
  const switchBranch = useCallback(
    async (repoPath: string, branch: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiClient.switchBranch(repoPath, branch)

        if (result.success) {
          setState((prev) => ({
            ...prev,
            currentBranch: branch,
            loading: false,
            error: null,
          }))
          return true
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error || '切换分支失败',
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

  /**
   * 合并分支
   */
  const mergeBranch = useCallback(
    async (
      repoPath: string,
      sourceBranch: string,
      targetBranch: string
    ): Promise<{ success: boolean; conflicts?: string[] }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiClient.mergeBranch(
          repoPath,
          sourceBranch,
          targetBranch
        )

        if (result.success) {
          setState((prev) => ({ ...prev, loading: false, error: null }))
          return {
            success: true,
            conflicts: result.data?.conflicts || [],
          }
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error || '合并分支失败',
          }))
          return { success: false }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '未知错误',
        }))
        return { success: false }
      }
    },
    []
  )

  return {
    ...state,
    refreshBranches,
    createBranch,
    switchBranch,
    mergeBranch,
  }
}
