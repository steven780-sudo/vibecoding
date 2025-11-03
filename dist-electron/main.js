"use strict";
/**
 * Chronos v2.0 - Electron Main Process
 *
 * Electron 主进程
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = require("path");
var child_process_1 = require("child_process");
var mainWindow = null;
var serverProcess = null;
var isDev = process.env.NODE_ENV === 'development';
var SERVER_PORT = 3000;
/**
 * 创建主窗口
 */
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        title: 'Chronos v2.0 - 文件时光机',
        show: false
    });
    // 窗口准备好后显示
    mainWindow.once('ready-to-show', function () {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
    // 加载应用
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadURL("http://localhost:".concat(SERVER_PORT));
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
/**
 * 启动后端服务器
 */
function startServer() {
    var _a, _b;
    if (isDev) {
        // 开发模式下不启动服务器（假设已经手动启动）
        return;
    }
    var serverPath = path_1.default.join(electron_1.app.getAppPath(), 'dist-server/index.js');
    serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
        env: __assign(__assign({}, process.env), { PORT: SERVER_PORT.toString(), NODE_ENV: 'production' })
    });
    (_a = serverProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
        console.log("[Server] ".concat(data));
    });
    (_b = serverProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
        console.error("[Server Error] ".concat(data));
    });
    serverProcess.on('close', function (code) {
        console.log("Server process exited with code ".concat(code));
    });
}
/**
 * 停止后端服务器
 */
function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}
/**
 * IPC 处理器：选择文件夹
 */
electron_1.ipcMain.handle('dialog:selectDirectory', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mainWindow) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, electron_1.dialog.showOpenDialog(mainWindow, {
                        properties: ['openDirectory', 'createDirectory']
                    })];
            case 1:
                result = _a.sent();
                if (result.canceled || result.filePaths.length === 0) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, result.filePaths[0] || null];
        }
    });
}); });
/**
 * IPC 处理器：选择文件
 */
electron_1.ipcMain.handle('dialog:selectFile', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mainWindow) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, electron_1.dialog.showOpenDialog(mainWindow, {
                        properties: ['openFile']
                    })];
            case 1:
                result = _a.sent();
                if (result.canceled || result.filePaths.length === 0) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, result.filePaths[0] || null];
        }
    });
}); });
/**
 * IPC 处理器：显示消息框
 */
electron_1.ipcMain.handle('dialog:showMessage', function (_event, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!mainWindow) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, electron_1.dialog.showMessageBox(mainWindow, options)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * 应用准备就绪
 */
electron_1.app.whenReady().then(function () {
    startServer();
    // 等待服务器启动
    setTimeout(function () {
        createWindow();
    }, isDev ? 0 : 2000);
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
/**
 * 所有窗口关闭
 */
electron_1.app.on('window-all-closed', function () {
    stopServer();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
/**
 * 应用退出前
 */
electron_1.app.on('before-quit', function () {
    stopServer();
});
