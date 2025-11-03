"use strict";
/**
 * Chronos v2.0 - Shared Constants
 *
 * 前后端共享的常量定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.ERROR_CODES = exports.SYSTEM_FILES = exports.MAX_LOG_DEPTH = exports.MAX_RECENT_REPOS = exports.DEFAULT_EMAIL = exports.DEFAULT_AUTHOR = exports.DEFAULT_BRANCH = exports.APP_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = 'Chronos';
exports.APP_VERSION = '2.0.0';
exports.DEFAULT_BRANCH = 'main';
exports.DEFAULT_AUTHOR = 'Chronos User';
exports.DEFAULT_EMAIL = 'user@chronos.local';
exports.MAX_RECENT_REPOS = 10;
exports.MAX_LOG_DEPTH = 100;
exports.SYSTEM_FILES = [
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini',
    '.git',
    'node_modules',
    '.vscode',
    '.idea',
];
exports.ERROR_CODES = {
    REPO_NOT_FOUND: 'REPO_NOT_FOUND',
    REPO_NOT_INITIALIZED: 'REPO_NOT_INITIALIZED',
    INVALID_PATH: 'INVALID_PATH',
    GIT_ERROR: 'GIT_ERROR',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    MERGE_CONFLICT: 'MERGE_CONFLICT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
exports.API_ENDPOINTS = {
    REPO_INIT: '/api/repository/init',
    REPO_OPEN: '/api/repository/open',
    REPO_STATUS: '/api/repository/status',
    REPO_FILES: '/api/repository/files',
    REPO_RECENT: '/api/repository/recent',
    REPO_DELETE: '/api/repository',
    SNAPSHOT_CREATE: '/api/repository/commit',
    SNAPSHOT_LIST: '/api/repository/log',
    SNAPSHOT_CHECKOUT: '/api/repository/checkout',
    BRANCH_LIST: '/api/repository/branches',
    BRANCH_CREATE: '/api/repository/branch',
    BRANCH_SWITCH: '/api/repository/switch',
    BRANCH_MERGE: '/api/repository/merge',
};
//# sourceMappingURL=index.js.map