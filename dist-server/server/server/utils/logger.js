"use strict";
/**
 * Chronos v2.0 - Logger
 *
 * 日志工具
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    level = 'info';
    setLevel(level) {
        this.level = level;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message, data));
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, data));
        }
    }
    error(message, error) {
        if (this.shouldLog('error')) {
            const errorData = error instanceof Error ? {
                message: error.message,
                stack: error.stack,
            } : error;
            console.error(this.formatMessage('error', message, errorData));
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map