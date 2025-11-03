/**
 * Chronos v2.0 - Git Service
 * 
 * 使用 isomorphic-git 实现 Git 操作
 * 完全内置，无需用户安装 Git
 */

import git from 'isomorphic-git'
import fs from 'fs'
import path from 'path'
import type {
  RepositoryStatus,
  Snapshot,
  Branch,
  FileChange,
  FileStatus,
  MergeResult,
} from '@/shared/types'
import { DEFAULT_BRANCH, DEFAULT_AUTHOR, DEFAULT_EMAIL } from '@/shared/constants'

/**
 * Git 操作服务
 */
export class GitService {
  /**
   * 初始化仓库
   */
  async init(repoPath: string): Promise<void> {
    await git.init({
      fs,
      dir: repoPath,
      defaultBranch: DEFAULT_BRANCH,
    })

    // 创建默认 .gitignore
    await this.createDefaultGitignore(repoPath)

    // 配置用户信息
    await git.setConfig({
      fs,
      dir: repoPath,
      path: 'user.name',
      value: DEFAULT_AUTHOR,
    })

    await git.setConfig({
      fs,
      dir: repoPath,
      path: 'user.email',
      value: DEFAULT_EMAIL,
    })
  }

  /**
   * 检查是否已初始化
   */
  async isInitialized(repoPath: string): Promise<boolean> {
    try {
      const gitDir = path.join(repoPath, '.git')
      return fs.existsSync(gitDir)
    } catch {
      return false
    }
  }

  /**
   * 获取仓库状态
   */
  async getStatus(repoPath: string): Promise<RepositoryStatus> {
    const statusMatrix = await git.statusMatrix({
      fs,
      dir: repoPath,
    })

    const changes: FileChange[] = []

    for (const [filepath, headStatus, workdirStatus, stageStatus] of statusMatrix) {
      // 跳过未修改的文件
      if (headStatus === 1 && workdirStatus === 1 && stageStatus === 1) {
        continue
      }

      let fileStatus: FileStatus
      if (headStatus === 0) {
        fileStatus = 'added' as FileStatus
      } else if (workdirStatus === 0) {
        fileStatus = 'deleted' as FileStatus
      } else {
        fileStatus = 'modified' as FileStatus
      }

      changes.push({ path: filepath, status: fileStatus })
    }

    const currentBranch = await git.currentBranch({
      fs,
      dir: repoPath,
      fullname: false,
    })

    return {
      branch: currentBranch || DEFAULT_BRANCH,
      changes,
      isClean: changes.length === 0,
    }
  }

  /**
   * 创建快照（提交）
   */
  async createCommit(
    repoPath: string,
    message: string,
    files?: string[]
  ): Promise<string> {
    // 添加文件
    if (files && files.length > 0) {
      for (const file of files) {
        await git.add({ fs, dir: repoPath, filepath: file })
      }
    } else {
      // 添加所有变更文件
      const statusMatrix = await git.statusMatrix({ fs, dir: repoPath })
      for (const [filepath, headStatus, workdirStatus] of statusMatrix) {
        // 只添加有变更的文件
        if (headStatus !== workdirStatus || workdirStatus === 0) {
          if (workdirStatus !== 0) {
            await git.add({ fs, dir: repoPath, filepath })
          } else {
            await git.remove({ fs, dir: repoPath, filepath })
          }
        }
      }
    }

    // 创建提交
    const commitId = await git.commit({
      fs,
      dir: repoPath,
      message,
      author: {
        name: DEFAULT_AUTHOR,
        email: DEFAULT_EMAIL,
      },
    })

    return commitId
  }

  /**
   * 获取历史记录
   */
  async getLog(repoPath: string, limit?: number): Promise<Snapshot[]> {
    try {
      const commits = await git.log({
        fs,
        dir: repoPath,
        depth: limit,
      })

      return commits.map((commit) => ({
        id: commit.oid,
        shortId: commit.oid.substring(0, 7),
        message: commit.commit.message.trim(),
        author: commit.commit.author.name,
        email: commit.commit.author.email,
        timestamp: new Date(commit.commit.author.timestamp * 1000),
        parents: commit.commit.parent,
        isMerge: commit.commit.parent.length > 1,
        files: [], // 需要单独获取
      }))
    } catch (error) {
      // 如果没有提交，返回空数组
      return []
    }
  }

  /**
   * 回滚到指定快照
   */
  async checkout(repoPath: string, commitId: string): Promise<void> {
    await git.checkout({
      fs,
      dir: repoPath,
      ref: commitId,
      force: true,
    })
  }

  /**
   * 获取分支列表
   */
  async getBranches(repoPath: string): Promise<Branch[]> {
    const branches = await git.listBranches({
      fs,
      dir: repoPath,
    })

    const currentBranch = await git.currentBranch({
      fs,
      dir: repoPath,
      fullname: false,
    })

    const branchList: Branch[] = []

    for (const name of branches) {
      // 获取分支的最后一次提交
      try {
        const commits = await git.log({
          fs,
          dir: repoPath,
          ref: name,
          depth: 1,
        })

        const lastCommit = commits[0]

        branchList.push({
          name,
          isCurrent: name === currentBranch,
          lastCommit: lastCommit?.oid || '',
          lastCommitDate: lastCommit
            ? new Date(lastCommit.commit.author.timestamp * 1000)
            : new Date(),
        })
      } catch {
        // 如果分支没有提交，跳过
        continue
      }
    }

    return branchList
  }

  /**
   * 创建分支
   */
  async createBranch(repoPath: string, branchName: string): Promise<void> {
    await git.branch({
      fs,
      dir: repoPath,
      ref: branchName,
    })

    await git.checkout({
      fs,
      dir: repoPath,
      ref: branchName,
    })
  }

  /**
   * 切换分支
   */
  async switchBranch(repoPath: string, branchName: string): Promise<void> {
    await git.checkout({
      fs,
      dir: repoPath,
      ref: branchName,
    })
  }

  /**
   * 合并分支
   */
  async mergeBranch(
    repoPath: string,
    sourceBranch: string,
    targetBranch?: string
  ): Promise<MergeResult> {
    if (targetBranch) {
      await this.switchBranch(repoPath, targetBranch)
    }

    try {
      const currentBranch = await git.currentBranch({ fs, dir: repoPath, fullname: false })

      await git.merge({
        fs,
        dir: repoPath,
        ours: currentBranch || DEFAULT_BRANCH,
        theirs: sourceBranch,
        author: {
          name: DEFAULT_AUTHOR,
          email: DEFAULT_EMAIL,
        },
      })

      return { hasConflicts: false }
    } catch (error) {
      // 检查是否有冲突
      const conflicts = await this.getConflicts(repoPath)
      return { hasConflicts: true, conflicts }
    }
  }

  /**
   * 创建默认 .gitignore
   */
  private async createDefaultGitignore(repoPath: string): Promise<void> {
    const gitignoreContent = `
# System Files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependencies
node_modules/
`.trim()

    const gitignorePath = path.join(repoPath, '.gitignore')
    await fs.promises.writeFile(gitignorePath, gitignoreContent, 'utf-8')
  }

  /**
   * 获取冲突文件列表
   */
  private async getConflicts(repoPath: string): Promise<string[]> {
    const statusMatrix = await git.statusMatrix({ fs, dir: repoPath })
    const conflicts: string[] = []

    for (const [filepath, , , stageStatus] of statusMatrix) {
      // 检测冲突状态
      if (stageStatus === 2) {
        conflicts.push(filepath)
      }
    }

    return conflicts
  }
}
