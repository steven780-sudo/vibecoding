/**
 * Chronos v2.0 - Repository Store
 * 
 * 仓库状态管理（Zustand）
 */

import { create } from 'zustand'
import type {
  Repository,
  RepositoryStatus,
  FileNode,
  Snapshot,
  Branch,
} from '@/shared/types'

interface RepositoryState {
  // 状态
  currentRepository: Repository | null
  status: RepositoryStatus | null
  files: FileNode[]
  selectedFiles: Set<string>
  snapshots: Snapshot[]
  branches: Branch[]
  loading: boolean
  error: string | null

  // 操作
  setCurrentRepository: (repo: Repository | null) => void
  setStatus: (status: RepositoryStatus | null) => void
  setFiles: (files: FileNode[]) => void
  setSelectedFiles: (files: Set<string>) => void
  toggleFileSelection: (filePath: string) => void
  setSnapshots: (snapshots: Snapshot[]) => void
  setBranches: (branches: Branch[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentRepository: null,
  status: null,
  files: [],
  selectedFiles: new Set<string>(),
  snapshots: [],
  branches: [],
  loading: false,
  error: null,
}

export const useRepositoryStore = create<RepositoryState>((set, get) => ({
  ...initialState,

  setCurrentRepository: (repo) => set({ currentRepository: repo }),

  setStatus: (status) => set({ status }),

  setFiles: (files) => set({ files }),

  setSelectedFiles: (files) => set({ selectedFiles: files }),

  toggleFileSelection: (filePath) => {
    const { selectedFiles } = get()
    const newSelection = new Set(selectedFiles)

    if (newSelection.has(filePath)) {
      newSelection.delete(filePath)
    } else {
      newSelection.add(filePath)
    }

    set({ selectedFiles: newSelection })
  },

  setSnapshots: (snapshots) => set({ snapshots }),

  setBranches: (branches) => set({ branches }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))
