# Chronos v2.0 - AI 协作指南

> 本文档为 AI 助手提供项目开发指导

---

## 🎯 项目目标

重写 Chronos v1.x，解决稳定性和性能问题，提供三种运行模式：
1. 本地 Web 应用（优先）
2. 云端 Web 应用
3. 桌面应用（Windows + macOS）

---

## 📚 核心文档

**必读文档**（按顺序）：
1. `CLAUDE.md` - 项目总文档
2. `.kiro/specs/chronos-v2/requirements.md` - 需求文档
3. `.kiro/specs/chronos-v2/design.md` - 设计文档
4. `.kiro/specs/chronos-v2/tasks.md` - 任务清单

---

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript 5 + Ant Design 5 + Zustand
- **后端**: Node.js + TypeScript + Express
- **Git**: 系统 Git CLI（本地）/ isomorphic-git（云端）
- **数据库**: SQLite (better-sqlite3)
- **桌面**: Electron + electron-builder

---

## 📋 开发规范

### 代码质量要求

1. **TypeScript 严格模式**：所有代码必须通过类型检查
2. **ESLint**：0 errors, 0 warnings
3. **Prettier**：统一代码格式
4. **测试覆盖率**：> 80%
5. **JSDoc**：所有公共 API 必须有注释

### 提交规范

使用 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档
- `test:` 测试
- `refactor:` 重构
- `chore:` 构建/工具

### 测试要求

**每个功能必须有测试**：
- 单元测试（70%）
- 集成测试（20%）
- E2E 测试（10%）

**测试工具**：
- Vitest（单元测试 + 集成测试）
- Playwright（E2E 测试）

---

## 🔄 开发流程

### 添加新功能

1. 更新需求文档（requirements.md）
2. 更新设计文档（design.md）
3. 更新任务清单（tasks.md）
4. 创建功能分支：`git checkout -b feature/xxx`
5. 开发功能并编写测试
6. 运行质量检查：`npm run commit-check`
7. 提交代码并推送

### 修复 Bug

1. 创建修复分支：`git checkout -b fix/xxx`
2. 编写回归测试
3. 修复 Bug
4. 确保测试通过
5. 提交并推送

---

## 🎨 架构原则

### 分层架构

```
Presentation Layer (UI)
    ↓
Application Layer (Business Logic)
    ↓
Domain Layer (Core Logic)
    ↓
Infrastructure Layer (Git, DB, FS)
```

### 设计原则

1. **单一职责**：每个模块只做一件事
2. **开闭原则**：对扩展开放，对修改关闭
3. **依赖倒置**：依赖抽象，不依赖具体实现
4. **接口隔离**：接口最小化

---

## ⚠️ 重要约定

### 错误处理

**所有异步操作必须有 try-catch**：
```typescript
try {
  await someAsyncOperation()
} catch (error) {
  logger.error('操作失败', error)
  throw new AppError('OPERATION_FAILED', '操作失败，请重试')
}
```

### 日志记录

**使用 logger，不使用 console.log**：
```typescript
import { logger } from '@/utils/logger'

logger.info('操作成功')
logger.error('操作失败', error)
logger.debug('调试信息', data)
```

### 类型定义

**所有函数必须有类型定义**：
```typescript
// ✅ 正确
function getUserData(userId: string): Promise<UserData> {
  // ...
}

// ❌ 错误
function getUserData(userId) {
  // ...
}
```

---

## 🧪 测试策略

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { GitService } from './git-service'

describe('GitService', () => {
  it('should create commit', async () => {
    const service = new GitService()
    const result = await service.createCommit('/path', 'test')
    expect(result.success).toBe(true)
  })
})
```

### 集成测试示例

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/server'

describe('API', () => {
  it('POST /api/repository/commit', async () => {
    const res = await request(app)
      .post('/api/repository/commit')
      .send({ path: '/test', message: 'test' })
    expect(res.status).toBe(200)
  })
})
```

---

## 🚀 Agent Hooks

### Hook 1: 保存时自动测试
- 触发：保存 `.ts` 或 `.tsx` 文件
- 动作：运行相关测试
- 配置：`.kiro/hooks/test-on-save.json`

### Hook 2: 提交前质量检查
- 触发：手动触发
- 动作：类型检查 → ESLint → 测试 → 提交
- 配置：`.kiro/hooks/commit-check.json`

### Hook 3: 版本发布
- 触发：手动触发
- 动作：测试 → 更新版本 → 构建 → 标签 → 推送
- 配置：`.kiro/hooks/release.json`

---

## 📝 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:client       # 仅前端
npm run dev:server       # 仅后端

# 测试
npm run test             # 运行所有测试
npm run test:watch       # 监听模式
npm run test:coverage    # 覆盖率报告

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 检查

# 构建
npm run build            # 构建所有
npm run build:client     # 构建前端
npm run build:server     # 构建后端
npm run build:electron   # 构建桌面应用
```

---

## 🎯 当前任务

查看任务清单：`.kiro/specs/chronos-v2/tasks.md`

---

**文档版本**: 1.0  
**最后更新**: 2025-11-02
