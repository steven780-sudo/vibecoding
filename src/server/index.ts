/**
 * Chronos v2.0 - Server Entry Point
 * 
 * 本地 Web 应用的服务器入口文件
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { DatabaseService } from './services/database-service'
import repositoryRouter, { initializeDatabase } from './routes/repository'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env.PORT || 3000

// 初始化数据库
const dbPath = path.join(process.cwd(), 'database', 'chronos.db')
const dbService = new DatabaseService(dbPath)
initializeDatabase(dbService)

// 中间件
app.use(cors())
app.use(express.json())

// 请求日志
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
app.use('/api/repository', repositoryRouter)

// 错误处理中间件
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', err)
  res.status(500).json({
    success: false,
    error: '服务器错误',
  })
})

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 Chronos Server running on http://localhost:${PORT}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing database...')
  dbService.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing database...')
  dbService.close()
  process.exit(0)
})

export default app
