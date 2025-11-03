/**
 * Chronos v2.0 - Electron Main Process
 * 
 * Electron 主进程
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'

let mainWindow: BrowserWindow | null = null
let serverProcess: ChildProcess | null = null

const isDev = process.env.NODE_ENV === 'development'
const SERVER_PORT = 3000

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    title: 'Chronos v2.0 - 文件时光机',
    show: false
  })

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 启动后端服务器
 */
function startServer() {
  if (isDev) {
    // 开发模式下不启动服务器（假设已经手动启动）
    return
  }

  const serverPath = path.join(app.getAppPath(), 'dist-server/index.js')
  
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: SERVER_PORT.toString(),
      NODE_ENV: 'production'
    }
  })

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[Server] ${data}`)
  })

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Server Error] ${data}`)
  })

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`)
  })
}

/**
 * 停止后端服务器
 */
function stopServer() {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
}

/**
 * IPC 处理器：选择文件夹
 */
ipcMain.handle('dialog:selectDirectory', async () => {
  if (!mainWindow) {
    return null
  }

  const result: any = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0] || null
})

/**
 * IPC 处理器：选择文件
 */
ipcMain.handle('dialog:selectFile', async () => {
  if (!mainWindow) {
    return null
  }

  const result: any = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0] || null
})

/**
 * IPC 处理器：显示消息框
 */
ipcMain.handle('dialog:showMessage', async (_event, options) => {
  if (!mainWindow) {
    return
  }

  await dialog.showMessageBox(mainWindow, options)
})

/**
 * 应用准备就绪
 */
app.whenReady().then(() => {
  startServer()
  
  // 等待服务器启动
  setTimeout(() => {
    createWindow()
  }, isDev ? 0 : 2000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  stopServer()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 应用退出前
 */
app.on('before-quit', () => {
  stopServer()
})
