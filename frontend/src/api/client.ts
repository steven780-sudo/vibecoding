import type {
  ApiResponse,
  StatusData,
  CommitLog,
  BranchesData,
  MergeResult,
  InitRepositoryData,
} from '../types/api'

/**
 * Chronos API客户端
 * 封装所有与Backend的HTTP通信
 */
class ChronosApiClient {
  private baseUrl: string
  private maxRetries: number
  private retryDelay: number

  constructor(
    baseUrl: string = 'http://127.0.0.1:8765/api',
    maxRetries: number = 3
  ) {
    this.baseUrl = baseUrl
    this.maxRetries = maxRetries
    this.retryDelay = 1000 // 1秒
    console.log('🔧 API客户端初始化:', this.baseUrl)
  }

  /**
   * 检查后端服务器是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🏥 检查后端健康状态...')
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`, {
        method: 'GET',
      })
      const isHealthy = response.ok
      console.log('🏥 后端健康状态:', isHealthy ? '✅ 正常' : '❌ 异常')
      return isHealthy
    } catch (error) {
      console.error('🏥 后端健康检查失败:', error)
      return false
    }
  }

  /**
   * 通用HTTP请求方法
   * 包含错误处理和重试逻辑
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint}`
    console.log(`📡 API请求 [尝试 ${retryCount + 1}/${this.maxRetries + 1}]:`, fullUrl)
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      console.log(`📡 API响应状态:`, response.status, response.statusText)

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || data.message || `HTTP错误: ${response.status}`
        console.error(`❌ API错误:`, errorMsg)
        throw new Error(errorMsg)
      }
      
      // 如果Backend返回success=false，将message放到error字段中
      if (data.success === false && data.message && !data.error) {
        data.error = data.message
      }

      console.log(`✅ API请求成功:`, endpoint)
      return data
    } catch (error) {
      // 如果是网络错误且未达到最大重试次数，则重试
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        await this.delay(this.retryDelay)
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      // 返回错误响应
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }
  }

  /**
   * 判断是否为网络错误
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return true // fetch网络错误通常是TypeError
    }
    return false
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * GET请求
   */
  private async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint
    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * POST请求
   */
  private async post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // ==================== API方法 ====================

  /**
   * 初始化仓库
   */
  async initRepository(
    path: string
  ): Promise<ApiResponse<InitRepositoryData>> {
    return this.post('/repository/init', { path })
  }

  /**
   * 获取仓库状态
   */
  async getStatus(repoPath: string): Promise<ApiResponse<StatusData>> {
    return this.get('/repository/status', { path: repoPath })
  }

  /**
   * 获取所有已追踪的文件
   */
  async getTrackedFiles(
    repoPath: string
  ): Promise<ApiResponse<{ files: string[] }>> {
    return this.get('/repository/files', { path: repoPath })
  }

  /**
   * 创建快照（提交）
   */
  async createCommit(
    repoPath: string,
    message: string,
    files: string[] = []
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post('/repository/commit', {
      path: repoPath,
      message,
      files: files.length > 0 ? files : null,
    })
  }

  /**
   * 获取提交历史
   */
  async getLog(repoPath: string): Promise<ApiResponse<{ logs: CommitLog[] }>> {
    return this.get('/repository/log', { path: repoPath })
  }

  /**
   * 回滚到指定提交
   */
  async checkoutCommit(
    repoPath: string,
    commitId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post('/repository/checkout', {
      path: repoPath,
      commit_id: commitId,
    })
  }

  /**
   * 获取所有分支
   */
  async getBranches(repoPath: string): Promise<ApiResponse<BranchesData>> {
    return this.get('/repository/branches', { path: repoPath })
  }

  /**
   * 创建新分支
   */
  async createBranch(
    repoPath: string,
    name: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post('/repository/branch', {
      path: repoPath,
      branch_name: name,
    })
  }

  /**
   * 切换分支
   */
  async switchBranch(
    repoPath: string,
    branch: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post('/repository/switch', {
      path: repoPath,
      branch_name: branch,
    })
  }

  /**
   * 合并分支
   */
  async mergeBranch(
    repoPath: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<ApiResponse<MergeResult>> {
    return this.post('/repository/merge', {
      path: repoPath,
      source_branch: sourceBranch,
      target_branch: targetBranch,
    })
  }
}

// 导出单例实例
export const apiClient = new ChronosApiClient()

// 也导出类，以便测试时可以创建新实例
export default ChronosApiClient
