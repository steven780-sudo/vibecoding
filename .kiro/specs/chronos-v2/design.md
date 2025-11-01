# Chronos v2.0 - 设计文档

**项目名称**: Chronos - 本地文件时光机 v2.0  
**创建日期**: 2025-11-02  
**状态**: 设计阶段  
**版本**: 1.0

---

## 📋 设计概述

本文档描述 Chronos v2.0 的详细技术设计，包括架构、数据模型、API 设计、组件设计等。

### 设计目标

1. **稳定性优先**: 使用成熟稳定的技术栈
2. **高性能**: 支持 10,000+ 文件流畅操作
3. **高质量**: 清晰的架构，完善的测试
4. **可扩展**: 易于添加新功能
5. **跨平台**: Windows + macOS

---

## 🏗️ 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Chronos v2.0                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  模式 1: 本地 Web 应用                             │ │
│  │  ┌──────────┐         ┌──────────────────┐        │ │
│  │  │ Browser  │  HTTP   │  Node.js Server  │        │ │
│  │  │ (React)  │◄───────►│  (Express)       │        │ │
│  │  └──────────┘         └──────────────────┘        │ │
│  │                              │                      │ │
│  │                              ▼                      │ │
│  │                        ┌──────────┐                │ │
│  │                        │ Git CLI  │                │ │
│  │                        │ SQLite   │                │ │
│  │                        └──────────┘                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  模式 2: 云端 Web 应用                             │ │
│  │  ┌──────────────────────────────────────┐          │ │
│  │  │  Browser (React)                     │          │ │
│  │  │  - isomorphic-git (WASM)            │          │ │
│  │  │  - IndexedDB                        │          │ │
│  │  │  - File System Access API           │          │ │
│  │  └──────────────────────────────────────┘          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  模式 3: 桌面应用                                  │ │
│  │  ┌──────────────────────────────────────┐          │ │
│  │  │  Electron                            │          │ │
│  │  │  ┌──────────┐    ┌────────────────┐ │          │ │
│  │  │  │ Renderer │    │  Main Process  │ │          │ │
│  │  │  │ (React)  │◄──►│  (Node.js)     │ │          │ │
│  │  │  └──────────┘IPC └────────────────┘ │          │ │
│  │  │                        │             │          │ │
│  │  │                        ▼             │          │ │
│  │  │                  ┌──────────┐        │          │ │
│  │  │                  │ Git CLI  │        │          │ │
│  │  │                  │ SQLite   │        │          │ │
│  │  │                  └──────────┘        │          │ │
│  │  └──────────────────────────────────────┘          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 分层架构

```
┌─────────────────────────────────────────┐
│  Presentation Layer (表现层)            │
│  - React Components                     │
│  - Ant Design UI                        │
│  - 用户交互                              │
├─────────────────────────────────────────┤
│  Application Layer (应用层)             │
│  - Services (业务服务)                   │
│  - Stores (状态管理)                     │
│  - Hooks (自定义 Hooks)                 │
├─────────────────────────────────────────┤
│  Domain Layer (领域层)                  │
│  - Entities (实体)                      │
│  - Use Cases (用例)                     │
│  - Business Rules (业务规则)            │
├─────────────────────────────────────────┤
│  Infrastructure Layer (基础设施层)       │
│  - Git Wrapper (Git 封装)              │
│  - File System (文件系统)               │
│  - Database (数据库)                    │
│  - Cache (缓存)                         │
└─────────────────────────────────────────┘
```

---

## 📊 数据模型

### 核心实体

#### Repository (仓库)

```typescript
interface Repository {
  id: string                    // 仓库 ID
  path: string                  // 仓库路径
  name: string                  // 仓库名称
  currentBranch: string         // 当前分支
  isClean: boolean             // 是否干净（无变更）
  lastOpened: Date             // 最后打开时间
  createdAt: Date              // 创建时间
}
```

#### Snapshot (快照)

```typescript
interface Snapshot {
  id: string                    // 快照 ID (commit hash)
  shortId: string              // 短 ID (前 7 位)
  message: string              // 快照描述
  author: string               // 作者
  email: string                // 邮箱
  timestamp: Date              // 时间戳
  parents: string[]            // 父快照 ID
  isMerge: boolean             // 是否为合并快照
  files: FileChange[]          // 文件变更列表
}
```

#### FileChange (文件变更)

```typescript
interface FileChange {
  path: string                  // 文件路径
  status: FileStatus           // 文件状态
  oldPath?: string             // 旧路径（重命名时）
}

enum FileStatus {
  Added = 'added',             // 新增
  Modified = 'modified',       // 修改
  Deleted = 'deleted',         // 删除
  Renamed = 'renamed',         // 重命名
  Copied = 'copied'            // 复制
}
```

#### Branch (分支)

```typescript
interface Branch {
  name: string                  // 分支名称
  isCurrent: boolean           // 是否为当前分支
  lastCommit: string           // 最后一次提交 ID
  lastCommitDate: Date         // 最后提交时间
}
```

#### FileNode (文件树节点)

```typescript
interface FileNode {
  id: string                    // 节点 ID
  name: string                  // 文件/文件夹名称
  path: string                  // 完整路径
  type: 'file' | 'directory'   // 类型
  status?: FileStatus          // 文件状态
  children?: FileNode[]        // 子节点
  isExpanded?: boolean         // 是否展开
  isSelected?: boolean         // 是否选中
}
```

### 数据库设计 (SQLite)

```sql
-- 仓库表
CREATE TABLE repositories (
  id TEXT PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  current_branch TEXT,
  last_opened DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 最近使用表
CREATE TABLE recent_repositories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

-- 文件缓存表
CREATE TABLE file_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

-- 配置表
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_recent_repos ON recent_repositories(opened_at DESC);
CREATE INDEX idx_file_cache ON file_cache(repository_id, file_path);
```

---


## 🔌 API 设计

### REST API (本地模式)

#### 仓库操作

```typescript
// 初始化仓库
POST /api/repository/init
Request: { path: string }
Response: { success: boolean, data: Repository }

// 打开仓库
POST /api/repository/open
Request: { path: string }
Response: { success: boolean, data: Repository }

// 获取仓库状态
GET /api/repository/status?path={path}
Response: { 
  success: boolean, 
  data: {
    branch: string,
    changes: FileChange[],
    isClean: boolean
  }
}

// 获取文件列表
GET /api/repository/files?path={path}
Response: { success: boolean, data: { files: string[] } }
```

#### 快照操作

```typescript
// 创建快照
POST /api/repository/commit
Request: { 
  path: string, 
  message: string, 
  files?: string[] 
}
Response: { success: boolean, data: { commitId: string } }

// 获取历史记录
GET /api/repository/log?path={path}&limit={limit}
Response: { success: boolean, data: { logs: Snapshot[] } }

// 回滚到指定快照
POST /api/repository/checkout
Request: { path: string, commitId: string }
Response: { success: boolean }
```

#### 分支操作

```typescript
// 获取分支列表
GET /api/repository/branches?path={path}
Response: { 
  success: boolean, 
  data: { 
    branches: Branch[], 
    current: string 
  } 
}

// 创建分支
POST /api/repository/branch
Request: { path: string, branchName: string }
Response: { success: boolean }

// 切换分支
POST /api/repository/switch
Request: { path: string, branchName: string }
Response: { success: boolean }

// 合并分支
POST /api/repository/merge
Request: { 
  path: string, 
  sourceBranch: string, 
  targetBranch?: string 
}
Response: { 
  success: boolean, 
  data: { 
    hasConflicts: boolean, 
    conflicts?: string[] 
  } 
}
```

### IPC API (桌面模式)

```typescript
// Electron IPC 通道
const IPC_CHANNELS = {
  // 仓库操作
  REPO_INIT: 'repo:init',
  REPO_OPEN: 'repo:open',
  REPO_STATUS: 'repo:status',
  REPO_FILES: 'repo:files',
  
  // 快照操作
  SNAPSHOT_CREATE: 'snapshot:create',
  SNAPSHOT_LIST: 'snapshot:list',
  SNAPSHOT_CHECKOUT: 'snapshot:checkout',
  
  // 分支操作
  BRANCH_LIST: 'branch:list',
  BRANCH_CREATE: 'branch:create',
  BRANCH_SWITCH: 'branch:switch',
  BRANCH_MERGE: 'branch:merge',
  
  // 文件操作
  FILE_SELECT: 'file:select',
  FILE_WATCH: 'file:watch',
}
```

---

## 🎨 组件设计

### 前端组件树

```
App
├── HomePage
│   ├── RecentRepositories
│   └── OpenRepositoryButton
│
└── RepositoryPage
    ├── Header
    │   ├── BackButton
    │   ├── RefreshButton
    │   ├── CreateSnapshotButton
    │   └── HelpButton
    │
    ├── LeftPanel (40%)
    │   ├── RepositoryStatus
    │   │   ├── CurrentBranch
    │   │   ├── RepositoryPath
    │   │   └── PendingChanges
    │   │
    │   ├── FileTree
    │   │   └── TreeNode (递归)
    │   │       ├── FileIcon
    │   │       ├── FileName
    │   │       ├── FileStatus
    │   │       └── Checkbox
    │   │
    │   └── BranchManager
    │       ├── BranchList
    │       ├── CreateBranchButton
    │       ├── SwitchBranchButton
    │       └── MergeBranchButton
    │
    └── RightPanel (60%)
        └── HistoryViewer
            └── SnapshotList (虚拟滚动)
                └── SnapshotItem
                    ├── SnapshotInfo
                    ├── SnapshotFiles
                    └── CheckoutButton
```

### 核心组件设计

#### FileTree 组件

```typescript
interface FileTreeProps {
  files: FileNode[]
  selectedFiles: Set<string>
  onSelect: (files: Set<string>) => void
  onExpand: (nodeId: string) => void
}

// 使用 react-window 实现虚拟滚动
const FileTree: React.FC<FileTreeProps> = ({ files, selectedFiles, onSelect, onExpand }) => {
  const flattenedNodes = useMemo(() => flattenTree(files), [files])
  
  return (
    <FixedSizeList
      height={600}
      itemCount={flattenedNodes.length}
      itemSize={32}
      width="100%"
    >
      {({ index, style }) => (
        <TreeNode
          node={flattenedNodes[index]}
          style={style}
          isSelected={selectedFiles.has(flattenedNodes[index].path)}
          onSelect={onSelect}
          onExpand={onExpand}
        />
      )}
    </FixedSizeList>
  )
}
```

#### HistoryViewer 组件

```typescript
interface HistoryViewerProps {
  snapshots: Snapshot[]
  onCheckout: (snapshotId: string) => void
  loading: boolean
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ snapshots, onCheckout, loading }) => {
  return (
    <div className="history-viewer">
      <Timeline>
        {snapshots.map(snapshot => (
          <Timeline.Item key={snapshot.id}>
            <SnapshotCard
              snapshot={snapshot}
              onCheckout={onCheckout}
            />
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  )
}
```

---

## 🔧 服务设计

### GitService (Git 操作服务)

```typescript
class GitService {
  /**
   * 初始化仓库
   */
  async init(path: string): Promise<void> {
    await exec('git init', { cwd: path })
    await this.createDefaultGitignore(path)
  }
  
  /**
   * 获取仓库状态
   */
  async getStatus(path: string): Promise<RepositoryStatus> {
    const output = await exec('git status --porcelain -uall', { cwd: path })
    return this.parseStatus(output)
  }
  
  /**
   * 创建快照
   */
  async createCommit(
    path: string, 
    message: string, 
    files?: string[]
  ): Promise<string> {
    if (files && files.length > 0) {
      await exec(`git add ${files.join(' ')}`, { cwd: path })
    } else {
      await exec('git add .', { cwd: path })
    }
    
    await exec(`git commit -m "${message}"`, { cwd: path })
    const commitId = await exec('git rev-parse HEAD', { cwd: path })
    return commitId.trim()
  }
  
  /**
   * 获取历史记录
   */
  async getLog(path: string, limit?: number): Promise<Snapshot[]> {
    const format = '--pretty=format:%H|%h|%an|%ae|%at|%s|%P'
    const limitStr = limit ? `-n ${limit}` : ''
    const output = await exec(`git log ${format} ${limitStr}`, { cwd: path })
    return this.parseLog(output)
  }
  
  /**
   * 回滚到指定快照
   */
  async checkout(path: string, commitId: string): Promise<void> {
    await exec(`git checkout ${commitId}`, { cwd: path })
  }
  
  /**
   * 获取分支列表
   */
  async getBranches(path: string): Promise<Branch[]> {
    const output = await exec('git branch -v', { cwd: path })
    return this.parseBranches(output)
  }
  
  /**
   * 创建分支
   */
  async createBranch(path: string, branchName: string): Promise<void> {
    await exec(`git branch ${branchName}`, { cwd: path })
    await exec(`git checkout ${branchName}`, { cwd: path })
  }
  
  /**
   * 切换分支
   */
  async switchBranch(path: string, branchName: string): Promise<void> {
    await exec(`git checkout ${branchName}`, { cwd: path })
  }
  
  /**
   * 合并分支
   */
  async mergeBranch(
    path: string, 
    sourceBranch: string, 
    targetBranch?: string
  ): Promise<MergeResult> {
    if (targetBranch) {
      await this.switchBranch(path, targetBranch)
    }
    
    try {
      await exec(`git merge ${sourceBranch}`, { cwd: path })
      return { hasConflicts: false }
    } catch (error) {
      const conflicts = await this.getConflicts(path)
      return { hasConflicts: true, conflicts }
    }
  }
}
```

### FileService (文件操作服务)

```typescript
class FileService {
  private watcher: FSWatcher | null = null
  
  /**
   * 扫描文件夹
   */
  async scanDirectory(path: string): Promise<FileNode[]> {
    const entries = await fs.readdir(path, { withFileTypes: true })
    const nodes: FileNode[] = []
    
    for (const entry of entries) {
      // 跳过系统文件
      if (this.isSystemFile(entry.name)) continue
      
      const fullPath = join(path, entry.name)
      const node: FileNode = {
        id: fullPath,
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : 'file',
      }
      
      if (entry.isDirectory()) {
        node.children = await this.scanDirectory(fullPath)
      }
      
      nodes.push(node)
    }
    
    return nodes
  }
  
  /**
   * 监听文件变化
   */
  watchDirectory(path: string, callback: (event: string, path: string) => void): void {
    this.watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
    })
    
    this.watcher
      .on('add', path => callback('add', path))
      .on('change', path => callback('change', path))
      .on('unlink', path => callback('unlink', path))
  }
  
  /**
   * 停止监听
   */
  unwatchDirectory(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }
  
  /**
   * 判断是否为系统文件
   */
  private isSystemFile(name: string): boolean {
    const systemFiles = [
      '.DS_Store',
      'Thumbs.db',
      'desktop.ini',
      '.git',
      'node_modules',
    ]
    return systemFiles.includes(name)
  }
}
```

### DatabaseService (数据库服务)

```typescript
class DatabaseService {
  private db: Database
  
  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.init()
  }
  
  /**
   * 初始化数据库
   */
  private init(): void {
    // 创建表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        current_branch TEXT,
        last_opened DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recent_repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id TEXT NOT NULL,
        opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id)
      )
    `)
  }
  
  /**
   * 保存仓库
   */
  saveRepository(repo: Repository): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO repositories 
      (id, path, name, current_branch, last_opened)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      repo.id,
      repo.path,
      repo.name,
      repo.currentBranch,
      repo.lastOpened.toISOString()
    )
  }
  
  /**
   * 获取最近使用的仓库
   */
  getRecentRepositories(limit: number = 10): Repository[] {
    const stmt = this.db.prepare(`
      SELECT r.* FROM repositories r
      JOIN recent_repositories rr ON r.id = rr.repository_id
      ORDER BY rr.opened_at DESC
      LIMIT ?
    `)
    
    return stmt.all(limit) as Repository[]
  }
  
  /**
   * 记录仓库打开
   */
  recordRepositoryOpen(repositoryId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO recent_repositories (repository_id)
      VALUES (?)
    `)
    
    stmt.run(repositoryId)
  }
}
```

---

## 🎯 状态管理 (Zustand)

### RepositoryStore

```typescript
interface RepositoryState {
  // 状态
  currentRepository: Repository | null
  status: RepositoryStatus | null
  files: FileNode[]
  selectedFiles: Set<string>
  loading: boolean
  error: string | null
  
  // 操作
  openRepository: (path: string) => Promise<void>
  refreshStatus: () => Promise<void>
  selectFiles: (files: Set<string>) => void
  createSnapshot: (message: string) => Promise<void>
}

const useRepositoryStore = create<RepositoryState>((set, get) => ({
  currentRepository: null,
  status: null,
  files: [],
  selectedFiles: new Set(),
  loading: false,
  error: null,
  
  openRepository: async (path: string) => {
    set({ loading: true, error: null })
    try {
      const repo = await apiService.openRepository(path)
      const status = await apiService.getStatus(path)
      const files = await fileService.scanDirectory(path)
      
      set({
        currentRepository: repo,
        status,
        files,
        loading: false,
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  refreshStatus: async () => {
    const { currentRepository } = get()
    if (!currentRepository) return
    
    const status = await apiService.getStatus(currentRepository.path)
    set({ status })
  },
  
  selectFiles: (files: Set<string>) => {
    set({ selectedFiles: files })
  },
  
  createSnapshot: async (message: string) => {
    const { currentRepository, selectedFiles } = get()
    if (!currentRepository) return
    
    set({ loading: true })
    try {
      await apiService.createSnapshot(
        currentRepository.path,
        message,
        Array.from(selectedFiles)
      )
      await get().refreshStatus()
      set({ selectedFiles: new Set(), loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
}))
```

---

## 🚀 性能优化

### 文件扫描优化

```typescript
// 使用 Worker 线程进行文件扫描
// src/server/workers/file-scanner.ts
import { parentPort } from 'worker_threads'

parentPort?.on('message', async ({ path }) => {
  const files = await scanDirectory(path)
  parentPort?.postMessage({ files })
})

// 主线程使用
const worker = new Worker('./workers/file-scanner.js')
worker.postMessage({ path: '/path/to/repo' })
worker.on('message', ({ files }) => {
  // 处理结果
})
```

### 虚拟滚动

```typescript
// 使用 react-window 实现虚拟滚动
import { FixedSizeList } from 'react-window'

const FileList: React.FC = ({ files }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={files.length}
      itemSize={32}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {files[index].name}
        </div>
      )}
    </FixedSizeList>
  )
}
```

### 缓存策略

```typescript
// LRU 缓存
import LRU from 'lru-cache'

const fileCache = new LRU<string, FileNode[]>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 分钟
})

async function getFiles(path: string): Promise<FileNode[]> {
  const cached = fileCache.get(path)
  if (cached) return cached
  
  const files = await scanDirectory(path)
  fileCache.set(path, files)
  return files
}
```

---

## 🧪 测试设计

### 单元测试

```typescript
// GitService 测试
describe('GitService', () => {
  let gitService: GitService
  let testRepo: string
  
  beforeEach(async () => {
    gitService = new GitService()
    testRepo = await createTestRepository()
  })
  
  afterEach(async () => {
    await cleanupTestRepository(testRepo)
  })
  
  it('should init repository', async () => {
    await gitService.init(testRepo)
    const exists = await fs.pathExists(join(testRepo, '.git'))
    expect(exists).toBe(true)
  })
  
  it('should create commit', async () => {
    await gitService.init(testRepo)
    await fs.writeFile(join(testRepo, 'test.txt'), 'test')
    const commitId = await gitService.createCommit(testRepo, 'test commit')
    expect(commitId).toBeTruthy()
  })
})
```

### 集成测试

```typescript
// API 集成测试
describe('Repository API', () => {
  it('POST /api/repository/init', async () => {
    const response = await request(app)
      .post('/api/repository/init')
      .send({ path: '/tmp/test-repo' })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

### E2E 测试

```typescript
// Playwright E2E 测试
test('create snapshot flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // 打开仓库
  await page.click('text=打开文件夹')
  // ... 选择文件夹
  
  // 创建快照
  await page.click('text=创建快照')
  await page.fill('input[name="message"]', 'test snapshot')
  await page.click('text=确认')
  
  // 验证
  await expect(page.locator('text=创建成功')).toBeVisible()
})
```

---

## 📝 错误处理

### 错误类型定义

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 错误码
const ErrorCodes = {
  REPO_NOT_FOUND: 'REPO_NOT_FOUND',
  REPO_NOT_INITIALIZED: 'REPO_NOT_INITIALIZED',
  INVALID_PATH: 'INVALID_PATH',
  GIT_ERROR: 'GIT_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  MERGE_CONFLICT: 'MERGE_CONFLICT',
}
```

### 错误处理中间件

```typescript
// Express 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('API Error:', err)
  
  if (err instanceof AppError) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    })
  }
  
  res.status(500).json({
    success: false,
    error: '服务器错误，请稍后重试',
  })
})
```

---

## 🔒 安全考虑

### 路径验证

```typescript
function validatePath(path: string): void {
  // 检查路径是否存在
  if (!fs.existsSync(path)) {
    throw new AppError('INVALID_PATH', '路径不存在')
  }
  
  // 检查路径是否为目录
  if (!fs.statSync(path).isDirectory()) {
    throw new AppError('INVALID_PATH', '路径必须是文件夹')
  }
  
  // 防止路径遍历攻击
  const normalized = path.normalize(path)
  if (normalized.includes('..')) {
    throw new AppError('INVALID_PATH', '非法路径')
  }
}
```

### 输入验证

```typescript
// 使用 Zod 进行输入验证
import { z } from 'zod'

const CreateSnapshotSchema = z.object({
  path: z.string().min(1),
  message: z.string().min(1).max(500),
  files: z.array(z.string()).optional(),
})

app.post('/api/repository/commit', async (req, res) => {
  const validated = CreateSnapshotSchema.parse(req.body)
  // 处理请求
})
```

---

**文档版本**: 1.0  
**创建日期**: 2025-11-02  
**作者**: Kiro AI Assistant  
**审核状态**: 待审核
