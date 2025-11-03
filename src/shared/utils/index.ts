/**
 * Chronos v2.0 - Shared Utility Functions
 * 
 * 前后端共享的工具函数
 */

import { SYSTEM_FILES } from '../constants'

/**
 * 判断是否为系统文件
 */
export function isSystemFile(filename: string): boolean {
  return SYSTEM_FILES.some(pattern => {
    if (pattern.startsWith('.')) {
      return filename === pattern || filename.startsWith(pattern + '/')
    }
    return filename === pattern
  })
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  try {
    if (!date) {
      console.warn('[formatDate] Empty date received')
      return '未知时间'
    }

    let dateObj: Date

    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      console.warn('[formatDate] Invalid date type:', typeof date, date)
      return '无效日期'
    }

    // 检查是否为有效日期
    if (isNaN(dateObj.getTime())) {
      console.warn('[formatDate] Invalid date value:', date)
      return '无效日期'
    }

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return dateObj.toLocaleDateString('zh-CN')
    } else if (days > 0) {
      return `${days} 天前`
    } else if (hours > 0) {
      return `${hours} 小时前`
    } else if (minutes > 0) {
      return `${minutes} 分钟前`
    } else {
      return '刚刚'
    }
  } catch (error) {
    console.error('[formatDate] Error formatting date:', error, 'Original date:', date)
    return '日期格式错误'
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
