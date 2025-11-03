/**
 * Chronos v2.0 - API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/server/index'
import fs from 'fs'
import path from 'path'

const TEST_REPO_PATH = path.join(__dirname, '../temp/test-repo')

describe('API Integration Tests', () => {
  beforeAll(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_REPO_PATH)) {
      fs.rmSync(TEST_REPO_PATH, { recursive: true })
    }
    fs.mkdirSync(TEST_REPO_PATH, { recursive: true })
  })

  afterAll(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_REPO_PATH)) {
      fs.rmSync(TEST_REPO_PATH, { recursive: true })
    }
  })

  describe('Repository API', () => {
    it('POST /api/repository/init - should initialize repository', async () => {
      const response = await request(app)
        .post('/api/repository/init')
        .send({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.path).toBe(TEST_REPO_PATH)
    })

    it('POST /api/repository/open - should open repository', async () => {
      const response = await request(app)
        .post('/api/repository/open')
        .send({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
    })

    it('GET /api/repository/status - should get repository status', async () => {
      const response = await request(app)
        .get('/api/repository/status')
        .query({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.branch).toBeDefined()
    })

    it('GET /api/repository/files - should get file list', async () => {
      const response = await request(app)
        .get('/api/repository/files')
        .query({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(Array.isArray(response.body.data.files)).toBe(true)
    })
  })

  describe('Snapshot API', () => {
    beforeAll(async () => {
      // 创建测试文件
      fs.writeFileSync(path.join(TEST_REPO_PATH, 'test.txt'), 'test content')
    })

    it('POST /api/repository/commit - should create snapshot', async () => {
      const response = await request(app)
        .post('/api/repository/commit')
        .send({
          path: TEST_REPO_PATH,
          message: 'Test commit',
          files: ['test.txt']
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
    })

    it('GET /api/repository/log - should get commit history', async () => {
      const response = await request(app)
        .get('/api/repository/log')
        .query({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(Array.isArray(response.body.data.logs)).toBe(true)
    })
  })

  describe('Branch API', () => {
    it('GET /api/repository/branches - should get branch list', async () => {
      const response = await request(app)
        .get('/api/repository/branches')
        .query({ path: TEST_REPO_PATH })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(Array.isArray(response.body.data.branches)).toBe(true)
    })

    it('POST /api/repository/branch - should create branch', async () => {
      const response = await request(app)
        .post('/api/repository/branch')
        .send({
          path: TEST_REPO_PATH,
          branchName: 'test-branch'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('POST /api/repository/switch - should switch branch', async () => {
      const response = await request(app)
        .post('/api/repository/switch')
        .send({
          path: TEST_REPO_PATH,
          branchName: 'test-branch'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should return 400 for invalid path', async () => {
      const response = await request(app)
        .post('/api/repository/init')
        .send({ path: '' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should return 404 for non-existent repository', async () => {
      const response = await request(app)
        .get('/api/repository/status')
        .query({ path: '/non/existent/path' })
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })
})
