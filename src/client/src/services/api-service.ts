/**
 * Chronos v2.0 - API Service
 * 
 * 前端 API 调用服务
 */

import type {
  Repository,
  RepositoryStatus,
  FileNode,
  Snapshot,
  Branch,
  MergeResult,
  ApiResponse,
} from '@/shared/types'
import { API_ENDPOINTS } from '@/shared/constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '请求失败')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * 初始化仓库
   */
  async initRepository(path: string): Promise<Repository> {
    const response = await this.request<Repository>(API_ENDPOINTS.REPO_INIT, {
      method: 'POST',
      body: JSON.stringify({ path }),
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '初始化失败')
    }

    return response.data
  }

  /**
   * 打开仓库
   */
  async openRepository(path: string): Promise<Repository> {
    const response = await this.request<Repository>(API_ENDPOINTS.REPO_OPEN, {
      method: 'POST',
      body: JSON.stringify({ path }),
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '打开失败')
    }

    return response.data
  }

  /**
   * 获取仓库状态
   */
  async getStatus(path: string): Promise<RepositoryStatus> {
    const response = await this.request<RepositoryStatus>(
      `${API_ENDPOINTS.REPO_STATUS}?path=${encodeURIComponent(path)}`
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || '获取状态失败')
    }

    return response.data
  }

  /**
   * 获取文件列表
   */
  async getFiles(path: string): Promise<FileNode[]> {
    const response = await this.request<{ files: FileNode[] }>(
      `${API_ENDPOINTS.REPO_FILES}?path=${encodeURIComponent(path)}`
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || '获取文件列表失败')
    }

    return response.data.files
  }

  /**
   * 创建快照
   */
  async createSnapshot(
    path: string,
    message: string,
    files?: string[]
  ): Promise<string> {
    const response = await this.request<{ commitId: string }>(
      API_ENDPOINTS.SNAPSHOT_CREATE,
      {
        method: 'POST',
        body: JSON.stringify({ path, message, files }),
      }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || '创建快照失败')
    }

    return response.data.commitId
  }

  /**
   * 获取历史记录
   */
  async getLog(path: string, limit?: number): Promise<Snapshot[]> {
    const url = limit
      ? `${API_ENDPOINTS.SNAPSHOT_LIST}?path=${encodeURIComponent(path)}&limit=${limit}`
      : `${API_ENDPOINTS.SNAPSHOT_LIST}?path=${encodeURIComponent(path)}`

    const response = await this.request<{ logs: Snapshot[] }>(url)

    if (!response.success || !response.data) {
      throw new Error(response.error || '获取历史记录失败')
    }

    return response.data.logs
  }

  /**
   * 回滚到指定快照
   */
  async checkout(path: string, commitId: string): Promise<void> {
    const response = await this.request(API_ENDPOINTS.SNAPSHOT_CHECKOUT, {
      method: 'POST',
      body: JSON.stringify({ path, commitId }),
    })

    if (!response.success) {
      throw new Error(response.error || '回滚失败')
    }
  }

  /**
   * 获取分支列表
   */
  async getBranches(path: string): Promise<Branch[]> {
    const response = await this.request<{ branches: Branch[] }>(
      `${API_ENDPOINTS.BRANCH_LIST}?path=${encodeURIComponent(path)}`
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || '获取分支列表失败')
    }

    return response.data.branches
  }

  /**
   * 创建分支
   */
  async createBranch(path: string, branchName: string): Promise<void> {
    const response = await this.request(API_ENDPOINTS.BRANCH_CREATE, {
      method: 'POST',
      body: JSON.stringify({ path, branchName }),
    })

    if (!response.success) {
      throw new Error(response.error || '创建分支失败')
    }
  }

  /**
   * 切换分支
   */
  async switchBranch(path: string, branchName: string): Promise<void> {
    const response = await this.request(API_ENDPOINTS.BRANCH_SWITCH, {
      method: 'POST',
      body: JSON.stringify({ path, branchName }),
    })

    if (!response.success) {
      throw new Error(response.error || '切换分支失败')
    }
  }

  /**
   * 合并分支
   */
  async mergeBranch(
    path: string,
    sourceBranch: string,
    targetBranch?: string
  ): Promise<MergeResult> {
    const response = await this.request<MergeResult>(API_ENDPOINTS.BRANCH_MERGE, {
      method: 'POST',
      body: JSON.stringify({ path, sourceBranch, targetBranch }),
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '合并分支失败')
    }

    return response.data
  }

  /**
   * 获取最近使用的仓库列表
   */
  async getRecentRepositories(limit?: number): Promise<Repository[]> {
    const url = limit
      ? `${API_ENDPOINTS.REPO_RECENT}?limit=${limit}`
      : API_ENDPOINTS.REPO_RECENT

    const response = await this.request<{ repositories: Repository[] }>(url)

    if (!response.success || !response.data) {
      throw new Error(response.error || '获取最近使用仓库失败')
    }

    return response.data.repositories
  }

  /**
   * 删除仓库记录（软删除）
   */
  async deleteRepository(id: string): Promise<void> {
    const response = await this.request(`${API_ENDPOINTS.REPO_DELETE}/${id}`, {
      method: 'DELETE',
    })

    if (!response.success) {
      throw new Error(response.error || '删除仓库失败')
    }
  }

  /**
   * 完全移除时光机管理（硬删除）
   */
  async destroyRepository(id: string): Promise<void> {
    const response = await this.request(`${API_ENDPOINTS.REPO_DELETE}/destroy`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    })

    if (!response.success) {
      throw new Error(response.error || '移除时光机管理失败')
    }
  }
}

export const apiService = new ApiService()
