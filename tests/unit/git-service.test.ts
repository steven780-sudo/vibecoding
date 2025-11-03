/**
 * Chronos v2.0 - GitService Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GitService } from '@/server/services/git-service'
import { createTempDir, cleanupTempDir } from '../helpers/test-utils'
import fs from 'fs/promises'
import path from 'path'

describe('GitService', () => {
  let gitService: GitService
  let testRepoPath: string

  beforeEach(async () => {
    gitService = new GitService()
    testRepoPath = await createTempDir()
  })

  afterEach(async () => {
    await cleanupTempDir(testRepoPath)
  })

  describe('init', () => {
    it('should initialize a new repository', async () => {
      await gitService.init(testRepoPath)

      const isInit = await gitService.isInitialized(testRepoPath)
      expect(isInit).toBe(true)
    })

    it('should create .gitignore file', async () => {
      await gitService.init(testRepoPath)

      const gitignorePath = path.join(testRepoPath, '.gitignore')
      const exists = await fs
        .access(gitignorePath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
    })
  })

  describe('isInitialized', () => {
    it('should return false for uninitialized repo', async () => {
      const isInit = await gitService.isInitialized(testRepoPath)
      expect(isInit).toBe(false)
    })

    it('should return true for initialized repo', async () => {
      await gitService.init(testRepoPath)
      const isInit = await gitService.isInitialized(testRepoPath)
      expect(isInit).toBe(true)
    })
  })

  describe('getStatus', () => {
    it('should return clean status for new repo', async () => {
      await gitService.init(testRepoPath)

      const status = await gitService.getStatus(testRepoPath)

      expect(status.isClean).toBe(false) // .gitignore is untracked
      expect(status.branch).toBe('main')
    })

    it('should detect new files', async () => {
      await gitService.init(testRepoPath)

      // Create a test file
      const testFile = path.join(testRepoPath, 'test.txt')
      await fs.writeFile(testFile, 'test content')

      const status = await gitService.getStatus(testRepoPath)

      expect(status.isClean).toBe(false)
      expect(status.changes.length).toBeGreaterThan(0)
    })
  })

  describe('createCommit', () => {
    it('should create a commit', async () => {
      await gitService.init(testRepoPath)

      // Create and commit a file
      const testFile = path.join(testRepoPath, 'test.txt')
      await fs.writeFile(testFile, 'test content')

      const commitId = await gitService.createCommit(testRepoPath, 'Initial commit')

      expect(commitId).toBeTruthy()
      expect(typeof commitId).toBe('string')
    })

    it('should create commit with specific files', async () => {
      await gitService.init(testRepoPath)

      // Create multiple files
      await fs.writeFile(path.join(testRepoPath, 'file1.txt'), 'content 1')
      await fs.writeFile(path.join(testRepoPath, 'file2.txt'), 'content 2')

      const commitId = await gitService.createCommit(testRepoPath, 'Add files', [
        'file1.txt',
      ])

      expect(commitId).toBeTruthy()
    })
  })

  describe('getLog', () => {
    it('should return empty log for new repo', async () => {
      await gitService.init(testRepoPath)

      const log = await gitService.getLog(testRepoPath)

      expect(log).toEqual([])
    })

    it('should return commit history', async () => {
      await gitService.init(testRepoPath)

      // Create a commit
      await fs.writeFile(path.join(testRepoPath, 'test.txt'), 'test')
      await gitService.createCommit(testRepoPath, 'Test commit')

      const log = await gitService.getLog(testRepoPath)

      expect(log.length).toBe(1)
      expect(log[0]?.message).toBe('Test commit')
      expect(log[0]?.author).toBe('Chronos User')
    })

    it('should limit log depth', async () => {
      await gitService.init(testRepoPath)

      // Create multiple commits
      for (let i = 0; i < 5; i++) {
        await fs.writeFile(path.join(testRepoPath, `file${i}.txt`), `content ${i}`)
        await gitService.createCommit(testRepoPath, `Commit ${i}`)
      }

      const log = await gitService.getLog(testRepoPath, 3)

      expect(log.length).toBe(3)
    })
  })

  describe('getBranches', () => {
    it('should return main branch', async () => {
      await gitService.init(testRepoPath)

      // Create initial commit
      await fs.writeFile(path.join(testRepoPath, 'test.txt'), 'test')
      await gitService.createCommit(testRepoPath, 'Initial commit')

      const branches = await gitService.getBranches(testRepoPath)

      expect(branches.length).toBeGreaterThan(0)
      expect(branches.some((b) => b.name === 'main')).toBe(true)
      expect(branches.find((b) => b.name === 'main')?.isCurrent).toBe(true)
    })
  })

  describe('createBranch', () => {
    it('should create and switch to new branch', async () => {
      await gitService.init(testRepoPath)

      // Create initial commit
      await fs.writeFile(path.join(testRepoPath, 'test.txt'), 'test')
      await gitService.createCommit(testRepoPath, 'Initial commit')

      await gitService.createBranch(testRepoPath, 'feature')

      const branches = await gitService.getBranches(testRepoPath)
      const featureBranch = branches.find((b) => b.name === 'feature')

      expect(featureBranch).toBeDefined()
      expect(featureBranch?.isCurrent).toBe(true)
    })
  })

  describe('switchBranch', () => {
    it('should switch between branches', async () => {
      await gitService.init(testRepoPath)

      // Create initial commit
      await fs.writeFile(path.join(testRepoPath, 'test.txt'), 'test')
      await gitService.createCommit(testRepoPath, 'Initial commit')

      // Create and switch to feature branch
      await gitService.createBranch(testRepoPath, 'feature')

      // Switch back to main
      await gitService.switchBranch(testRepoPath, 'main')

      const branches = await gitService.getBranches(testRepoPath)
      const mainBranch = branches.find((b) => b.name === 'main')

      expect(mainBranch?.isCurrent).toBe(true)
    })
  })
})
