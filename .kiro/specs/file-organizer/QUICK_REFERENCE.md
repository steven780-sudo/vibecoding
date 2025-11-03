# 文件整理助手 - 快速参考

## 🎯 核心概念

### 用户场景
用户有很多历史文件，如：
- `青海省数字政府项目V1.0_0929(初稿).docx`
- `青海省数字政府项目V1.0_1009(过程稿).docx`
- `青海省数字政府项目V1.1_1025(终稿)(新).docx`

需要整理这些混乱的文件，保留需要的版本，删除不需要的版本。

### 解决方案
通过4步向导式流程：
1. **扫描** → 发现相似文件
2. **选择** → 挑选要保留的文件
3. **保存** → 整理到新位置
4. **清理** → 删除不需要的文件

## 📐 核心算法

### 相似度计算公式
```
相似度 = 文件名相似度 × 60% + 文件大小接近度 × 20% + 修改时间接近度 × 20%
```

### 文件分组规则
- 相似度 > 80% → 同一组
- 相似度 60-80% → 可能相关
- 相似度 < 60% → 不分组

## 🗂️ 数据结构

### 核心类型
```typescript
// 文件信息
interface FileInfo {
  id: string;
  path: string;
  name: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  type: FileType;
  status: FileStatus;
}

// 文件组
interface FileGroup {
  id: string;
  files: FileInfo[];
  similarity: number;
  representative: FileInfo;
}

// 整理会话
interface OrganizerSession {
  id: string;
  scanConfig: ScanConfig;
  scannedFiles: FileInfo[];
  fileGroups: FileGroup[];
  stagingArea: FileInfo[];
  statistics: Statistics;
  status: SessionStatus;
}
```

## 🔌 API端点

```typescript
// 扫描
POST /api/organizer/scan
GET  /api/organizer/scan/:sessionId/progress
GET  /api/organizer/scan/:sessionId/result

// 暂存区
POST /api/organizer/:sessionId/staging

// 保存
POST /api/organizer/:sessionId/save

// 清理
POST /api/organizer/:sessionId/cleanup

// 会话管理
GET    /api/organizer/:sessionId
DELETE /api/organizer/:sessionId

// Chronos集成
POST /api/organizer/:sessionId/create-repository
```

## 🎨 组件结构

```
FileOrganizerPage (主页面)
├── ScanConfig (扫描配置)
├── ScanProgress (扫描进度)
├── FileGroupList (文件分组列表)
│   ├── FileGroupItem (文件分组项)
│   │   └── FileItem (文件项)
│   └── StagingArea (暂存区)
├── SaveConfig (保存配置)
├── SaveProgress (保存进度)
├── CleanupConfig (清理配置)
├── CleanupProgress (清理进度)
└── CompletionSummary (完成摘要)
```

## 📋 任务快速索引

### 后端任务
- **任务1**: 基础类型定义
- **任务2**: 核心服务（扫描、相似度、分组、整理器）
- **任务3**: API路由
- **任务4**: 数据库支持

### 前端任务
- **任务5**: 状态管理（Zustand Store）
- **任务6**: API服务
- **任务7**: 核心组件（14个组件）
- **任务8**: Hooks（useOrganizer, useSimilarity, useStaging）

### 集成任务
- **任务9**: Electron集成
- **任务10**: 路由和导航
- **任务11**: Chronos集成

### 优化任务
- **任务12**: 性能优化
- **任务13**: 错误处理
- **任务14**: 样式和UI

### 测试任务（可选）
- **任务15**: E2E测试
- **任务16**: 用户文档
- **任务17**: 最终集成测试

## 🎯 关键需求

### 性能要求
- 扫描速度: ≥ 100 文件/秒
- 相似度计算: ≥ 200 文件对/秒
- 界面响应: ≤ 100ms
- 内存占用: ≤ 500MB（10000个文件）

### 安全要求
- 所有文件操作必须有用户确认
- 默认使用回收站（可恢复）
- 记录所有操作日志
- 提供撤销功能

### 用户体验要求
- 操作流程: ≤ 4步
- 学习成本: 无需教程
- 错误提示: 清晰友好

## 🔧 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 测试
npm run test             # 运行所有测试
npm run test:watch       # 监听模式

# 代码质量
npm run lint             # ESLint检查
npm run type-check       # TypeScript检查

# 构建
npm run build            # 构建所有
```

## 💡 实现提示

### 文件扫描优化
- 使用Worker并行扫描
- 批量处理文件信息
- 实时更新进度

### 相似度计算优化
- 使用缓存避免重复计算
- 批量计算相似度
- 提前终止低相似度计算

### UI性能优化
- 使用虚拟滚动（react-window）
- 懒加载文件预览
- 防抖搜索输入

### 错误处理
- 路径验证（防止路径遍历）
- 权限检查
- 磁盘空间检查
- 文件冲突处理

## 📞 常见问题

### Q: 如何开始第一个任务？
A: 告诉Claude："我想开始实现文件整理助手的任务1"

### Q: 如何查看任务进度？
A: 查看 `.kiro/specs/file-organizer/tasks.md` 文件中的复选框

### Q: 可选任务需要实现吗？
A: 不需要，可选任务（标记*）可以在MVP完成后根据需要实现

### Q: 如何测试功能？
A: 
1. 准备测试文件夹（包含相似文件）
2. 启动应用
3. 打开文件整理助手
4. 按照4步流程操作
5. 验证结果

### Q: 如何与Chronos集成？
A: 整理完成后，点击"创建时光库"按钮，系统会自动为目标文件夹初始化Chronos仓库

## 🔗 相关链接

- [完整需求文档](./requirements.md)
- [详细设计文档](./design.md)
- [任务清单](./tasks.md)
- [Chronos项目文档](../../../CLAUDE.md)

---

**准备好了吗？开始你的第一个任务！** 🚀
