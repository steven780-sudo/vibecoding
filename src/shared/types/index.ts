/**
 * Chronos v2.0 - Shared Type Definitions
 * 
 * 前后端共享的类型定义
 */

export interface Repository {
  id: string
  path: string
  name: string
  currentBranch: string
  isClean: boolean
  lastOpened: Date
  createdAt: Date
}

export interface Snapshot {
  id: string
  shortId: string
  message: string
  author: string
  email: string
  timestamp: Date
  parents: string[]
  isMerge: boolean
  files: FileChange[]
}

export interface FileChange {
  path: string
  status: FileStatus
  oldPath?: string
}

export enum FileStatus {
  Added = 'added',
  Modified = 'modified',
  Deleted = 'deleted',
  Renamed = 'renamed',
  Copied = 'copied'
}

export interface Branch {
  name: string
  isCurrent: boolean
  lastCommit: string
  lastCommitDate: Date
}

export interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  status?: FileStatus
  children?: FileNode[]
  isExpanded?: boolean
  isSelected?: boolean
}

export interface RepositoryStatus {
  branch: string
  changes: FileChange[]
  isClean: boolean
}

export interface MergeResult {
  hasConflicts: boolean
  conflicts?: string[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
