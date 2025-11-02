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

## 🔧 MCP 工具

项目已配置以下 MCP 工具来提升开发效率：

### 1. Context7 MCP
**用途**: 搜索最新开发文档

**何时使用**:
- 不确定 API 用法时
- 需要查看最新文档时
- 寻找最佳实践时

**示例请求**:
- "React 18 的 Suspense 怎么用？"
- "Zustand 的最新 API 文档"
- "TypeScript 5.3 的新特性"

### 2. Chrome DevTools MCP
**用途**: Chrome 官方浏览器调试（推荐）

**何时使用**:
- 调试前端问题时
- 查看 Console 错误时
- 监控 API 请求时
- 分析性能问题时

**示例请求**:
- "查看 Chrome Console 的错误信息"
- "监控这个页面的网络请求"
- "分析页面加载性能"

**优势**: 自动捕获 Console 信息，实时调试

### 3. Playwright MCP
**用途**: 跨浏览器自动化测试

**何时使用**:
- 编写 E2E 测试时
- 测试跨浏览器兼容性时
- 自动化回归测试时

**示例请求**:
- "使用 Playwright 测试登录流程"
- "在 Firefox 和 Safari 上测试这个功能"
- "自动化测试表单提交"

### 4. Memory MCP
**用途**: 持久化记忆系统

**何时使用**:
- 需要记录重要决策时
- 存储项目知识时
- 建立模块关系时

**示例请求**:
- "记住我们选择 Zustand 的原因"
- "记录这个 Bug 的解决方案"
- "建立 GitService 和 FileService 的依赖关系"

### 5. Sequential Thinking MCP
**用途**: 复杂问题的系统性思考

**何时使用**:
- 解决复杂架构问题时
- 调试难以定位的 Bug 时
- 需要详细推理过程时

**示例请求**:
- "用系统性思维分析这个性能问题"
- "逐步推导最佳的状态管理方案"
- "分析为什么这个测试失败"

### 6. Filesystem MCP
**用途**: 增强文件操作

**何时使用**:
- 需要批量处理文件时
- 分析项目结构时
- 搜索特定文件时

---

## 📝 文档管理规范

### 创建新文档前的检查清单

1. **检查现有文档**
   - 查看 `docs/` 目录下是否有相关文档
   - 确认新内容是否可以添加到现有文档中

2. **避免重复**
   - 不要创建内容重复的文档
   - 相同主题的内容应合并到一个文档中

3. **文档分类**
   - 技术文档：CONFIG_GUIDE.md、DEPENDENCIES.md
   - 项目文档：PROJECT_STATUS.md、REWRITE_SUMMARY.md
   - 总文档：CLAUDE.md（项目总览）

4. **更新而非新建**
   - 优先在现有文档上补充内容
   - 保持文档结构清晰
   - 及时删除过时或重复的文档

### 文档命名规范

- 使用大写字母和下划线：`PROJECT_STATUS.md`
- 名称要清晰表达文档内容
- 避免模糊的名称如 `NOTES.md`、`TEMP.md`

### 文档位置规范

- 所有项目文档放在 `docs/` 目录
- 根目录只保留 `CLAUDE.md`（项目总文档）和 `README.md`（项目说明）
- 配置说明放在 `docs/CONFIG_GUIDE.md`

---

**文档版本**: 1.1  
**最后更新**: 2025-11-02
