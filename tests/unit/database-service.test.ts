/**
 * Chronos v2.0 - DatabaseService Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseService } from '../../src/server/services/database-service'
import fs from 'fs'
import path from 'path'

const TEST_DB_PATH = path.join(__dirname, '../temp/test-database.db')

describe('DatabaseService', () => {
  let dbService: DatabaseService

  beforeEach(() => {
    // 确保测试目录存在
    const dir = path.dirname(TEST_DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // 删除旧的测试数据库
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }

    dbService = new DatabaseService(TEST_DB_PATH)
  })

  afterEach(() => {
    dbService.close()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  describe('Repository Operations', () => {
    it('should save a repository', () => {
      dbService.saveRepository({
        id: 'test-id',
        path: '/test/path',
        name: 'test-repo',
        currentBranch: 'main'
      })
      
      const repo = dbService.getRepository('test-id')
      expect(repo).toBeDefined()
      expect(repo?.path).toBe('/test/path')
      expect(repo?.name).toBe('test-repo')
    })

    it('should get a repository by path', () => {
      dbService.saveRepository({
        id: 'test-id',
        path: '/test/path',
        name: 'test-repo'
      })
      
      const repo = dbService.getRepositoryByPath('/test/path')
      expect(repo).toBeDefined()
      expect(repo?.path).toBe('/test/path')
    })

    it('should return null for non-existent repository', () => {
      const repo = dbService.getRepository('non-existent')
      expect(repo).toBeNull()
    })

    it('should delete repository', () => {
      dbService.saveRepository({
        id: 'test-id',
        path: '/test/path',
        name: 'test-repo'
      })
      
      dbService.deleteRepository('test-id')
      const repo = dbService.getRepository('test-id')
      expect(repo).toBeNull()
    })

    it('should record repository open', () => {
      dbService.saveRepository({
        id: 'test-id',
        path: '/test/path',
        name: 'test-repo'
      })
      
      dbService.recordRepositoryOpen('test-id')
      const recent = dbService.getRecentRepositories(10)
      expect(recent.length).toBeGreaterThan(0)
    })

    it('should get recent repositories', () => {
      dbService.saveRepository({
        id: 'test-id-1',
        path: '/test/path1',
        name: 'repo1'
      })
      dbService.saveRepository({
        id: 'test-id-2',
        path: '/test/path2',
        name: 'repo2'
      })
      
      dbService.recordRepositoryOpen('test-id-1')
      dbService.recordRepositoryOpen('test-id-2')

      const recent = dbService.getRecentRepositories(2)
      expect(recent).toHaveLength(2)
    })
  })

  describe('Settings Operations', () => {
    it('should set and get setting', () => {
      dbService.setSetting('test.key', 'test-value')
      const value = dbService.getSetting('test.key')
      
      expect(value).toBe('test-value')
    })

    it('should return null for non-existent setting', () => {
      const value = dbService.getSetting('non.existent')
      expect(value).toBeNull()
    })

    it('should update existing setting', () => {
      dbService.setSetting('test.key', 'value1')
      dbService.setSetting('test.key', 'value2')
      
      const value = dbService.getSetting('test.key')
      expect(value).toBe('value2')
    })
  })
})
