/**
 * Chronos v2.0 - UI Store
 * 
 * UI 状态管理（使用 Zustand）
 */

import { create } from 'zustand'

interface UIState {
  // Loading 状态
  globalLoading: boolean
  loadingMessage: string
  
  // Error 状态
  error: string | null
  
  // Modal 状态
  snapshotDialogVisible: boolean
  branchDialogVisible: boolean
  
  // 侧边栏状态
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void
  setError: (error: string | null) => void
  showSnapshotDialog: () => void
  hideSnapshotDialog: () => void
  showBranchDialog: () => void
  hideBranchDialog: () => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  reset: () => void
}

/**
 * UI Store
 */
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  globalLoading: false,
  loadingMessage: '',
  error: null,
  snapshotDialogVisible: false,
  branchDialogVisible: false,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,

  // Actions
  setGlobalLoading: (loading, message = '') =>
    set({ globalLoading: loading, loadingMessage: message }),

  setError: (error) =>
    set({ error }),

  showSnapshotDialog: () =>
    set({ snapshotDialogVisible: true }),

  hideSnapshotDialog: () =>
    set({ snapshotDialogVisible: false }),

  showBranchDialog: () =>
    set({ branchDialogVisible: true }),

  hideBranchDialog: () =>
    set({ branchDialogVisible: false }),

  toggleLeftPanel: () =>
    set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),

  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),

  reset: () =>
    set({
      globalLoading: false,
      loadingMessage: '',
      error: null,
      snapshotDialogVisible: false,
      branchDialogVisible: false,
      leftPanelCollapsed: false,
      rightPanelCollapsed: false
    })
}))
