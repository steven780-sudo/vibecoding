import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ChronosApiClient from '../api/client'

describe('ChronosApiClient', () => {
  let client: ChronosApiClient
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new ChronosApiClient('http://127.0.0.1:8765', 1) // 设置maxRetries为1以加快测试
    fetchMock = vi.fn()
    globalThis.fetch = fetchMock as typeof fetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initRepository', () => {
    it('应该成功初始化仓库', async () => {
      const mockResponse = {
        success: true,
        data: { message: '仓库初始化成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.initRepository('/test/path')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/init',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ path: '/test/path' }),
        })
      )

      expect(result.success).toBe(true)
      expect(result.data?.message).toBe('仓库初始化成功')
    })
  })

  describe('getStatus', () => {
    it('应该成功获取仓库状态', async () => {
      const mockResponse = {
        success: true,
        data: {
          branch: 'main',
          changes: [
            { status: 'M', file: 'test.txt' },
            { status: 'A', file: 'new.txt' },
          ],
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.getStatus('/test/repo')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/status?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          method: 'GET',
        })
      )

      expect(result.success).toBe(true)
      expect(result.data?.branch).toBe('main')
      expect(result.data?.changes).toHaveLength(2)
    })
  })

  describe('createCommit', () => {
    it('应该成功创建提交', async () => {
      const mockResponse = {
        success: true,
        data: { message: '提交成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.createCommit('/test/repo', '测试提交', [
        'file1.txt',
        'file2.txt',
      ])

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/commit?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            message: '测试提交',
            files_to_add: ['file1.txt', 'file2.txt'],
          }),
        })
      )

      expect(result.success).toBe(true)
    })
  })

  describe('getLog', () => {
    it('应该成功获取提交历史', async () => {
      const mockResponse = {
        success: true,
        data: {
          logs: [
            {
              id: 'abc123',
              message: '初始提交',
              author: 'test',
              date: '2024-01-01',
            },
          ],
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.getLog('/test/repo')

      expect(result.success).toBe(true)
      expect(result.data?.logs).toHaveLength(1)
      expect(result.data?.logs[0].id).toBe('abc123')
    })
  })

  describe('checkoutCommit', () => {
    it('应该成功回滚到指定提交', async () => {
      const mockResponse = {
        success: true,
        data: { message: '回滚成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.checkoutCommit('/test/repo', 'abc123')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/checkout?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ commit_id: 'abc123' }),
        })
      )

      expect(result.success).toBe(true)
    })
  })

  describe('getBranches', () => {
    it('应该成功获取分支列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          branches: ['main', 'feature-1'],
          current: 'main',
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.getBranches('/test/repo')

      expect(result.success).toBe(true)
      expect(result.data?.branches).toHaveLength(2)
      expect(result.data?.current).toBe('main')
    })
  })

  describe('createBranch', () => {
    it('应该成功创建新分支', async () => {
      const mockResponse = {
        success: true,
        data: { message: '分支创建成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.createBranch('/test/repo', 'feature-1')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/branch?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'feature-1' }),
        })
      )

      expect(result.success).toBe(true)
    })
  })

  describe('switchBranch', () => {
    it('应该成功切换分支', async () => {
      const mockResponse = {
        success: true,
        data: { message: '切换成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.switchBranch('/test/repo', 'feature-1')

      expect(result.success).toBe(true)
    })
  })

  describe('mergeBranch', () => {
    it('应该成功合并分支', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: '合并成功',
          conflicts: [],
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.mergeBranch('/test/repo', 'feature-1', 'main')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/merge?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            source_branch: 'feature-1',
            target_branch: 'main',
          }),
        })
      )

      expect(result.success).toBe(true)
      expect(result.data?.conflicts).toHaveLength(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理HTTP错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: '服务器错误' }),
      })

      const result = await client.getStatus('/test/repo')

      expect(result.success).toBe(false)
      expect(result.error).toContain('服务器错误')
    })

    it('应该处理网络错误并重试', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('网络错误'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { branch: 'main', changes: [] },
          }),
        })

      const result = await client.getStatus('/test/repo')

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    it('应该在重试失败后返回错误', async () => {
      fetchMock.mockRejectedValue(new TypeError('网络错误'))

      const result = await client.getStatus('/test/repo')

      expect(fetchMock).toHaveBeenCalledTimes(2) // 初始调用 + 1次重试
      expect(result.success).toBe(false)
      expect(result.error).toContain('网络错误')
    })

    it('应该处理404错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: '仓库不存在' }),
      })

      const result = await client.getStatus('/nonexistent/repo')

      expect(result.success).toBe(false)
      expect(result.error).toContain('仓库不存在')
    })

    it('应该处理JSON解析错误', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('JSON解析失败')
        },
      })

      const result = await client.getStatus('/test/repo')

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON解析失败')
    })

    it('应该处理未知错误', async () => {
      fetchMock.mockRejectedValueOnce('未知错误类型')

      const result = await client.getStatus('/test/repo')

      expect(result.success).toBe(false)
      expect(result.error).toBe('未知错误')
    })
  })

  describe('边界情况', () => {
    it('应该处理空文件列表的提交', async () => {
      const mockResponse = {
        success: true,
        data: { message: '提交成功' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.createCommit('/test/repo', '空提交')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/commit?repo_path=%2Ftest%2Frepo',
        expect.objectContaining({
          body: JSON.stringify({
            message: '空提交',
            files_to_add: [],
          }),
        })
      )

      expect(result.success).toBe(true)
    })

    it('应该处理空历史记录', async () => {
      const mockResponse = {
        success: true,
        data: { logs: [] },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.getLog('/test/repo')

      expect(result.success).toBe(true)
      expect(result.data?.logs).toHaveLength(0)
    })

    it('应该处理合并冲突', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: '合并完成但有冲突',
          conflicts: ['file1.txt', 'file2.txt'],
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.mergeBranch('/test/repo', 'feature', 'main')

      expect(result.success).toBe(true)
      expect(result.data?.conflicts).toHaveLength(2)
    })

    it('应该正确编码URL参数中的特殊字符', async () => {
      const mockResponse = {
        success: true,
        data: { branch: 'main', changes: [] },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await client.getStatus('/test/repo with spaces')

      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:8765/repository/status?repo_path=%2Ftest%2Frepo+with+spaces',
        expect.any(Object)
      )
    })
  })
})
