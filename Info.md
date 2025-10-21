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
**v1.1.0** (2025-10-22)

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
2. **文件夹选择**: 需要手动输入路径（待Tauri Dialog API集成）
3. **多仓库管理**: 每次只能打开一个仓库

### 待优化项
1. 添加可视化文件夹选择对话框
2. 支持Windows和Linux平台
3. 添加快照搜索功能
4. 性能监控面板

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

### 短期计划 (v1.2)
- [ ] 可视化文件夹选择对话框
- [ ] 快照搜索功能
- [ ] 分支删除功能
- [ ] 性能监控面板

### 中期计划 (v2.0)
- [ ] Windows支持
- [ ] Linux支持
- [ ] 多语言支持
- [ ] 主题切换

### 长期规划
- [ ] 远程仓库同步
- [ ] 协作功能
- [ ] 插件系统
- [ ] 云备份（可选）

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
- **项目负责人**: sunshunda
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

**文档版本**: 1.0  
**最后更新**: 2025-10-22  
**维护者**: sunshunda

---

<div align="center">

**祝开发顺利！如有问题，请参考项目文档或提交Issue。**

Made with ❤️ by Chronos Team

</div>
