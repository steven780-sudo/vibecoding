# Chronos 项目信息文档

> 本文档用于帮助AI助手快速了解Chronos项目，以便进行后续的产品优化和迭代开发。

---

## 📋 项目概述

### 项目名称
**Chronos - 本地文件时光机**

### 项目定位
一款为非技术用户设计的图形化Git版本管理工具，将强大的Git功能包装在友好的用户界面中。

### 核心价值
- 告别混乱的文件命名（如"报告_最终版_v3_真正最终版.doc"）
- 提供时光穿梭能力，随时回到任何历史版本
- 通过分支功能安全地尝试新想法
- 完全本地运行，零云依赖

### 目标用户
需要版本控制但不熟悉Git的专业人士（文档编写、报告制作、创意工作等）

### 当前版本
**v1.2.0** (2025-10-22)

### 版本历史
- **v1.2.0** (2025-10-22): 文件树展示优化、发布说明组件、增强日志
- **v1.1.0** (2025-10-22): 系统文件过滤、最近使用列表、Tauri桌面应用
- **v1.0.0** (2025-10-21): MVP版本，基础功能完成

---

## 🏗️ 技术架构

### 整体架构
```
┌─────────────────────────────────────┐
│   Tauri Desktop Application         │
│  ┌─────────────┐  ┌───────────────┐ │
│  │   Frontend  │  │    Backend    │ │
│  │  React +TS  │◄─┤  Python+FastAPI│ │
│  │  Ant Design │  │   Git Wrapper │ │
│  └─────────────┘  └───────────────┘ │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Git CLI     │
    │  (核心引擎)   │
    └──────────────┘
```

### 技术栈

**Backend**
- Python 3.10+
- FastAPI (Web框架)
- Git CLI (通过subprocess调用)
- Pytest (测试框架)

**Frontend**
- React 18
- TypeScript
- Vite (构建工具)
- Ant Design 5.x (UI组件库)
- Vitest (测试框架)

**Desktop**
- Tauri 2.0 (桌面应用框架)
- Rust (Tauri后端)

**开发工具**
- Black & Ruff (Python代码质量)
- Prettier & ESLint (TypeScript代码质量)

---

## 📁 项目结构

```
chronos/
├── backend/                    # Python后端
│   ├── api/repository.py      # API路由
│   ├── services/git_wrapper.py # Git命令封装
│   ├── models/schemas.py      # 数据模型
│   └── tests/                 # 单元测试
│
├── frontend/                   # React前端
│   ├── src/
│   │   ├── components/        # UI组件
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── api/client.ts      # API客户端
│   │   └── App.tsx            # 主应用
│   └── src-tauri/             # Tauri配置
│
├── scripts/                    # 实用脚本
├── release/                    # 发布说明
├── Chronos_v1.1.0_macOS.dmg   # 安装包
└── README.md                   # 用户文档
```

详细结构见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 🎯 核心功能

### 1. 仓库管理
- **初始化时光库**: 将普通文件夹转换为版本控制仓库
- **智能识别**: 自动检测文件夹是否已初始化
- **最近使用列表**: 记住最近打开的10个仓库

### 2. 快照管理
- **创建快照**: 保存文件当前状态（类似游戏存档）
- **文件选择**: 可选择要包含的文件
- **描述说明**: 为每个快照添加描述和详情
- **状态显示**: 🟢新增 🟡修改 🔴删除

### 3. 历史记录
- **时间线展示**: 按时间倒序显示所有快照
- **详情查看**: 展开查看快照的详细信息
- **一键回滚**: 恢复到任意历史版本

### 4. 分支管理
- **创建分支**: 创建独立的工作副本
- **切换分支**: 在不同分支间自由切换
- **自动切换**: 创建分支后自动切换到新分支
- **合并分支**: 将实验性修改合并到主版本

### 5. 系统文件过滤
- **自动忽略**: 自动创建.gitignore文件
- **跨平台支持**: 过滤macOS、Windows、Linux系统文件
- **界面隐藏**: 系统文件不在界面显示

---

## 🔄 数据流

### 用户操作流程
```
用户操作 → Frontend组件 → Custom Hook → API Client 
    → Backend API → Git Wrapper → Git CLI → 文件系统
```

### 关键API端点

**仓库操作**
- `POST /api/repository/init` - 初始化仓库
- `GET /api/repository/status` - 获取仓库状态
- `GET /api/repository/files` - 获取已追踪文件

**快照操作**
- `POST /api/repository/commit` - 创建快照
- `GET /api/repository/log` - 获取历史记录
- `POST /api/repository/checkout` - 回滚版本

**分支操作**
- `GET /api/repository/branches` - 获取分支列表
- `POST /api/repository/branch` - 创建分支
- `POST /api/repository/switch` - 切换分支
- `POST /api/repository/merge` - 合并分支

---

## 🎨 用户界面

### 主界面布局
```
┌─────────────────────────────────────────────┐
│  Header: Chronos - 文件时光机                │
│  [刷新] [创建快照]                           │
├──────────────┬──────────────────────────────┤
│  左侧面板     │  右侧面板                     │
│              │                              │
│  仓库状态     │  历史记录                     │
│  - 当前分支   │  - 快照时间线                 │
│  - 待提交变更 │  - 展开查看详情               │
│  - 文件列表   │  - 回滚按钮                   │
│              │                              │
│  分支管理     │                              │
│  - 分支列表   │                              │
│  - 创建分支   │                              │
│  - 切换分支   │                              │
│  - 合并分支   │                              │
└──────────────┴──────────────────────────────┘
```

### 关键组件
- `App.tsx` - 主应用容器
- `SnapshotDialog.tsx` - 创建快照对话框
- `HistoryViewer.tsx` - 历史记录查看器
- `BranchManager.tsx` - 分支管理器

---

## 🔧 开发指南

### 环境要求
- Python 3.10+
- Node.js 18+
- Git 2.0+
- Rust (用于Tauri构建)

### 快速启动
```bash
# 1. 安装依赖
./scripts/setup.sh

# 2. 启动开发环境
./scripts/start-dev.sh

# 3. 访问应用
# Frontend: http://localhost:5173
# Backend: http://127.0.0.1:8765
```

### 停止服务
```bash
./scripts/stop-dev.sh
```

### 代码质量检查
```bash
./scripts/check-quality.sh
```

### 构建桌面应用
```bash
cd frontend
npm run tauri:build
```

---

## 📝 开发规范

### Git提交规范
使用约定式提交（Conventional Commits）：
- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具

### 代码规范
- **Python**: 遵循Black和Ruff规范
- **TypeScript**: 遵循Prettier和ESLint规范
- **测试**: 所有新功能必须有测试覆盖

### 分支策略
- `main` - 稳定分支
- `feature/*` - 功能分支
- `fix/*` - Bug修复分支

---

## 🐛 已知问题和限制

### 当前限制
1. **平台支持**: 仅支持macOS (Apple Silicon)
2. **Git依赖**: 用户需要自己安装Git（v1.3将内置Git）
3. **多仓库管理**: 每次只能打开一个仓库
4. **端口冲突**: 开发模式和应用不能同时运行（都使用8765端口）

### v1.2已知问题
1. **桌面应用运行问题**: 部分用户报告"资源不存在"错误
   - 可能原因：后端服务未正确启动
   - 已添加：详细日志和健康检查
   - 待修复：确保后端可靠启动

2. **文件夹选择对话框**: 功能已实现但可能失败
   - 代码已完成，权限已配置
   - 需要在桌面应用中验证

### 待优化项
1. 实现内置Git（v1.3优先级最高）
2. 支持Windows和Linux平台
3. 添加快照搜索功能
4. 性能监控面板
5. 解决端口冲突问题（使用动态端口）

---

## 📊 性能指标

### 当前性能
- 初始化1000个文件: < 1秒
- 状态检查: < 100ms
- 历史加载: < 100ms
- UI响应: 毫秒级

### 性能优化策略
- Git命令通过subprocess异步执行
- Frontend使用React.memo优化渲染
- 文件列表虚拟化滚动（如需要）

---

## 🔐 安全考虑

### 数据安全
- 所有数据保存在本地
- 不上传任何数据到云端
- 使用Git的成熟加密机制

### 文件权限
- 遵循系统文件权限
- 不修改系统文件
- 自动过滤敏感文件

---

## 🧪 测试策略

### 测试覆盖
- Backend: 18个单元测试
- Frontend: 57个单元测试
- 总计: 75个测试用例

### 测试类型
- **单元测试**: 测试独立功能模块
- **集成测试**: 测试API端点
- **E2E测试**: 测试完整用户流程（手动）

### 运行测试
```bash
# Backend测试
cd backend && pytest tests/ -v

# Frontend测试
cd frontend && npm test

# 所有测试
./scripts/check-quality.sh
```

---

## 📚 重要文档

### 用户文档
- [README.md](./README.md) - 快速开始和使用指南

### 开发文档
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 项目结构详解
- [scripts/README.md](./scripts/README.md) - 脚本使用说明

### 发布文档
- [release/RELEASE_v1.0.md](./release/RELEASE_v1.0.md) - v1.0发布说明
- [release/RELEASE_v1.1.md](./release/RELEASE_v1.1.md) - v1.1发布说明
- [release/TAURI_BUILD_GUIDE.md](./release/TAURI_BUILD_GUIDE.md) - Tauri构建指南

---

## 🎯 产品迭代历史

### v1.0 (2025-10-21) - MVP版本
- ✅ 基础仓库管理
- ✅ 快照创建和查看
- ✅ 历史记录和回滚
- ✅ 分支管理和合并
- ✅ 性能优化

### v1.1 (2025-10-22) - 用户体验优化
- ✅ 系统文件自动忽略
- ✅ 最近使用仓库列表
- ✅ 智能仓库打开
- ✅ 自动刷新数据
- ✅ 友好错误提示
- ✅ Tauri桌面应用

---

## 🚀 未来规划

### 当前开发 (v1.3) - 进行中
- [ ] **内置Git功能**（最高优先级）
  - macOS版本MVP（1-2天）
  - 开箱即用，无需用户安装Git
  - 精简后增加约8-10MB体积
  - 完全遵守GPL v2许可证
- [ ] 修复桌面应用运行问题
- [ ] 优化后端启动可靠性

### 短期计划 (v1.4-v1.5)
- [ ] 内置Git跨平台支持（Windows、Linux）
- [ ] 快照搜索功能
- [ ] 分支删除功能
- [ ] 解决端口冲突（动态端口分配）
- [ ] 性能监控面板

### 中期计划 (v2.0)
- [ ] Windows完整支持
- [ ] Linux完整支持
- [ ] 多语言支持（英文、中文）
- [ ] 主题切换（亮色/暗色）
- [ ] 高级Git功能（stash、rebase等）

### 长期规划 (v3.0+)
- [ ] 远程仓库同步（GitHub、GitLab集成）
- [ ] 协作功能（多人使用同一仓库）
- [ ] 插件系统
- [ ] 云备份（可选）
- [ ] 移动端支持

---

## 💡 开发建议

### 添加新功能时
1. **先查看现有代码**: 了解类似功能的实现方式
2. **遵循现有模式**: 保持代码风格一致
3. **添加测试**: 确保功能稳定
4. **更新文档**: 记录新功能的使用方法

### 修复Bug时
1. **重现问题**: 确保能稳定复现
2. **定位根因**: 找到问题的根本原因
3. **编写测试**: 防止问题再次出现
4. **验证修复**: 确保不影响其他功能

### 性能优化时
1. **先测量**: 使用工具测量性能瓶颈
2. **针对性优化**: 优化最慢的部分
3. **验证效果**: 确保优化有效
4. **避免过度优化**: 保持代码可读性

---

## 🔍 常见问题

### Q: 如何添加新的API端点？
A: 
1. 在`backend/api/repository.py`中添加路由
2. 在`backend/services/git_wrapper.py`中添加Git操作
3. 在`frontend/src/api/client.ts`中添加客户端方法
4. 在相应的Hook中调用API

### Q: 如何添加新的UI组件？
A:
1. 在`frontend/src/components/`创建新组件
2. 使用Ant Design组件库
3. 通过Props传递数据
4. 使用Custom Hook管理状态

### Q: 如何调试Backend？
A:
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --port 8765
# 访问 http://127.0.0.1:8765/docs 查看API文档
```

### Q: 如何调试Frontend？
A:
```bash
cd frontend
npm run dev
# 打开浏览器开发者工具
```

---

## 📞 获取帮助

### 项目资源
- **GitHub仓库**: https://github.com/steven780-sudo/vibecoding
- **问题反馈**: GitHub Issues
- **功能建议**: GitHub Discussions

### 关键联系人
- **项目负责人**: sunshunda@gmail.com
- **许可证**: MIT License

---

## 📌 重要提示

### 开发注意事项
1. **不要修改.git文件夹**: 这是Git的核心数据
2. **测试系统文件过滤**: 确保.DS_Store等文件被正确过滤
3. **保持API向后兼容**: 避免破坏现有功能
4. **注意跨平台兼容性**: 虽然当前只支持macOS，但代码应考虑跨平台

### 代码审查要点
1. **功能完整性**: 是否实现了所有需求
2. **错误处理**: 是否有完善的错误处理
3. **用户体验**: 是否友好易用
4. **性能影响**: 是否影响现有性能
5. **测试覆盖**: 是否有足够的测试

---

## 📐 技术栈详情

### 架构

完全在用户本地机器上运行的客户端-服务器架构：
- **Frontend**: Tauri 2.x + React 18 + TypeScript + Vite
- **Backend**: Python 3.10+ + FastAPI（打包为独立二进制）
- **Core Engine**: Git CLI（通过subprocess封装，v1.3将内置）
- **UI Library**: Ant Design 5.x
- **Desktop Framework**: Tauri 2.0（Rust）

### 通信机制

Frontend通过本地HTTP API在`127.0.0.1:8765`与Backend通信

**⚠️ 重要**：开发模式和桌面应用不能同时运行（端口冲突）

### 代码质量工具

**Python**:
- Formatter: Black
- Linter: Ruff
- Testing: Pytest

**TypeScript/React**:
- Formatter: Prettier
- Linter: ESLint
- Testing: Vitest

### Git封装策略

所有版本控制操作都通过Python的`subprocess`模块执行Git CLI命令。Backend解析Git输出并返回结构化JSON。

```python
result = subprocess.run(
    ["git", "status", "--porcelain"],
    cwd=repo_path,
    capture_output=True,
    text=True
)
```

---

## 🎯 产品定位

### 核心价值主张

- 消除混乱的文件命名（"报告_最终版_v3_真正最终版.doc"）
- 为项目文件夹提供时光穿梭能力
- 通过分支实现安全的实验
- 零云依赖 - 所有数据保持本地

### 目标用户

从事复杂文档项目（报告、提案、创意工作）的非技术专业人员，需要版本控制但觉得Git令人生畏。

### 用户友好术语

产品使用简化术语，而不是Git术语：
- "时光库" (Time Vault) 代替 "repository"
- "快照" (Snapshot) 代替 "commit"
- "历史" (History) 代替 "log"
- "分支" (Branch) - 保持原样，解释为"草稿副本"

---

## 🤖 AI协作规则

### 核心指令

你是资深全栈软件工程师，负责Chronos项目的开发和维护。必须严格遵守项目文档规范和技术约定。

### 核心文档（唯一真相来源）

在开始任何任务前，必须理解以下文档：
- `.kiro/steering/Info.md` - 项目概述和技术栈
- `.kiro/steering/HANDOVER.md` - 当前状态和待办事项
- `.kiro/steering/BUILD_GUIDE.md` - 构建流程
- `docs/user_given/PRD.md` - 产品需求
- `docs/user_given/tech_spec.md` - 技术规格

### 工作流程

1. **Git工作流**：
   - `main`分支是稳定分支
   - 功能分支：`feature/<feature-name>`
   - Bug修复：`fix/<issue-name>`
   - Commit消息：`feat:` `fix:` `docs:` `test:` `refactor:`

2. **交付标准**：
   - 符合规范的代码（通过Linter和Formatter）
   - 完备的单元测试
   - 清晰的Commit历史

3. **沟通准则**：
   - 主动澄清歧义，不要假设
   - 专注任务范围，不实现PRD外功能
   - 为复杂逻辑添加注释
   - 使用中文交流（代码和专业名词除外）

### 关键约定

- 所有面向用户的字符串使用中文
- API响应格式：`{success: boolean, data?: any, error?: string}`
- Git操作隔离在`git_wrapper.py`中
- 组件文件用PascalCase，工具文件用snake_case（Python）或camelCase（TypeScript）

---

## 🚨 重要提醒

### 端口冲突问题

开发模式和桌面应用都使用8765端口，不能同时运行：

```bash
# 关闭开发模式后端
lsof -i :8765  # 查找进程
kill <PID>     # 杀掉进程

# 或使用脚本
./scripts/stop-dev.sh
```

### 桌面应用使用

用户安装dmg后：
1. 双击Chronos图标
2. 应用自动启动（包括后端服务）
3. 开箱即用，无需手动启动服务

### Git存储机制

- 快照存储在`.git`隐藏文件夹中
- 使用增量存储和压缩
- 2GB文件夹 + Git ≈ 2.5-3GB（不是4GB）

---

**文档版本**: 2.0  
**最后更新**: 2025-10-22  
**维护者**: sunshunda

---

<div align="center">

**祝开发顺利！如有问题，请参考项目文档或提交Issue。**

Made with ❤️ by Chronos Team

</div>
