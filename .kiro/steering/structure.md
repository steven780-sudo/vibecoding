---
inclusion: always
---

# 项目结构

## 文档组织

所有项目文档均为中文，位于仓库根目录：

- `readme.md` - 面向用户的安装指南
- `demand_analysis.md` - 产品愿景和用户痛点
- `PRD.md` - 产品需求（功能、UI线框图、用户流程）
- `tech_spec.md` - 技术架构和API规范
- `test_cases.md` - QA测试用例和验收标准
- `project_management.md` - 开发工作流程和AI协作指南
- `system_rule.md` - AI开发者指令和核心原则

## 预期代码结构

代码库将按以下方式组织（在开发过程中创建）：

```
chronos/
├── backend/
│   ├── main.py              # FastAPI application entry
│   ├── api/                 # API route handlers
│   │   ├── repository.py    # Repository operations
│   │   ├── commit.py        # Snapshot/commit operations
│   │   └── branch.py        # Branch operations
│   ├── services/            # Business logic
│   │   └── git_wrapper.py   # Git command execution & parsing
│   ├── models/              # Data models (Pydantic)
│   └── tests/               # Pytest test files
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── SnapshotDialog.tsx
│   │   │   ├── HistoryViewer.tsx
│   │   │   └── BranchManager.tsx
│   │   ├── api/             # API client functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   ├── tests/               # Vitest test files
│   └── package.json
│
└── docs/                    # Additional documentation (if needed)
```

## 关键约定

- 所有面向用户的字符串必须使用中文
- API响应遵循一致的格式：`{success: boolean, data?: any, error?: string}`
- Git操作隔离在`git_wrapper.py`服务层中
- 每个主要功能都有相应的单元测试
- 组件文件使用PascalCase，工具文件使用snake_case（Python）或camelCase（TypeScript）

## Git工作流

- `main`分支是稳定分支
- 功能分支：`feature/<feature-name>`
- Bug修复分支：`fix/<issue-name>`
- 所有工作必须在功能分支中完成，并通过pull request合并
- Commit消息遵循约定式提交：`feat:`、`fix:`、`docs:`、`test:`、`refactor:`
