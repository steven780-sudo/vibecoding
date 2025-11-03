"use strict";
/**
 * Chronos v2.0 - Git Service
 *
 * 使用 isomorphic-git 实现 Git 操作
 * 完全内置，无需用户安装 Git
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("@/shared/constants");
/**
 * Git 操作服务
 */
class GitService {
    /**
     * 初始化仓库
     */
    async init(repoPath) {
        await isomorphic_git_1.default.init({
            fs: fs_1.default,
            dir: repoPath,
            defaultBranch: constants_1.DEFAULT_BRANCH,
        });
        // 创建默认 .gitignore
        await this.createDefaultGitignore(repoPath);
        // 配置用户信息
        await isomorphic_git_1.default.setConfig({
            fs: fs_1.default,
            dir: repoPath,
            path: 'user.name',
            value: constants_1.DEFAULT_AUTHOR,
        });
        await isomorphic_git_1.default.setConfig({
            fs: fs_1.default,
            dir: repoPath,
            path: 'user.email',
            value: constants_1.DEFAULT_EMAIL,
        });
    }
    /**
     * 检查是否已初始化
     */
    async isInitialized(repoPath) {
        try {
            const gitDir = path_1.default.join(repoPath, '.git');
            return fs_1.default.existsSync(gitDir);
        }
        catch {
            return false;
        }
    }
    /**
     * 获取仓库状态
     */
    async getStatus(repoPath) {
        const statusMatrix = await isomorphic_git_1.default.statusMatrix({
            fs: fs_1.default,
            dir: repoPath,
        });
        const changes = [];
        for (const [filepath, headStatus, workdirStatus, stageStatus] of statusMatrix) {
            // 跳过未修改的文件
            if (headStatus === 1 && workdirStatus === 1 && stageStatus === 1) {
                continue;
            }
            let fileStatus;
            if (headStatus === 0) {
                fileStatus = 'added';
            }
            else if (workdirStatus === 0) {
                fileStatus = 'deleted';
            }
            else {
                fileStatus = 'modified';
            }
            changes.push({ path: filepath, status: fileStatus });
        }
        const currentBranch = await isomorphic_git_1.default.currentBranch({
            fs: fs_1.default,
            dir: repoPath,
            fullname: false,
        });
        return {
            branch: currentBranch || constants_1.DEFAULT_BRANCH,
            changes,
            isClean: changes.length === 0,
        };
    }
    /**
     * 创建快照（提交）
     */
    async createCommit(repoPath, message, files) {
        // 添加文件
        if (files && files.length > 0) {
            for (const file of files) {
                await isomorphic_git_1.default.add({ fs: fs_1.default, dir: repoPath, filepath: file });
            }
        }
        else {
            // 添加所有变更文件
            const statusMatrix = await isomorphic_git_1.default.statusMatrix({ fs: fs_1.default, dir: repoPath });
            for (const [filepath, headStatus, workdirStatus] of statusMatrix) {
                // 只添加有变更的文件
                if (headStatus !== workdirStatus || workdirStatus === 0) {
                    if (workdirStatus !== 0) {
                        await isomorphic_git_1.default.add({ fs: fs_1.default, dir: repoPath, filepath });
                    }
                    else {
                        await isomorphic_git_1.default.remove({ fs: fs_1.default, dir: repoPath, filepath });
                    }
                }
            }
        }
        // 创建提交
        const commitId = await isomorphic_git_1.default.commit({
            fs: fs_1.default,
            dir: repoPath,
            message,
            author: {
                name: constants_1.DEFAULT_AUTHOR,
                email: constants_1.DEFAULT_EMAIL,
            },
        });
        return commitId;
    }
    /**
     * 获取历史记录
     */
    async getLog(repoPath, limit) {
        try {
            const commits = await isomorphic_git_1.default.log({
                fs: fs_1.default,
                dir: repoPath,
                depth: limit,
            });
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
            }));
        }
        catch (error) {
            // 如果没有提交，返回空数组
            return [];
        }
    }
    /**
     * 回滚到指定快照
     */
    async checkout(repoPath, commitId) {
        await isomorphic_git_1.default.checkout({
            fs: fs_1.default,
            dir: repoPath,
            ref: commitId,
            force: true,
        });
    }
    /**
     * 获取分支列表
     */
    async getBranches(repoPath) {
        const branches = await isomorphic_git_1.default.listBranches({
            fs: fs_1.default,
            dir: repoPath,
        });
        const currentBranch = await isomorphic_git_1.default.currentBranch({
            fs: fs_1.default,
            dir: repoPath,
            fullname: false,
        });
        const branchList = [];
        for (const name of branches) {
            // 获取分支的最后一次提交
            try {
                const commits = await isomorphic_git_1.default.log({
                    fs: fs_1.default,
                    dir: repoPath,
                    ref: name,
                    depth: 1,
                });
                const lastCommit = commits[0];
                branchList.push({
                    name,
                    isCurrent: name === currentBranch,
                    lastCommit: lastCommit?.oid || '',
                    lastCommitDate: lastCommit
                        ? new Date(lastCommit.commit.author.timestamp * 1000)
                        : new Date(),
                });
            }
            catch {
                // 如果分支没有提交，跳过
                continue;
            }
        }
        return branchList;
    }
    /**
     * 创建分支
     */
    async createBranch(repoPath, branchName) {
        await isomorphic_git_1.default.branch({
            fs: fs_1.default,
            dir: repoPath,
            ref: branchName,
        });
        await isomorphic_git_1.default.checkout({
            fs: fs_1.default,
            dir: repoPath,
            ref: branchName,
        });
    }
    /**
     * 切换分支
     */
    async switchBranch(repoPath, branchName) {
        await isomorphic_git_1.default.checkout({
            fs: fs_1.default,
            dir: repoPath,
            ref: branchName,
        });
    }
    /**
     * 合并分支
     */
    async mergeBranch(repoPath, sourceBranch, targetBranch) {
        if (targetBranch) {
            await this.switchBranch(repoPath, targetBranch);
        }
        try {
            const currentBranch = await isomorphic_git_1.default.currentBranch({ fs: fs_1.default, dir: repoPath, fullname: false });
            await isomorphic_git_1.default.merge({
                fs: fs_1.default,
                dir: repoPath,
                ours: currentBranch || constants_1.DEFAULT_BRANCH,
                theirs: sourceBranch,
                author: {
                    name: constants_1.DEFAULT_AUTHOR,
                    email: constants_1.DEFAULT_EMAIL,
                },
            });
            return { hasConflicts: false };
        }
        catch (error) {
            // 检查是否有冲突
            const conflicts = await this.getConflicts(repoPath);
            return { hasConflicts: true, conflicts };
        }
    }
    /**
     * 创建默认 .gitignore
     */
    async createDefaultGitignore(repoPath) {
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
`.trim();
        const gitignorePath = path_1.default.join(repoPath, '.gitignore');
        await fs_1.default.promises.writeFile(gitignorePath, gitignoreContent, 'utf-8');
    }
    /**
     * 获取冲突文件列表
     */
    async getConflicts(repoPath) {
        const statusMatrix = await isomorphic_git_1.default.statusMatrix({ fs: fs_1.default, dir: repoPath });
        const conflicts = [];
        for (const [filepath, , , stageStatus] of statusMatrix) {
            // 检测冲突状态
            if (stageStatus === 2) {
                conflicts.push(filepath);
            }
        }
        return conflicts;
    }
}
exports.GitService = GitService;
//# sourceMappingURL=git-service.js.map