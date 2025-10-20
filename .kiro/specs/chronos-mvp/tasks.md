# 实施计划: Chronos MVP

## 任务列表

- [x] 1. 搭建项目基础结构并验证环境
  - 创建backend和frontend目录结构
  - 配置Python虚拟环境和依赖（requirements.txt）
  - 配置Frontend项目（package.json, tsconfig.json）
  - 设置代码质量工具（Black, Ruff, Prettier, ESLint）
  - 创建并验证Hello World级别的项目骨架（Backend返回简单JSON，Frontend能调用并显示）
  - 确保所有核心依赖都能正常工作
  - _需求: 9.1, 9.2_

- [ ] 2. 实现Backend核心Git封装服务
  - [ ] 2.1 创建GitWrapper类基础结构
    - 实现`__init__`方法，接收repo_path参数
    - 实现通用的`_run_git_command`方法用于执行Git命令
    - 实现错误处理和异常类（GitError, RepositoryNotFoundError等）
    - _需求: 1.1, 1.4_

  - [ ] 2.2 实现仓库初始化功能
    - 实现`init_repository`方法执行git init
    - 创建.chronos配置文件
    - 验证路径存在性和可访问性
    - _需求: 1.1, 1.3, 1.4_

  - [ ] 2.3 实现仓库状态获取功能
    - 实现`get_status`方法执行git status --porcelain
    - 实现`get_current_branch`方法获取当前分支
    - 解析状态输出并标准化文件状态（A/M/D）
    - _需求: 2.1, 2.2, 2.3_

  - [ ] 2.4 实现快照创建功能
    - 实现`create_commit`方法执行git add和git commit
    - 支持选择性添加文件
    - 验证commit message非空
    - _需求: 3.2, 3.3, 3.5_

  - [ ] 2.5 实现历史记录获取功能
    - 实现`get_log`方法执行git log
    - 使用--pretty=format自定义输出格式
    - 解析输出为结构化数据（id, message, author, date）
    - _需求: 4.1, 4.3, 4.5_

  - [ ] 2.6 实现版本回滚功能
    - 实现`checkout_commit`方法执行git checkout
    - 验证commit_id有效性
    - 处理回滚失败情况
    - _需求: 5.3, 5.4, 5.5_

  - [ ] 2.7 实现分支管理功能
    - 实现`get_branches`方法获取所有分支
    - 实现`create_branch`方法创建新分支
    - 实现`switch_branch`方法切换分支
    - 实现`merge_branch`方法合并分支
    - 检测和处理合并冲突
    - _需求: 6.1, 6.3, 6.4, 7.1, 7.3, 8.3, 8.5_

  - [ ] 2.8 编写GitWrapper单元测试（核心质量保障）
    - 为每个GitWrapper方法编写单元测试（建议在实现方法后立即编写）
    - 测试所有Git命令执行和输出解析
    - 测试错误处理逻辑
    - 模拟各种Git输出场景（正常、错误、边界情况）
    - 确保测试覆盖率达到关键逻辑的100%
    - _需求: 1.5, 2.5, 3.7, 5.5_

- [ ] 3. 实现Backend API层
  - [ ] 3.1 创建FastAPI应用和数据模型
    - 创建main.py和FastAPI应用实例
    - 定义Pydantic数据模型（请求和响应）
    - 配置CORS中间件
    - 实现统一的响应格式
    - _需求: 9.2, 9.3, 9.4_

  - [ ] 3.2 实现仓库操作API端点
    - 实现POST /repository/init端点
    - 实现GET /repository/status端点
    - 添加路径验证和错误处理
    - _需求: 1.1, 1.2, 1.3, 2.1, 2.4_

  - [ ] 3.3 实现快照操作API端点
    - 实现POST /repository/commit端点
    - 实现GET /repository/log端点
    - 实现POST /repository/checkout端点
    - 添加请求验证和错误处理
    - _需求: 3.1, 3.3, 3.5, 4.1, 4.5, 5.1, 5.4_

  - [ ] 3.4 实现分支操作API端点
    - 实现GET /repository/branches端点
    - 实现POST /repository/branch端点
    - 实现POST /repository/switch端点
    - 实现POST /repository/merge端点
    - 添加分支名称验证
    - _需求: 6.1, 6.2, 6.5, 7.1, 7.3, 8.2, 8.3_

  - [ ] 3.5 编写API端点集成测试（核心质量保障）
    - 使用FastAPI TestClient测试所有API端点
    - 测试请求验证和错误响应
    - 测试成功和失败场景
    - 验证API响应格式的一致性
    - _需求: 9.3, 9.4_

- [ ] 4. 实现Frontend API客户端
  - [ ] 4.1 创建API客户端类
    - 实现ChronosApiClient类
    - 配置baseUrl为127.0.0.1:8765
    - 实现通用的HTTP请求方法
    - 实现错误处理和重试逻辑
    - _需求: 9.1, 9.5_

  - [ ] 4.2 实现所有API调用方法
    - 实现initRepository方法
    - 实现getStatus方法
    - 实现createCommit方法
    - 实现getLog方法
    - 实现checkoutCommit方法
    - 实现getBranches, createBranch, switchBranch, mergeBranch方法
    - _需求: 1.1, 2.1, 3.3, 4.1, 5.3, 6.3, 7.3, 8.3_

  - [ ]* 4.3 编写API客户端单元测试
    - 模拟HTTP响应
    - 测试所有API方法
    - 测试错误处理
    - _需求: 9.3, 9.4_

- [ ] 5. 实现Frontend自定义Hooks
  - [ ] 5.1 实现useRepository Hook
    - 管理仓库状态数据
    - 实现refreshStatus方法
    - 处理加载状态
    - _需求: 2.1, 2.4, 10.1_

  - [ ] 5.2 实现useHistory Hook
    - 管理历史记录数据
    - 实现refreshHistory方法
    - 处理加载状态
    - _需求: 4.1, 4.5, 10.4_

  - [ ] 5.3 实现useBranches Hook
    - 管理分支列表数据
    - 实现refreshBranches方法
    - 跟踪当前分支
    - _需求: 7.1, 7.2, 7.4_

  - [ ]* 5.4 编写Hooks单元测试
    - 使用@testing-library/react-hooks测试
    - 测试状态更新逻辑
    - 测试副作用
    - _需求: 10.1_

- [ ] 6. 实现Frontend核心组件
  - [ ] 6.1 实现SnapshotDialog组件
    - 创建对话框UI结构（使用Ant Design Modal）
    - 显示变更文件列表（使用Checkbox.Group）
    - 实现文件选择功能（全选/取消全选）
    - 实现描述输入框（必填验证）
    - 实现可选的详细描述区域
    - 实现确认和取消按钮
    - 集成createCommit API调用
    - _需求: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [ ] 6.2 实现HistoryViewer组件
    - 创建历史查看器UI结构（使用Ant Design Timeline）
    - 显示快照列表（倒序时间线）
    - 实现快照详情展示（点击显示文件变更）
    - 实现"恢复到此版本"按钮
    - 添加回滚确认对话框（警告提示）
    - 实现空状态提示
    - 集成getLog和checkoutCommit API调用
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.6, 5.1, 5.2, 5.4_

  - [ ] 6.3 实现BranchManager组件
    - 创建分支管理器UI（使用Ant Design Select和Button）
    - 实现分支下拉选择器
    - 显示当前分支标识
    - 实现"创建新分支"按钮和输入对话框
    - 实现分支切换功能
    - 实现"合并到主版本"按钮（条件显示）
    - 添加合并预览对话框
    - 集成getBranches, createBranch, switchBranch, mergeBranch API调用
    - _需求: 6.1, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 6.4 实现App主组件
    - 创建应用主布局
    - 实现路由管理
    - 集成所有子组件
    - 实现全局错误边界
    - 添加加载指示器
    - _需求: 10.1, 10.5_

  - [ ]* 6.5 编写组件单元测试
    - 测试组件渲染
    - 测试用户交互
    - 测试条件渲染
    - 测试API调用集成
    - _需求: 3.6, 4.6, 5.1, 8.4_

- [ ] 7. 实现用户通知和反馈
  - [ ] 7.1 集成Ant Design Message组件
    - 实现成功通知（初始化、创建快照、回滚等）
    - 实现错误通知（操作失败）
    - 实现警告通知（回滚前警告）
    - _需求: 1.3, 3.5, 5.4_

  - [ ] 7.2 实现加载状态指示器
    - 在所有异步操作中显示加载状态
    - 使用Ant Design Spin组件
    - 在长时间操作时显示进度提示
    - _需求: 10.5_

  - [ ] 7.3 实现错误处理和用户引导
    - 显示友好的错误消息
    - 提供操作建议和帮助
    - 实现空状态引导
    - _需求: 1.5, 3.7, 4.6, 5.5, 6.5, 8.5_

- [ ] 8. 配置和启动脚本
  - [ ] 8.1 创建Backend启动脚本
    - 编写启动命令
    - 配置端口和主机
    - 添加开发模式热重载
    - _需求: 9.1_

  - [ ] 8.2 创建Frontend开发脚本
    - 配置Vite开发服务器
    - 配置代理到Backend API
    - 添加环境变量配置
    - _需求: 9.1_

  - [ ] 8.3 创建代码质量检查脚本
    - 配置Black和Ruff for Python
    - 配置Prettier和ESLint for TypeScript
    - 创建pre-commit hooks
    - _需求: 10.1_

- [ ] 9. 端到端测试和优化
  - [ ] 9.1 进行端到端流程测试
    - 测试完整的初始化→快照→历史→回滚流程
    - 测试分支创建→切换→合并流程
    - 验证所有用户交互正常工作
    - _需求: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

  - [ ] 9.2 进行性能测试和优化
    - 测试1000个文件的初始化时间（目标<1秒）
    - 测试10个文件修改后的状态检查时间（目标<500ms）
    - 测试100个commit的历史加载时间（目标<500ms）
    - 测试UI响应时间（目标<200ms）
    - 根据测试结果进行优化
    - _需求: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.3 编写用户文档
    - 创建安装指南
    - 创建使用教程
    - 创建常见问题解答
    - _需求: 1.1, 3.1, 4.1, 6.1, 8.1_

- [ ] 10. Tauri集成和打包
  - [ ] 10.1 配置Tauri项目
    - 初始化Tauri配置
    - 配置应用图标和元数据
    - 配置窗口大小和行为
    - _需求: 9.1_

  - [ ] 10.2 集成Backend到Tauri
    - 配置Backend作为Tauri sidecar进程
    - 确保Backend随应用启动和关闭
    - 处理进程通信
    - _需求: 9.1_

  - [ ] 10.3 构建macOS应用
    - 配置macOS特定设置
    - 构建.app应用包
    - 测试应用安装和运行
    - _需求: 9.1_

  - [ ]* 10.4 配置右键菜单集成
    - 研究macOS Finder扩展API
    - 实现右键菜单项
    - 集成到Chronos应用
    - _需求: 1.1_
