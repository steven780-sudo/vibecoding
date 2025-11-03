/**
 * Chronos v2.0 - useRepository Hook
 * 
 * 仓库操作的自定义 Hook
 */

import { useCallback } from 'react'
import { message } from 'antd'
import { useRepositoryStore } from '../stores/repository-store'
import { apiService } from '../services/api-service'

export function useRepository() {
  const {
    currentRepository,
    status,
    files,
    selectedFiles,
    snapshots,
    branches,
    loading,
    error,
    setCurrentRepository,
    setStatus,
    setFiles,
    setSelectedFiles,
    setSnapshots,
    setBranches,
    setLoading,
    setError,
    reset,
  } = useRepositoryStore()

  /**
   * 初始化仓库
   */
  const initRepository = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)

    try {
      const repo = await apiService.initRepository(path)
      setCurrentRepository(repo)
      message.success('仓库初始化成功')

      // 加载仓库数据
      await loadRepositoryData(path)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '初始化失败'
      setError(errorMsg)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 打开仓库
   */
  const openRepository = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)

    try {
      const repo = await apiService.openRepository(path)
      setCurrentRepository(repo)
      message.success('仓库打开成功')

      // 加载仓库数据
      await loadRepositoryData(path)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '打开失败'
      setError(errorMsg)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 加载仓库数据
   */
  const loadRepositoryData = useCallback(async (path: string) => {
    try {
      console.log('[useRepository] Loading repository data for:', path)
      
      const [repoStatus, repoFiles, repoSnapshots, repoBranches] =
        await Promise.all([
          apiService.getStatus(path),
          apiService.getFiles(path),
          apiService.getLog(path, 50),
          apiService.getBranches(path),
        ])

      console.log('[useRepository] Data loaded:', {
        status: repoStatus,
        filesCount: repoFiles.length,
        snapshotsCount: repoSnapshots.length,
        branchesCount: repoBranches.length,
      })

      // 验证快照数据格式
      if (repoSnapshots && repoSnapshots.length > 0) {
        console.log('[useRepository] First snapshot:', repoSnapshots[0])
        console.log('[useRepository] Timestamp type:', typeof repoSnapshots[0]?.timestamp)
      }

      setStatus(repoStatus)
      setFiles(repoFiles)
      setSnapshots(repoSnapshots)
      setBranches(repoBranches)
      
      console.log('[useRepository] State updated successfully')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载数据失败'
      console.error('[useRepository] Load data error:', err)
      setError(errorMsg)
      message.error(errorMsg)
    }
  }, [])

  /**
   * 刷新仓库状态
   */
  const refreshStatus = useCallback(async () => {
    if (!currentRepository) return

    try {
      const repoStatus = await apiService.getStatus(currentRepository.path)
      setStatus(repoStatus)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '刷新失败'
      message.error(errorMsg)
    }
  }, [currentRepository])

  /**
   * 创建快照
   */
  const createSnapshot = useCallback(
    async (snapshotMessage: string) => {
      if (!currentRepository) return

      setLoading(true)

      try {
        const files =
          selectedFiles.size > 0 ? Array.from(selectedFiles) : undefined

        await apiService.createSnapshot(
          currentRepository.path,
          snapshotMessage,
          files
        )

        message.success('快照创建成功')

        // 刷新数据
        await loadRepositoryData(currentRepository.path)
        setSelectedFiles(new Set())
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '创建快照失败'
        message.error(errorMsg)
        console.error('Create snapshot error:', err)
      } finally {
        setLoading(false)
      }
    },
    [currentRepository, selectedFiles, loadRepositoryData]
  )

  /**
   * 回滚到指定快照
   */
  const checkoutSnapshot = useCallback(
    async (commitId: string) => {
      if (!currentRepository) return

      setLoading(true)

      try {
        await apiService.checkout(currentRepository.path, commitId)
        message.success('回滚成功')

        // 刷新数据
        await loadRepositoryData(currentRepository.path)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '回滚失败'
        message.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [currentRepository]
  )

  /**
   * 创建分支
   */
  const createBranch = useCallback(
    async (branchName: string) => {
      if (!currentRepository) return

      setLoading(true)

      try {
        await apiService.createBranch(currentRepository.path, branchName)
        message.success('分支创建成功')

        // 刷新分支列表
        const repoBranches = await apiService.getBranches(currentRepository.path)
        setBranches(repoBranches)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '创建分支失败'
        message.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [currentRepository]
  )

  /**
   * 切换分支
   */
  const switchBranch = useCallback(
    async (branchName: string) => {
      if (!currentRepository) return

      setLoading(true)

      try {
        await apiService.switchBranch(currentRepository.path, branchName)
        message.success('分支切换成功')

        // 刷新数据
        await loadRepositoryData(currentRepository.path)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '切换分支失败'
        message.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [currentRepository]
  )

  /**
   * 合并分支
   */
  const mergeBranch = useCallback(
    async (sourceBranch: string, targetBranch?: string) => {
      if (!currentRepository) return

      setLoading(true)

      try {
        const result = await apiService.mergeBranch(
          currentRepository.path,
          sourceBranch,
          targetBranch
        )

        if (result.hasConflicts) {
          message.warning('合并存在冲突，请手动解决')
        } else {
          message.success('分支合并成功')
        }

        // 刷新数据
        await loadRepositoryData(currentRepository.path)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '合并分支失败'
        message.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [currentRepository]
  )

  /**
   * 关闭仓库
   */
  const closeRepository = useCallback(() => {
    reset()
    message.info('已关闭仓库')
  }, [])

  return {
    // 状态
    currentRepository,
    status,
    files,
    selectedFiles,
    snapshots,
    branches,
    loading,
    error,

    // 操作
    initRepository,
    openRepository,
    refreshStatus,
    createSnapshot,
    checkoutSnapshot,
    createBranch,
    switchBranch,
    mergeBranch,
    closeRepository,
    loadRepositoryData,
  }
}
