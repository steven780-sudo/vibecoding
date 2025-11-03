/**
 * Chronos v2.0 - Shared Constants
 * 
 * 前后端共享的常量定义
 */

export const APP_NAME = 'Chronos'
export const APP_VERSION = '2.0.0'

export const DEFAULT_BRANCH = 'main'
export const DEFAULT_AUTHOR = 'Chronos User'
export const DEFAULT_EMAIL = 'user@chronos.local'

export const MAX_RECENT_REPOS = 10
export const MAX_LOG_DEPTH = 100

export const SYSTEM_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  '.git',
  'node_modules',
  '.vscode',
  '.idea',
]

export const ERROR_CODES = {
  REPO_NOT_FOUND: 'REPO_NOT_FOUND',
  REPO_NOT_INITIALIZED: 'REPO_NOT_INITIALIZED',
  INVALID_PATH: 'INVALID_PATH',
  GIT_ERROR: 'GIT_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  MERGE_CONFLICT: 'MERGE_CONFLICT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export const API_ENDPOINTS = {
  REPO_INIT: '/api/repository/init',
  REPO_OPEN: '/api/repository/open',
  REPO_STATUS: '/api/repository/status',
  REPO_FILES: '/api/repository/files',
  REPO_RECENT: '/api/repository/recent',
  REPO_DELETE: '/api/repository',
  SNAPSHOT_CREATE: '/api/repository/commit',
  SNAPSHOT_LIST: '/api/repository/log',
  SNAPSHOT_CHECKOUT: '/api/repository/checkout',
  BRANCH_LIST: '/api/repository/branches',
  BRANCH_CREATE: '/api/repository/branch',
  BRANCH_SWITCH: '/api/repository/switch',
  BRANCH_MERGE: '/api/repository/merge',
} as const
