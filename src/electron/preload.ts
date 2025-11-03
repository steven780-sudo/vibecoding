/**
 * Chronos v2.0 - Electron Preload Script
 * 
 * Electron 预加载脚本
 */

import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露给渲染进程的 API
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 选择文件夹
   */
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),

  /**
   * 选择文件
   */
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),

  /**
   * 显示消息框
   */
  showMessage: (options: Electron.MessageBoxOptions) =>
    ipcRenderer.invoke('dialog:showMessage', options),

  /**
   * 检查是否在 Electron 环境中
   */
  isElectron: true
})

/**
 * 类型声明
 */
declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>
      selectFile: () => Promise<string | null>
      showMessage: (options: Electron.MessageBoxOptions) => Promise<void>
      isElectron: boolean
    }
  }
}
