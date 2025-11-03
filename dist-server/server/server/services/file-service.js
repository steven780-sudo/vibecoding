"use strict";
/**
 * Chronos v2.0 - File Service
 *
 * 文件系统操作服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const chokidar_1 = require("chokidar");
const path_1 = __importDefault(require("path"));
const utils_1 = require("@/shared/utils");
/**
 * 文件操作服务
 */
class FileService {
    watcher = null;
    /**
     * 扫描目录
     */
    async scanDirectory(dirPath, basePath) {
        // 如果没有提供 basePath，使用 dirPath 作为基准路径
        const base = basePath || dirPath;
        const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
        const nodes = [];
        for (const entry of entries) {
            // 跳过系统文件
            if ((0, utils_1.isSystemFile)(entry.name)) {
                continue;
            }
            const fullPath = path_1.default.join(dirPath, entry.name);
            // 始终相对于 base 路径计算
            const relativePath = path_1.default.relative(base, fullPath);
            const node = {
                id: fullPath,
                name: entry.name,
                path: relativePath,
                type: entry.isDirectory() ? 'directory' : 'file',
            };
            if (entry.isDirectory()) {
                // 递归扫描时传递 base 路径
                node.children = await this.scanDirectory(fullPath, base);
                node.isExpanded = false;
            }
            nodes.push(node);
        }
        // 按名称排序：目录在前，文件在后
        return nodes.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
        });
    }
    /**
     * 监听目录变化
     */
    watchDirectory(dirPath, callback) {
        this.watcher = (0, chokidar_1.watch)(dirPath, {
            ignored: /(^|[/\\])\../, // 忽略隐藏文件
            persistent: true,
            ignoreInitial: true,
            depth: 10, // 限制递归深度
        });
        this.watcher
            .on('add', (filePath) => callback('add', filePath))
            .on('change', (filePath) => callback('change', filePath))
            .on('unlink', (filePath) => callback('unlink', filePath))
            .on('addDir', (filePath) => callback('addDir', filePath))
            .on('unlinkDir', (filePath) => callback('unlinkDir', filePath));
    }
    /**
     * 停止监听
     */
    async unwatchDirectory() {
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = null;
        }
    }
    /**
     * 检查路径是否存在
     */
    async exists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 检查是否为目录
     */
    async isDirectory(filePath) {
        try {
            const stats = await promises_1.default.stat(filePath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    /**
     * 获取文件信息
     */
    async getFileInfo(filePath) {
        const stats = await promises_1.default.stat(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
        };
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file-service.js.map