/**
 * Chronos v2.0 - Test Utilities
 * 
 * 测试辅助函数
 */

import { mkdtemp, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

/**
 * 创建临时测试目录
 */
export async function createTempDir(): Promise<string> {
  const prefix = join(tmpdir(), 'chronos-test-')
  return await mkdtemp(prefix)
}

/**
 * 清理临时测试目录
 */
export async function cleanupTempDir(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    console.error('Failed to cleanup temp dir:', error)
  }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
