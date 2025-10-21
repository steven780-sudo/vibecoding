// API响应类型定义

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface FileChange {
  status: string // 'A', 'M', 'D'
  file: string
}

export interface StatusData {
  branch: string
  changes: FileChange[]
}

export interface CommitLog {
  id: string
  message: string
  author: string
  date: string
}

export interface BranchesData {
  branches: string[]
  current: string
}

export interface MergeResult {
  message: string
  conflicts: string[]
}

export interface InitRepositoryData {
  already_initialized: boolean
  gitignore?: {
    created: boolean
    updated: boolean
    rules_added: string[]
    message: string
  }
  cleaned_files?: string[]
}
