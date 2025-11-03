"use strict";
/**
 * Chronos v2.0 - Server Entry Point
 *
 * 本地 Web 应用的服务器入口文件
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const database_service_1 = require("./services/database-service");
const repository_1 = __importStar(require("./routes/repository"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 初始化数据库
const dbPath = path_1.default.join(process.cwd(), 'database', 'chronos.db');
const dbService = new database_service_1.DatabaseService(dbPath);
(0, repository_1.initializeDatabase)(dbService);
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 请求日志
app.use((req, _res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`);
    next();
});
// 健康检查
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API 路由
app.use('/api/repository', repository_1.default);
// 错误处理中间件
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Unhandled error', err);
    res.status(500).json({
        success: false,
        error: '服务器错误',
    });
});
// 启动服务器
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Chronos Server running on http://localhost:${PORT}`);
});
// 优雅关闭
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, closing database...');
    dbService.close();
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, closing database...');
    dbService.close();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map