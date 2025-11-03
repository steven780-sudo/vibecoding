/**
 * Chronos v2.0 - File Service
 * 
 * 文件系统操作服务
 */

import fs from 'fs/promises'
import { watch, FSWatcher } from 'chokidar'
import path from 'path'
import type { FileNode } from '@/shared/types'
import { isSystemFile } from '@/shared/utils'

/**
 * 文件操作服务
 */
export class FileService {
  private watcher: FSWatcher | null = null

  /**
   * 扫描目录
   */
  async scanDirectory(dirPath: string, basePath?: string): Promise<FileNode[]> {
    // 如果没有提供 basePath，使用 dirPath 作为基准路径
    const base = basePath || dirPath
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const nodes: FileNode[] = []

    for (const entry of entries) {
      // 跳过系统文件
      if (isSystemFile(entry.name)) {
        continue
      }

      const fullPath = path.join(dirPath, entry.name)
      // 始终相对于 base 路径计算
      const relativePath = path.relative(base, fullPath)

      const node: FileNode = {
        id: fullPath,
        name: entry.name,
        path: relativePath,
        type: entry.isDirectory() ? 'directory' : 'file',
      }

      if (entry.isDirectory()) {
        // 递归扫描时传递 base 路径
        node.children = await this.scanDirectory(fullPath, base)
        node.isExpanded = false
      }

      nodes.push(node)
    }

    // 按名称排序：目录在前，文件在后
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === 'directory' ? -1 : 1
    })
  }

  /**
   * 监听目录变化
   */
  watchDirectory(
    dirPath: string,
    callback: (event: string, filePath: string) => void
  ): void {
    this.watcher = watch(dirPath, {
      ignored: /(^|[/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
      depth: 10, // 限制递归深度
    })

    this.watcher
      .on('add', (filePath) => callback('add', filePath))
      .on('change', (filePath) => callback('change', filePath))
      .on('unlink', (filePath) => callback('unlink', filePath))
      .on('addDir', (filePath) => callback('addDir', filePath))
      .on('unlinkDir', (filePath) => callback('unlinkDir', filePath))
  }

  /**
   * 停止监听
   */
  async unwatchDirectory(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
  }

  /**
   * 检查路径是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查是否为目录
   */
  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string) {
    const stats = await fs.stat(filePath)
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
    }
  }
}
