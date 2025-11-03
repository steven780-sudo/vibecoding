/**
 * Chronos v2.0 - Error Handling
 * 
 * 应用错误类和错误处理工具
 */

import { ERROR_CODES } from '@/shared/constants'

/**
 * 应用错误类
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 创建错误实例的工厂函数
 */
export const createError = {
  repoNotFound: (path: string) =>
    new AppError(ERROR_CODES.REPO_NOT_FOUND, '仓库不存在', { path }),

  repoNotInitialized: (path: string) =>
    new AppError(ERROR_CODES.REPO_NOT_INITIALIZED, '仓库未初始化', { path }),

  invalidPath: (path: string) =>
    new AppError(ERROR_CODES.INVALID_PATH, '无效的路径', { path }),

  gitError: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.GIT_ERROR, `Git 操作失败: ${message}`, details),

  fileNotFound: (path: string) =>
    new AppError(ERROR_CODES.FILE_NOT_FOUND, '文件不存在', { path }),

  mergeConflict: (conflicts: string[]) =>
    new AppError(ERROR_CODES.MERGE_CONFLICT, '合并冲突', { conflicts }),

  unknown: (message: string, details?: unknown) =>
    new AppError(ERROR_CODES.UNKNOWN_ERROR, message, details),
}

/**
 * 判断是否为 AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
