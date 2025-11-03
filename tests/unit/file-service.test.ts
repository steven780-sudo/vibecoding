/**
 * Chronos v2.0 - FileService Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileService } from '../../src/server/services/file-service'
import fs from 'fs'
import path from 'path'

const TEST_DIR = path.join(__dirname, '../temp/file-service-test')

describe('FileService', () => {
  let fileService: FileService

  beforeEach(() => {
    // 创建测试目录
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true })
    }
    fs.mkdirSync(TEST_DIR, { recursive: true })

    // 创建测试文件结构
    fs.writeFileSync(path.join(TEST_DIR, 'file1.txt'), 'content1')
    fs.writeFileSync(path.join(TEST_DIR, 'file2.txt'), 'content2')
    fs.mkdirSync(path.join(TEST_DIR, 'subdir'))
    fs.writeFileSync(path.join(TEST_DIR, 'subdir', 'file3.txt'), 'content3')

    fileService = new FileService()
  })

  afterEach(() => {
    fileService.unwatchDirectory(TEST_DIR)
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true })
    }
  })

  describe('File Operations', () => {
    it('should check if path exists', async () => {
      const exists = await fileService.exists(TEST_DIR)
      expect(exists).toBe(true)
    })

    it('should return false for non-existent path', async () => {
      const exists = await fileService.exists('/non/existent/path')
      expect(exists).toBe(false)
    })

    it('should check if path is directory', async () => {
      const isDir = await fileService.isDirectory(TEST_DIR)
      expect(isDir).toBe(true)
    })

    it('should return false for file path', async () => {
      const filePath = path.join(TEST_DIR, 'file1.txt')
      const isDir = await fileService.isDirectory(filePath)
      expect(isDir).toBe(false)
    })

    it('should get file info', async () => {
      const filePath = path.join(TEST_DIR, 'file1.txt')
      const info = await fileService.getFileInfo(filePath)
      
      expect(info).toBeDefined()
      expect(info.isFile).toBe(true)
      expect(info.isDirectory).toBe(false)
      expect(info.size).toBeGreaterThan(0)
    })
  })

  describe('Directory Scanning', () => {
    it('should scan directory', async () => {
      const files = await fileService.scanDirectory(TEST_DIR)
      
      expect(files).toBeDefined()
      expect(files.length).toBeGreaterThan(0)
    })

    it('should scan directory recursively', async () => {
      const files = await fileService.scanDirectory(TEST_DIR, true)
      
      expect(files).toBeDefined()
      expect(files.length).toBeGreaterThanOrEqual(3) // file1, file2, subdir/file3
    })

    it('should filter system files', async () => {
      // 创建系统文件
      fs.writeFileSync(path.join(TEST_DIR, '.DS_Store'), 'system')
      fs.writeFileSync(path.join(TEST_DIR, 'Thumbs.db'), 'system')
      
      const files = await fileService.scanDirectory(TEST_DIR)
      
      const hasSystemFiles = files.some(f => {
        const fileName = typeof f === 'string' ? f : f.name || ''
        return fileName.includes('.DS_Store') || fileName.includes('Thumbs.db')
      })
      expect(hasSystemFiles).toBe(false)
    })
  })

  describe('Directory Watching', () => {
    it('should watch directory', () => {
      const callback = () => {}
      fileService.watchDirectory(TEST_DIR, callback)
      
      // 验证监听已设置（通过不抛出错误）
      expect(() => fileService.unwatchDirectory(TEST_DIR)).not.toThrow()
    })

    it('should unwatch directory', () => {
      const callback = () => {}
      fileService.watchDirectory(TEST_DIR, callback)
      fileService.unwatchDirectory(TEST_DIR)
      
      // 再次 unwatch 不应该抛出错误
      expect(() => fileService.unwatchDirectory(TEST_DIR)).not.toThrow()
    })
  })
})
