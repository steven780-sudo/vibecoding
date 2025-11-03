/**
 * Chronos v2.0 - Repository Routes
 * 
 * 仓库相关的 API 路由
 */

import { Router } from 'express'
import { GitService } from '../services/git-service'
import { FileService } from '../services/file-service'
import { DatabaseService } from '../services/database-service'
import { createError, isAppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { generateId } from '@/shared/utils'
import { ERROR_CODES } from '@/shared/constants'
import type { ApiResponse } from '@/shared/types'
import path from 'path'

const router = Router()
const gitService = new GitService()
const fileService = new FileService()

// 数据库服务（需要在应用启动时初始化）
let dbService: DatabaseService

export function initializeDatabase(db: DatabaseService): void {
  dbService = db
}

/**
 * POST /api/repository/init
 * 初始化仓库
 */
router.post('/init', async (req, res) => {
  try {
    const { path: repoPath } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    // 检查路径是否存在
    const exists = await fileService.exists(repoPath)
    if (!exists) {
      throw createError.repoNotFound(repoPath)
    }

    // 检查是否为目录
    const isDir = await fileService.isDirectory(repoPath)
    if (!isDir) {
      throw createError.invalidPath('路径必须是文件夹')
    }

    // 初始化 Git 仓库
    await gitService.init(repoPath)

    // 保存到数据库
    const repoId = generateId()
    dbService.saveRepository({
      id: repoId,
      path: repoPath,
      name: path.basename(repoPath),
      currentBranch: 'main',
      lastOpened: new Date(),
    })

    dbService.recordRepositoryOpen(repoId)

    logger.info('Repository initialized', { path: repoPath })

    const response: ApiResponse = {
      success: true,
      data: {
        id: repoId,
        path: repoPath,
        name: path.basename(repoPath),
      },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to initialize repository', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/open
 * 打开仓库
 */
router.post('/open', async (req, res) => {
  try {
    const { path: repoPath } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    // 检查路径是否存在
    const exists = await fileService.exists(repoPath)
    if (!exists) {
      throw createError.repoNotFound(repoPath)
    }

    // 检查是否已初始化
    const isInit = await gitService.isInitialized(repoPath)
    if (!isInit) {
      throw createError.repoNotInitialized(repoPath)
    }

    // 从数据库获取或创建仓库记录
    let repo = dbService.getRepositoryByPath(repoPath)

    if (!repo) {
      const repoId = generateId()
      dbService.saveRepository({
        id: repoId,
        path: repoPath,
        name: path.basename(repoPath),
        currentBranch: 'main',
        lastOpened: new Date(),
      })
      repo = dbService.getRepository(repoId)
    } else {
      // 更新最后打开时间
      dbService.saveRepository({
        ...repo,
        lastOpened: new Date(),
      })
    }

    if (repo) {
      dbService.recordRepositoryOpen(repo.id)
    }

    logger.info('Repository opened', { path: repoPath })

    const response: ApiResponse = {
      success: true,
      data: repo,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to open repository', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * GET /api/repository/status
 * 获取仓库状态
 */
router.get('/status', async (req, res) => {
  try {
    const { path: repoPath } = req.query

    if (!repoPath || typeof repoPath !== 'string') {
      throw createError.invalidPath('路径不能为空')
    }

    // 检查路径是否存在
    const exists = await fileService.exists(repoPath)
    if (!exists) {
      throw createError.repoNotFound(repoPath)
    }

    const status = await gitService.getStatus(repoPath)

    const response: ApiResponse = {
      success: true,
      data: status,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to get repository status', error)

    if (isAppError(error)) {
      // 根据错误码返回不同的HTTP状态码
      const statusCode = error.code === ERROR_CODES.REPO_NOT_FOUND ? 404 : 400
      res.status(statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * 递归地将状态信息添加到文件树中
 */
function addStatusToFileTree(files: any[], statusMap: Map<string, string>): any[] {
  return files.map(file => {
    const fileWithStatus = {
      ...file,
      status: statusMap.get(file.path)
    }
    
    if (file.children && file.children.length > 0) {
      fileWithStatus.children = addStatusToFileTree(file.children, statusMap)
    }
    
    return fileWithStatus
  })
}

/**
 * GET /api/repository/files
 * 获取文件列表（包含状态信息）
 */
router.get('/files', async (req, res) => {
  try {
    const { path: repoPath } = req.query

    if (!repoPath || typeof repoPath !== 'string') {
      throw createError.invalidPath('路径不能为空')
    }

    // 获取文件列表和状态
    const [files, status] = await Promise.all([
      fileService.scanDirectory(repoPath),
      gitService.getStatus(repoPath)
    ])

    // 创建状态映射表
    const statusMap = new Map(
      status.changes.map(change => [change.path, change.status])
    )

    // 递归地将状态信息合并到文件树中
    const filesWithStatus = addStatusToFileTree(files, statusMap)

    const response: ApiResponse = {
      success: true,
      data: { files: filesWithStatus },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to get files', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/commit
 * 创建快照
 */
router.post('/commit', async (req, res) => {
  try {
    const { path: repoPath, message, files } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    if (!message) {
      throw createError.gitError('提交信息不能为空')
    }

    const commitId = await gitService.createCommit(repoPath, message, files)

    logger.info('Commit created', { path: repoPath, commitId })

    const response: ApiResponse = {
      success: true,
      data: { commitId },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to create commit', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * GET /api/repository/log
 * 获取历史记录
 */
router.get('/log', async (req, res) => {
  try {
    const { path: repoPath, limit } = req.query

    if (!repoPath || typeof repoPath !== 'string') {
      throw createError.invalidPath('路径不能为空')
    }

    const limitNum = limit ? parseInt(limit as string, 10) : undefined

    const logs = await gitService.getLog(repoPath, limitNum)

    const response: ApiResponse = {
      success: true,
      data: { logs },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to get log', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/checkout
 * 回滚到指定快照
 */
router.post('/checkout', async (req, res) => {
  try {
    const { path: repoPath, commitId } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    if (!commitId) {
      throw createError.gitError('提交 ID 不能为空')
    }

    await gitService.checkout(repoPath, commitId)

    logger.info('Checked out commit', { path: repoPath, commitId })

    const response: ApiResponse = {
      success: true,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to checkout', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * GET /api/repository/branches
 * 获取分支列表
 */
router.get('/branches', async (req, res) => {
  try {
    const { path: repoPath } = req.query

    if (!repoPath || typeof repoPath !== 'string') {
      throw createError.invalidPath('路径不能为空')
    }

    const branches = await gitService.getBranches(repoPath)

    const response: ApiResponse = {
      success: true,
      data: { branches },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to get branches', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/branch
 * 创建分支
 */
router.post('/branch', async (req, res) => {
  try {
    const { path: repoPath, branchName } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    if (!branchName) {
      throw createError.gitError('分支名称不能为空')
    }

    await gitService.createBranch(repoPath, branchName)

    logger.info('Branch created', { path: repoPath, branchName })

    const response: ApiResponse = {
      success: true,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to create branch', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/switch
 * 切换分支
 */
router.post('/switch', async (req, res) => {
  try {
    const { path: repoPath, branchName } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    if (!branchName) {
      throw createError.gitError('分支名称不能为空')
    }

    await gitService.switchBranch(repoPath, branchName)

    logger.info('Switched branch', { path: repoPath, branchName })

    const response: ApiResponse = {
      success: true,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to switch branch', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/merge
 * 合并分支
 */
router.post('/merge', async (req, res) => {
  try {
    const { path: repoPath, sourceBranch, targetBranch } = req.body

    if (!repoPath) {
      throw createError.invalidPath('路径不能为空')
    }

    if (!sourceBranch) {
      throw createError.gitError('源分支不能为空')
    }

    const result = await gitService.mergeBranch(repoPath, sourceBranch, targetBranch)

    logger.info('Merged branch', { path: repoPath, sourceBranch, targetBranch })

    const response: ApiResponse = {
      success: true,
      data: result,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to merge branch', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * GET /api/repository/recent
 * 获取最近使用的仓库列表
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit } = req.query
    const limitNum = limit ? parseInt(limit as string, 10) : 10

    const repositories = dbService.getRecentRepositories(limitNum)

    // 验证路径是否仍然存在
    const validRepositories = []
    for (const repo of repositories) {
      const exists = await fileService.exists(repo.path)
      if (exists) {
        validRepositories.push(repo)
      }
    }

    logger.info('Retrieved recent repositories', { count: validRepositories.length })

    const response: ApiResponse = {
      success: true,
      data: { repositories: validRepositories },
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to get recent repositories', error)

    res.status(500).json({
      success: false,
      error: '服务器错误',
    })
  }
})

/**
 * DELETE /api/repository/:id
 * 删除仓库记录（软删除 - 不删除实际文件）
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      throw createError.invalidPath('仓库 ID 不能为空')
    }

    dbService.deleteRepository(id)

    logger.info('Repository record deleted (soft delete)', { id })

    const response: ApiResponse = {
      success: true,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to delete repository', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

/**
 * POST /api/repository/destroy
 * 完全移除时光机管理（硬删除 - 删除 .git 文件夹）
 */
router.post('/destroy', async (req, res) => {
  try {
    const { id } = req.body

    if (!id) {
      throw createError.invalidPath('仓库 ID 不能为空')
    }

    // 获取仓库信息
    const repo = dbService.getRepository(id)
    if (!repo) {
      throw createError.repoNotFound('仓库不存在')
    }

    // 先删除 .gitignore 文件（在删除 .git 之前）
    const gitignorePath = path.join(repo.path, '.gitignore')
    const gitignoreExists = await fileService.exists(gitignorePath)

    if (gitignoreExists) {
      await import('fs/promises').then(fs => fs.unlink(gitignorePath))
      logger.info('Removed .gitignore file', { path: gitignorePath })
    }

    // 再删除 .git 文件夹
    const gitPath = path.join(repo.path, '.git')
    const gitExists = await fileService.exists(gitPath)

    if (gitExists) {
      await import('fs/promises').then(fs => fs.rm(gitPath, { recursive: true, force: true }))
      logger.info('Removed .git directory', { path: gitPath })
    }

    // 删除数据库记录
    dbService.deleteRepository(id)

    logger.info('Repository completely destroyed (hard delete)', { id, path: repo.path })

    const response: ApiResponse = {
      success: true,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to destroy repository', error)

    if (isAppError(error)) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    } else {
      res.status(500).json({
        success: false,
        error: '服务器错误',
      })
    }
  }
})

export default router
