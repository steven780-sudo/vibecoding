"use strict";
/**
 * Chronos v2.0 - Error Handling
 *
 * 应用错误类和错误处理工具
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.AppError = void 0;
exports.isAppError = isAppError;
const constants_1 = require("@/shared/constants");
/**
 * 应用错误类
 */
class AppError extends Error {
    code;
    message;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.details = details;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * 创建错误实例的工厂函数
 */
exports.createError = {
    repoNotFound: (path) => new AppError(constants_1.ERROR_CODES.REPO_NOT_FOUND, '仓库不存在', { path }),
    repoNotInitialized: (path) => new AppError(constants_1.ERROR_CODES.REPO_NOT_INITIALIZED, '仓库未初始化', { path }),
    invalidPath: (path) => new AppError(constants_1.ERROR_CODES.INVALID_PATH, '无效的路径', { path }),
    gitError: (message, details) => new AppError(constants_1.ERROR_CODES.GIT_ERROR, `Git 操作失败: ${message}`, details),
    fileNotFound: (path) => new AppError(constants_1.ERROR_CODES.FILE_NOT_FOUND, '文件不存在', { path }),
    mergeConflict: (conflicts) => new AppError(constants_1.ERROR_CODES.MERGE_CONFLICT, '合并冲突', { conflicts }),
    unknown: (message, details) => new AppError(constants_1.ERROR_CODES.UNKNOWN_ERROR, message, details),
};
/**
 * 判断是否为 AppError
 */
function isAppError(error) {
    return error instanceof AppError;
}
//# sourceMappingURL=errors.js.map