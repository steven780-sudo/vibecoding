# 需求文档: Chronos MVP

## 简介

Chronos是一款为非技术用户设计的轻量级、本地优先的文件版本管理工具。它为Git驱动的版本控制提供图形化界面，使需要强大文件历史和分支功能但不了解Git概念的用户也能轻松使用。MVP版本专注于macOS桌面应用，集成右键菜单，使用户能够将文件夹初始化为版本控制的"时光库"，创建带描述的快照，查看历史并回滚到之前的版本，以及创建和合并分支进行实验。

## 术语表

- **System**: Chronos应用程序（前端GUI + 后端服务）
- **Time Vault**: 已初始化进行版本控制的文件夹（Git仓库）
- **Snapshot**: 时光库在特定时间点的保存版本（Git commit）
- **User**: 需要文件版本管理的非技术专业人员
- **Backend Service**: 在本地8765端口运行的Python FastAPI服务
- **Frontend GUI**: Tauri/React桌面应用程序
- **Repository Path**: 时光库文件夹的绝对文件系统路径
- **Change Status**: 文件的状态（新增、修改、删除）
- **Branch**: 时光库内的独立开发线
- **History Timeline**: 时光库中所有快照的时间顺序列表

## 需求

### 需求 1: 初始化时光库

**用户故事:** 作为用户，我希望能通过一次操作将任意本地文件夹转换为时光库，以便开始跟踪我的文件版本。

#### 验收标准

1. WHEN User选择文件夹并请求初始化时，THE System SHALL在目标文件夹中执行git init并创建.chronos配置文件
2. IF 文件夹已经是Git仓库，THEN THE System SHALL显示消息表明该文件夹已初始化
3. WHEN 初始化成功完成时，THE System SHALL向User显示成功通知
4. THE System SHALL在尝试初始化之前验证Repository Path存在且可访问
5. IF 初始化失败，THEN THE System SHALL显示包含具体失败原因的错误消息

### 需求 2: 显示仓库状态

**用户故事:** 作为用户，我希望能看到时光库中哪些文件发生了变化，以便知道下一个快照将包含什么内容。

#### 验收标准

1. WHEN User请求仓库状态时，THE System SHALL执行git status --porcelain并解析输出
2. THE System SHALL使用Change Status（新增、修改或删除）对每个变更文件进行分类
3. THE System SHALL在文件变更旁显示当前分支名称
4. THE System SHALL在500毫秒内返回包含最多10个修改文件的仓库的状态信息
5. IF 未检测到变更，THEN THE System SHALL指示Time Vault是干净的，没有待处理的变更

### 需求 3: 创建快照

**用户故事:** 作为用户，我希望能为时光库创建带有描述性消息的快照，以便永久记录文件的当前状态。

#### 验收标准

1. WHEN User发起快照创建时，THE System SHALL显示对话框，展示所有变更文件及其Change Status
2. THE System SHALL要求User在允许创建快照之前提供一行描述
3. WHEN User使用有效描述确认快照创建时，THE System SHALL使用提供的消息执行git add和git commit
4. THE System SHALL允许User选择要包含在快照中的特定文件
5. WHEN 快照创建成功完成时，THE System SHALL显示成功通知
6. IF User尝试在未提供描述的情况下创建快照，THEN THE System SHALL禁用确认按钮并显示提示
7. IF 快照创建失败，THEN THE System SHALL显示包含具体失败原因的错误消息

### 需求 4: 查看历史时间线

**用户故事:** 作为用户，我希望能查看时光库历史中的所有快照，以便了解项目的演变过程。

#### 验收标准

1. WHEN User请求历史记录时，THE System SHALL执行git log并将输出解析为结构化数据
2. THE System SHALL在垂直时间线上按时间倒序（最新的在前）显示快照
3. THE System SHALL为每个快照显示：commit ID、描述消息、作者名称和时间戳
4. WHEN User选择一个快照时，THE System SHALL显示该快照中变更的文件列表
5. THE System SHALL在500毫秒内返回包含最多100个commit的仓库的历史信息
6. IF Time Vault没有快照，THEN THE System SHALL显示空状态消息，引导User创建第一个快照

### 需求 5: 回滚到之前的版本

**用户故事:** 作为用户，我希望能将时光库恢复到任何之前的快照，以便从错误中恢复或探索早期版本。

#### 验收标准

1. WHEN User选择快照并请求回滚时，THE System SHALL显示警告对话框，说明未保存的更改将被覆盖
2. THE System SHALL建议在继续回滚之前创建当前状态的快照
3. WHEN User确认回滚时，THE System SHALL执行git checkout以恢复所选快照
4. WHEN 回滚成功完成时，THE System SHALL显示成功通知
5. IF 回滚失败，THEN THE System SHALL显示包含具体失败原因的错误消息，并使Time Vault保持在之前的状态

### 需求 6: 创建分支

**用户故事:** 作为用户，我希望能从当前状态创建新分支，以便在不影响主版本的情况下进行实验性更改。

#### 验收标准

1. WHEN User请求创建分支时，THE System SHALL提示输入分支名称
2. THE System SHALL验证分支名称在Time Vault内是唯一的
3. WHEN User提供有效的分支名称时，THE System SHALL执行git branch创建新分支
4. THE System SHALL在创建后自动切换到新创建的分支
5. IF 由于无效名称或其他错误导致分支创建失败，THEN THE System SHALL显示包含具体失败原因的错误消息

### 需求 7: 在分支间切换

**用户故事:** 作为用户，我希望能在时光库的不同分支之间切换，以便处理项目的不同版本。

#### 验收标准

1. WHEN User请求查看可用分支时，THE System SHALL执行git branch并显示所有分支
2. THE System SHALL指示当前活动的分支
3. WHEN User选择不同的分支时，THE System SHALL执行git switch切换到该分支
4. WHEN 分支切换成功完成时，THE System SHALL更新UI以反映新的当前分支
5. IF 分支切换失败，THEN THE System SHALL显示错误消息并保持在当前分支

### 需求 8: 合并分支

**用户故事:** 作为用户，我希望能将实验分支的更改合并回主分支，以便整合成功的实验成果。

#### 验收标准

1. WHILE User在非主分支上时，THE System SHALL在历史查看器中显示"合并到主版本"按钮
2. WHEN User请求合并时，THE System SHALL显示将要合并的更改预览
3. WHEN User确认合并时，THE System SHALL执行git merge以整合更改
4. IF 合并完成且无冲突，THEN THE System SHALL显示成功通知
5. IF 合并遇到冲突，THEN THE System SHALL显示清晰的消息解释冲突并提供指导
6. THE System SHALL确保在执行合并之前User已切换到目标分支

### 需求 9: 后端API通信

**用户故事:** 作为前端开发者，我希望有一个可靠的本地HTTP API，以便GUI能与后端服务通信。

#### 验收标准

1. THE Backend Service SHALL在127.0.0.1:8765上监听HTTP请求
2. THE Backend Service SHALL以JSON格式返回响应，具有包含成功状态和数据或错误字段的一致结构
3. WHEN API请求成功时，THE Backend Service SHALL返回HTTP状态200，success为true以及相关数据
4. WHEN API请求失败时，THE Backend Service SHALL返回适当的HTTP状态码，success为false以及描述性错误消息
5. THE Backend Service SHALL接受Repository Path作为所有仓库特定操作的参数

### 需求 10: 性能标准

**用户故事:** 作为用户，我希望应用程序能快速响应我的操作，以便我能高效工作而不会有延迟。

#### 验收标准

1. THE System SHALL在200毫秒内响应所有UI交互
2. THE System SHALL在1秒内完成包含最多1000个小文件（每个1KB）的文件夹的仓库初始化
3. THE System SHALL在修改最多10个文件后的500毫秒内检索仓库状态
4. THE System SHALL在500毫秒内检索包含最多100个commit的仓库的历史记录
5. WHEN 执行长时间运行的Git操作时，THE System SHALL向User显示加载指示器
