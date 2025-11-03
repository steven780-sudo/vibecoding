"use strict";
/**
 * Chronos v2.0 - Repository Routes
 *
 * 仓库相关的 API 路由
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const express_1 = require("express");
const git_service_1 = require("../services/git-service");
const file_service_1 = require("../services/file-service");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const utils_1 = require("@/shared/utils");
const constants_1 = require("@/shared/constants");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const gitService = new git_service_1.GitService();
const fileService = new file_service_1.FileService();
// 数据库服务（需要在应用启动时初始化）
let dbService;
function initializeDatabase(db) {
    dbService = db;
}
/**
 * POST /api/repository/init
 * 初始化仓库
 */
router.post('/init', async (req, res) => {
    try {
        const { path: repoPath } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        // 检查路径是否存在
        const exists = await fileService.exists(repoPath);
        if (!exists) {
            throw errors_1.createError.repoNotFound(repoPath);
        }
        // 检查是否为目录
        const isDir = await fileService.isDirectory(repoPath);
        if (!isDir) {
            throw errors_1.createError.invalidPath('路径必须是文件夹');
        }
        // 初始化 Git 仓库
        await gitService.init(repoPath);
        // 保存到数据库
        const repoId = (0, utils_1.generateId)();
        dbService.saveRepository({
            id: repoId,
            path: repoPath,
            name: path_1.default.basename(repoPath),
            currentBranch: 'main',
            lastOpened: new Date(),
        });
        dbService.recordRepositoryOpen(repoId);
        logger_1.logger.info('Repository initialized', { path: repoPath });
        const response = {
            success: true,
            data: {
                id: repoId,
                path: repoPath,
                name: path_1.default.basename(repoPath),
            },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize repository', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/open
 * 打开仓库
 */
router.post('/open', async (req, res) => {
    try {
        const { path: repoPath } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        // 检查路径是否存在
        const exists = await fileService.exists(repoPath);
        if (!exists) {
            throw errors_1.createError.repoNotFound(repoPath);
        }
        // 检查是否已初始化
        const isInit = await gitService.isInitialized(repoPath);
        if (!isInit) {
            throw errors_1.createError.repoNotInitialized(repoPath);
        }
        // 从数据库获取或创建仓库记录
        let repo = dbService.getRepositoryByPath(repoPath);
        if (!repo) {
            const repoId = (0, utils_1.generateId)();
            dbService.saveRepository({
                id: repoId,
                path: repoPath,
                name: path_1.default.basename(repoPath),
                currentBranch: 'main',
                lastOpened: new Date(),
            });
            repo = dbService.getRepository(repoId);
        }
        else {
            // 更新最后打开时间
            dbService.saveRepository({
                ...repo,
                lastOpened: new Date(),
            });
        }
        if (repo) {
            dbService.recordRepositoryOpen(repo.id);
        }
        logger_1.logger.info('Repository opened', { path: repoPath });
        const response = {
            success: true,
            data: repo,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to open repository', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * GET /api/repository/status
 * 获取仓库状态
 */
router.get('/status', async (req, res) => {
    try {
        const { path: repoPath } = req.query;
        if (!repoPath || typeof repoPath !== 'string') {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        // 检查路径是否存在
        const exists = await fileService.exists(repoPath);
        if (!exists) {
            throw errors_1.createError.repoNotFound(repoPath);
        }
        const status = await gitService.getStatus(repoPath);
        const response = {
            success: true,
            data: status,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to get repository status', error);
        if ((0, errors_1.isAppError)(error)) {
            // 根据错误码返回不同的HTTP状态码
            const statusCode = error.code === constants_1.ERROR_CODES.REPO_NOT_FOUND ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * 递归地将状态信息添加到文件树中
 */
function addStatusToFileTree(files, statusMap) {
    return files.map(file => {
        const fileWithStatus = {
            ...file,
            status: statusMap.get(file.path)
        };
        if (file.children && file.children.length > 0) {
            fileWithStatus.children = addStatusToFileTree(file.children, statusMap);
        }
        return fileWithStatus;
    });
}
/**
 * GET /api/repository/files
 * 获取文件列表（包含状态信息）
 */
router.get('/files', async (req, res) => {
    try {
        const { path: repoPath } = req.query;
        if (!repoPath || typeof repoPath !== 'string') {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        // 获取文件列表和状态
        const [files, status] = await Promise.all([
            fileService.scanDirectory(repoPath),
            gitService.getStatus(repoPath)
        ]);
        // 创建状态映射表
        const statusMap = new Map(status.changes.map(change => [change.path, change.status]));
        // 递归地将状态信息合并到文件树中
        const filesWithStatus = addStatusToFileTree(files, statusMap);
        const response = {
            success: true,
            data: { files: filesWithStatus },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to get files', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/commit
 * 创建快照
 */
router.post('/commit', async (req, res) => {
    try {
        const { path: repoPath, message, files } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        if (!message) {
            throw errors_1.createError.gitError('提交信息不能为空');
        }
        const commitId = await gitService.createCommit(repoPath, message, files);
        logger_1.logger.info('Commit created', { path: repoPath, commitId });
        const response = {
            success: true,
            data: { commitId },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to create commit', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * GET /api/repository/log
 * 获取历史记录
 */
router.get('/log', async (req, res) => {
    try {
        const { path: repoPath, limit } = req.query;
        if (!repoPath || typeof repoPath !== 'string') {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        const logs = await gitService.getLog(repoPath, limitNum);
        const response = {
            success: true,
            data: { logs },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to get log', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/checkout
 * 回滚到指定快照
 */
router.post('/checkout', async (req, res) => {
    try {
        const { path: repoPath, commitId } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        if (!commitId) {
            throw errors_1.createError.gitError('提交 ID 不能为空');
        }
        await gitService.checkout(repoPath, commitId);
        logger_1.logger.info('Checked out commit', { path: repoPath, commitId });
        const response = {
            success: true,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to checkout', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * GET /api/repository/branches
 * 获取分支列表
 */
router.get('/branches', async (req, res) => {
    try {
        const { path: repoPath } = req.query;
        if (!repoPath || typeof repoPath !== 'string') {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        const branches = await gitService.getBranches(repoPath);
        const response = {
            success: true,
            data: { branches },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to get branches', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/branch
 * 创建分支
 */
router.post('/branch', async (req, res) => {
    try {
        const { path: repoPath, branchName } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        if (!branchName) {
            throw errors_1.createError.gitError('分支名称不能为空');
        }
        await gitService.createBranch(repoPath, branchName);
        logger_1.logger.info('Branch created', { path: repoPath, branchName });
        const response = {
            success: true,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to create branch', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/switch
 * 切换分支
 */
router.post('/switch', async (req, res) => {
    try {
        const { path: repoPath, branchName } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        if (!branchName) {
            throw errors_1.createError.gitError('分支名称不能为空');
        }
        await gitService.switchBranch(repoPath, branchName);
        logger_1.logger.info('Switched branch', { path: repoPath, branchName });
        const response = {
            success: true,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to switch branch', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/merge
 * 合并分支
 */
router.post('/merge', async (req, res) => {
    try {
        const { path: repoPath, sourceBranch, targetBranch } = req.body;
        if (!repoPath) {
            throw errors_1.createError.invalidPath('路径不能为空');
        }
        if (!sourceBranch) {
            throw errors_1.createError.gitError('源分支不能为空');
        }
        const result = await gitService.mergeBranch(repoPath, sourceBranch, targetBranch);
        logger_1.logger.info('Merged branch', { path: repoPath, sourceBranch, targetBranch });
        const response = {
            success: true,
            data: result,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to merge branch', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * GET /api/repository/recent
 * 获取最近使用的仓库列表
 */
router.get('/recent', async (req, res) => {
    try {
        const { limit } = req.query;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const repositories = dbService.getRecentRepositories(limitNum);
        // 验证路径是否仍然存在
        const validRepositories = [];
        for (const repo of repositories) {
            const exists = await fileService.exists(repo.path);
            if (exists) {
                validRepositories.push(repo);
            }
        }
        logger_1.logger.info('Retrieved recent repositories', { count: validRepositories.length });
        const response = {
            success: true,
            data: { repositories: validRepositories },
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to get recent repositories', error);
        res.status(500).json({
            success: false,
            error: '服务器错误',
        });
    }
});
/**
 * DELETE /api/repository/:id
 * 删除仓库记录（软删除 - 不删除实际文件）
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw errors_1.createError.invalidPath('仓库 ID 不能为空');
        }
        dbService.deleteRepository(id);
        logger_1.logger.info('Repository record deleted (soft delete)', { id });
        const response = {
            success: true,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to delete repository', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
/**
 * POST /api/repository/destroy
 * 完全移除时光机管理（硬删除 - 删除 .git 文件夹）
 */
router.post('/destroy', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            throw errors_1.createError.invalidPath('仓库 ID 不能为空');
        }
        // 获取仓库信息
        const repo = dbService.getRepository(id);
        if (!repo) {
            throw errors_1.createError.repoNotFound('仓库不存在');
        }
        // 先删除 .gitignore 文件（在删除 .git 之前）
        const gitignorePath = path_1.default.join(repo.path, '.gitignore');
        const gitignoreExists = await fileService.exists(gitignorePath);
        if (gitignoreExists) {
            await Promise.resolve().then(() => __importStar(require('fs/promises'))).then(fs => fs.unlink(gitignorePath));
            logger_1.logger.info('Removed .gitignore file', { path: gitignorePath });
        }
        // 再删除 .git 文件夹
        const gitPath = path_1.default.join(repo.path, '.git');
        const gitExists = await fileService.exists(gitPath);
        if (gitExists) {
            await Promise.resolve().then(() => __importStar(require('fs/promises'))).then(fs => fs.rm(gitPath, { recursive: true, force: true }));
            logger_1.logger.info('Removed .git directory', { path: gitPath });
        }
        // 删除数据库记录
        dbService.deleteRepository(id);
        logger_1.logger.info('Repository completely destroyed (hard delete)', { id, path: repo.path });
        const response = {
            success: true,
        };
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Failed to destroy repository', error);
        if ((0, errors_1.isAppError)(error)) {
            res.status(400).json({
                success: false,
                error: error.message,
                code: error.code,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '服务器错误',
            });
        }
    }
});
exports.default = router;
//# sourceMappingURL=repository.js.map