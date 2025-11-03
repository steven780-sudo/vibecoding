"use strict";
/**
 * Chronos v2.0 - Database Service
 *
 * SQLite 数据库操作服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
/**
 * 数据库操作服务
 */
class DatabaseService {
    db;
    constructor(dbPath) {
        this.db = new better_sqlite3_1.default(dbPath);
        // 启用外键约束
        this.db.pragma('foreign_keys = ON');
        this.init();
    }
    /**
     * 初始化数据库
     */
    init() {
        // 创建仓库表
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        current_branch TEXT,
        last_opened DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 创建最近使用表
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS recent_repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id TEXT NOT NULL,
        opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id)
      )
    `);
        // 创建文件缓存表
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_hash TEXT,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id)
      )
    `);
        // 创建配置表
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 创建索引
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recent_repos 
      ON recent_repositories(opened_at DESC)
    `);
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_file_cache 
      ON file_cache(repository_id, file_path)
    `);
    }
    /**
     * 保存仓库
     */
    saveRepository(repo) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO repositories 
      (id, path, name, current_branch, last_opened)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(repo.id, repo.path, repo.name || path_1.default.basename(repo.path), repo.currentBranch || 'main', repo.lastOpened ? repo.lastOpened.toISOString() : new Date().toISOString());
    }
    /**
     * 获取仓库
     */
    getRepository(id) {
        const stmt = this.db.prepare(`
      SELECT * FROM repositories WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            path: row.path,
            name: row.name,
            currentBranch: row.current_branch,
            isClean: true,
            lastOpened: new Date(row.last_opened),
            createdAt: new Date(row.created_at),
        };
    }
    /**
     * 通过路径获取仓库
     */
    getRepositoryByPath(repoPath) {
        const stmt = this.db.prepare(`
      SELECT * FROM repositories WHERE path = ?
    `);
        const row = stmt.get(repoPath);
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            path: row.path,
            name: row.name,
            currentBranch: row.current_branch,
            isClean: true,
            lastOpened: new Date(row.last_opened),
            createdAt: new Date(row.created_at),
        };
    }
    /**
     * 获取最近使用的仓库
     */
    getRecentRepositories(limit = 10) {
        const stmt = this.db.prepare(`
      SELECT DISTINCT r.* FROM repositories r
      JOIN recent_repositories rr ON r.id = rr.repository_id
      ORDER BY rr.opened_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(limit);
        return rows.map((row) => ({
            id: row.id,
            path: row.path,
            name: row.name,
            currentBranch: row.current_branch,
            isClean: true,
            lastOpened: new Date(row.last_opened),
            createdAt: new Date(row.created_at),
        }));
    }
    /**
     * 记录仓库打开
     */
    recordRepositoryOpen(repositoryId) {
        const stmt = this.db.prepare(`
      INSERT INTO recent_repositories (repository_id)
      VALUES (?)
    `);
        stmt.run(repositoryId);
    }
    /**
     * 删除仓库（同时删除相关记录）
     */
    deleteRepository(id) {
        // 删除相关的最近使用记录
        const deleteRecent = this.db.prepare(`
      DELETE FROM recent_repositories WHERE repository_id = ?
    `);
        deleteRecent.run(id);
        // 删除仓库记录
        const deleteRepo = this.db.prepare(`
      DELETE FROM repositories WHERE id = ?
    `);
        deleteRepo.run(id);
    }
    /**
     * 获取配置
     */
    getSetting(key) {
        const stmt = this.db.prepare(`
      SELECT value FROM settings WHERE key = ?
    `);
        const row = stmt.get(key);
        return row ? row.value : null;
    }
    /**
     * 设置配置
     */
    setSetting(key, value) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
        stmt.run(key, value);
    }
    /**
     * 关闭数据库
     */
    close() {
        this.db.close();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database-service.js.map