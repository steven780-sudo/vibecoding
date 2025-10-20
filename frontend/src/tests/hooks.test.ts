import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRepository } from '../hooks/useRepository'
import { useHistory } from '../hooks/useHistory'
import { useBranches } from '../hooks/useBranches'
import { apiClient } from '../api'

// Mock API client
vi.mock('../api', () => ({
  apiClient: {
    getStatus: vi.fn(),
    initRepository: vi.fn(),
    getLog: vi.fn(),
    checkoutCommit: vi.fn(),
    getBranches: vi.fn(),
    createBranch: vi.fn(),
    switchBranch: vi.fn(),
    mergeBranch: vi.fn(),
  },
}))

describe('useRepository Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始状态应该正确', () => {
    const { result } = renderHook(() => useRepository())

    expect(result.current.status).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('refreshStatus应该成功获取状态', async () => {
    const mockStatus = {
      branch: 'main',
      changes: [{ status: 'M', file: 'test.txt' }],
    }

    vi.mocked(apiClient.getStatus).mockResolvedValueOnce({
      success: true,
      data: mockStatus,
    })

    const { result } = renderHook(() => useRepository())

    await act(async () => {
      await result.current.refreshStatus('/test/repo')
    })

    expect(result.current.status).toEqual(mockStatus)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('refreshStatus应该处理错误', async () => {
    vi.mocked(apiClient.getStatus).mockResolvedValueOnce({
      success: false,
      error: '仓库不存在',
    })

    const { result } = renderHook(() => useRepository())

    await act(async () => {
      await result.current.refreshStatus('/test/repo')
    })

    expect(result.current.status).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('仓库不存在')
  })

  it('initRepository应该成功初始化', async () => {
    vi.mocked(apiClient.initRepository).mockResolvedValueOnce({
      success: true,
      data: { message: '初始化成功' },
    })

    const { result } = renderHook(() => useRepository())

    let success = false
    await act(async () => {
      success = await result.current.initRepository('/test/repo')
    })

    expect(success).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('initRepository应该处理失败', async () => {
    vi.mocked(apiClient.initRepository).mockResolvedValueOnce({
      success: false,
      error: '路径无效',
    })

    const { result } = renderHook(() => useRepository())

    let success = true
    await act(async () => {
      success = await result.current.initRepository('/invalid/path')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe('路径无效')
  })
})

describe('useHistory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始状态应该正确', () => {
    const { result } = renderHook(() => useHistory())

    expect(result.current.commits).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('refreshHistory应该成功获取历史', async () => {
    const mockCommits = [
      {
        id: 'abc123',
        message: '初始提交',
        author: 'test',
        date: '2024-01-01',
      },
    ]

    vi.mocked(apiClient.getLog).mockResolvedValueOnce({
      success: true,
      data: { logs: mockCommits },
    })

    const { result } = renderHook(() => useHistory())

    await act(async () => {
      await result.current.refreshHistory('/test/repo')
    })

    expect(result.current.commits).toEqual(mockCommits)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('refreshHistory应该处理错误', async () => {
    vi.mocked(apiClient.getLog).mockResolvedValueOnce({
      success: false,
      error: '获取历史失败',
    })

    const { result } = renderHook(() => useHistory())

    await act(async () => {
      await result.current.refreshHistory('/test/repo')
    })

    expect(result.current.commits).toEqual([])
    expect(result.current.error).toBe('获取历史失败')
  })

  it('checkoutCommit应该成功回滚', async () => {
    vi.mocked(apiClient.checkoutCommit).mockResolvedValueOnce({
      success: true,
      data: { message: '回滚成功' },
    })

    const { result } = renderHook(() => useHistory())

    let success = false
    await act(async () => {
      success = await result.current.checkoutCommit('/test/repo', 'abc123')
    })

    expect(success).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('checkoutCommit应该处理失败', async () => {
    vi.mocked(apiClient.checkoutCommit).mockResolvedValueOnce({
      success: false,
      error: '提交ID无效',
    })

    const { result } = renderHook(() => useHistory())

    let success = true
    await act(async () => {
      success = await result.current.checkoutCommit('/test/repo', 'invalid')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe('提交ID无效')
  })
})

describe('useBranches Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始状态应该正确', () => {
    const { result } = renderHook(() => useBranches())

    expect(result.current.branches).toEqual([])
    expect(result.current.currentBranch).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('refreshBranches应该成功获取分支列表', async () => {
    const mockBranches = {
      branches: ['main', 'feature-1'],
      current: 'main',
    }

    vi.mocked(apiClient.getBranches).mockResolvedValueOnce({
      success: true,
      data: mockBranches,
    })

    const { result } = renderHook(() => useBranches())

    await act(async () => {
      await result.current.refreshBranches('/test/repo')
    })

    expect(result.current.branches).toEqual(['main', 'feature-1'])
    expect(result.current.currentBranch).toBe('main')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('createBranch应该成功创建分支', async () => {
    vi.mocked(apiClient.createBranch).mockResolvedValueOnce({
      success: true,
      data: { message: '分支创建成功' },
    })

    const { result } = renderHook(() => useBranches())

    let success = false
    await act(async () => {
      success = await result.current.createBranch('/test/repo', 'feature-1')
    })

    expect(success).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('switchBranch应该成功切换分支', async () => {
    vi.mocked(apiClient.switchBranch).mockResolvedValueOnce({
      success: true,
      data: { message: '切换成功' },
    })

    const { result } = renderHook(() => useBranches())

    let success = false
    await act(async () => {
      success = await result.current.switchBranch('/test/repo', 'feature-1')
    })

    expect(success).toBe(true)
    expect(result.current.currentBranch).toBe('feature-1')
    expect(result.current.loading).toBe(false)
  })

  it('mergeBranch应该成功合并分支', async () => {
    vi.mocked(apiClient.mergeBranch).mockResolvedValueOnce({
      success: true,
      data: {
        message: '合并成功',
        conflicts: [],
      },
    })

    const { result } = renderHook(() => useBranches())

    let mergeResult = { success: false }
    await act(async () => {
      mergeResult = await result.current.mergeBranch(
        '/test/repo',
        'feature-1',
        'main'
      )
    })

    expect(mergeResult.success).toBe(true)
    expect(mergeResult.conflicts).toEqual([])
  })

  it('mergeBranch应该处理冲突', async () => {
    vi.mocked(apiClient.mergeBranch).mockResolvedValueOnce({
      success: true,
      data: {
        message: '合并冲突',
        conflicts: ['file1.txt', 'file2.txt'],
      },
    })

    const { result } = renderHook(() => useBranches())

    let mergeResult = { success: false }
    await act(async () => {
      mergeResult = await result.current.mergeBranch(
        '/test/repo',
        'feature-1',
        'main'
      )
    })

    expect(mergeResult.success).toBe(true)
    expect(mergeResult.conflicts).toEqual(['file1.txt', 'file2.txt'])
  })

  it('应该处理API错误', async () => {
    vi.mocked(apiClient.getBranches).mockResolvedValueOnce({
      success: false,
      error: '获取分支失败',
    })

    const { result } = renderHook(() => useBranches())

    await act(async () => {
      await result.current.refreshBranches('/test/repo')
    })

    expect(result.current.branches).toEqual([])
    expect(result.current.error).toBe('获取分支失败')
  })
})
