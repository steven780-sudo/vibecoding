# Chronos v2.0 - 文档索引

本目录包含 Chronos v2.0 项目的所有文档。

---

## 📚 文档列表

### 1. [PROJECT_STATUS.md](PROJECT_STATUS.md) - 项目状态
**用途**：追踪项目当前状态和进度

**包含内容**：
- 整体进度（规划、整理、开发）
- 已完成工作清单
- 待完成工作清单
- 当前目录结构
- 变更日志

**更新频率**：每次重要变更后更新

---

### 2. [CONFIG_GUIDE.md](CONFIG_GUIDE.md) - 配置文件说明
**用途**：详细解释所有配置文件的作用

**包含内容**：
- package.json 说明
- TypeScript 配置说明
- Vite 配置说明
- ESLint/Prettier 配置说明
- 配置文件之间的关系
- 实际工作流程示例

**更新频率**：添加新配置文件时更新

---

### 3. [DEPENDENCIES.md](DEPENDENCIES.md) - 依赖说明
**用途**：说明项目使用的技术栈和依赖库

**包含内容**：
- 技术栈选择理由
- 生产依赖列表
- 开发依赖列表
- 依赖版本说明

**更新频率**：添加或更新依赖时更新

---

### 4. [REWRITE_SUMMARY.md](REWRITE_SUMMARY.md) - 重写总结
**用途**：记录 v2.0 重写项目的规划和决策

**包含内容**：
- 重写原因和目标
- 技术栈决策
- 架构设计亮点
- 项目规模统计
- 验收标准

**更新频率**：项目完成后归档，不再更新

---

## 🔧 MCP 工具

项目已配置 6 个 MCP 工具来提升开发效率：

### 1. Context7 MCP
- **用途**: 搜索最新开发文档
- **配置**: `.kiro/settings/mcp.json`
- **状态**: ✅ 已配置 API Key
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

### 2. Playwright MCP
- **用途**: Web 应用自动化测试
- **配置**: `.kiro/settings/mcp.json`
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

### 3. Chrome DevTools MCP
- **用途**: Chrome 官方浏览器调试工具
- **配置**: `.kiro/settings/mcp.json`
- **状态**: ✅ 已配置（推荐使用）
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

### 4. Memory MCP
- **用途**: 知识图谱记忆系统
- **配置**: `.kiro/settings/mcp.json`
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

### 5. Sequential Thinking MCP
- **用途**: 系统性思维和问题解决
- **配置**: `.kiro/settings/mcp.json`
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

### 6. Filesystem MCP
- **用途**: 增强文件操作
- **配置**: `.kiro/settings/mcp.json`
- **文档**: 查看 CLAUDE.md 的 "MCP 工具配置" 章节

---

## 📋 文档管理规范

### 创建新文档前

1. **检查现有文档**
   - 确认新内容是否可以添加到现有文档中
   - 避免创建重复内容的文档

2. **文档分类**
   - 技术文档：CONFIG_GUIDE.md、DEPENDENCIES.md
   - 项目文档：PROJECT_STATUS.md、REWRITE_SUMMARY.md

3. **命名规范**
   - 使用大写字母和下划线
   - 名称清晰表达内容
   - 例如：`CONFIG_GUIDE.md`、`API_REFERENCE.md`

### 更新文档

- 优先在现有文档上补充内容
- 保持文档结构清晰
- 及时删除过时或重复的文档
- 更新文档后，同步更新本索引

---

## 🔗 其他重要文档

### 根目录
- [CLAUDE.md](../CLAUDE.md) - 项目总文档（完整指南）
- [README.md](../README.md) - 项目说明和快速开始

### 规格文档
- [需求文档](../.kiro/specs/chronos-v2/requirements.md)
- [设计文档](../.kiro/specs/chronos-v2/design.md)
- [任务清单](../.kiro/specs/chronos-v2/tasks.md)

### AI 协作
- [项目指南](../.kiro/steering/PROJECT_GUIDE.md)

---

## 📝 文档维护

**负责人**：项目团队  
**更新频率**：根据项目进展及时更新  
**归档规则**：项目完成后，将文档归档到 `docs/archive/`

---

**最后更新**: 2025-11-02
