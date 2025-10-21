# 需求文档：系统文件自动忽略优化

## 简介

本功能旨在优化Chronos时光库对系统隐藏文件的处理，自动将常见的系统文件（如`.DS_Store`、`Thumbs.db`等）添加到`.gitignore`中，避免这些文件被Git追踪，从而防止它们的动态变化影响版本控制和回滚功能。

## 术语表

- **System**: Chronos时光库应用程序
- **Repository**: 用户初始化的时光库（Git仓库）
- **System Files**: 操作系统自动生成的隐藏文件，如`.DS_Store`（macOS）、`Thumbs.db`（Windows）等
- **gitignore**: Git的忽略文件配置，用于指定不需要被版本控制追踪的文件

## 需求

### 需求 1：自动创建.gitignore文件

**用户故事**：作为Chronos用户，我希望在初始化时光库时，系统能自动创建`.gitignore`文件并包含常见的系统文件规则，这样我就不需要手动配置，也不会因为系统文件的变化而影响版本控制。

#### 验收标准

1. WHEN 用户初始化一个新的时光库，THE System SHALL 自动在仓库根目录创建`.gitignore`文件
2. THE `.gitignore`文件 SHALL 包含macOS系统文件的忽略规则（`.DS_Store`、`.AppleDouble`、`.LSOverride`等）
3. THE `.gitignore`文件 SHALL 包含Windows系统文件的忽略规则（`Thumbs.db`、`Desktop.ini`等）
4. THE `.gitignore`文件 SHALL 包含Linux系统文件的忽略规则（`*~`、`.directory`等）
5. THE `.gitignore`文件 SHALL 包含常见IDE配置文件的忽略规则（`.vscode/`、`.idea/`、`*.swp`等）

### 需求 2：保留现有.gitignore文件

**用户故事**：作为Chronos用户，如果我的项目已经有`.gitignore`文件，我希望系统不要覆盖它，而是保留我的自定义配置。

#### 验收标准

1. WHEN 用户初始化时光库且仓库根目录已存在`.gitignore`文件，THE System SHALL 保留现有的`.gitignore`文件内容
2. THE System SHALL NOT 覆盖或修改用户已有的`.gitignore`文件
3. THE System SHALL 在日志中记录检测到现有`.gitignore`文件的信息

### 需求 3：合并.gitignore规则（可选功能）

**用户故事**：作为Chronos用户，如果我的项目已经有`.gitignore`文件但缺少某些系统文件规则，我希望系统能智能地补充这些规则，而不影响我的现有配置。

#### 验收标准

1. WHERE 用户选择启用智能合并功能，WHEN 初始化时光库且已存在`.gitignore`文件，THE System SHALL 检查文件中是否包含推荐的系统文件规则
2. WHERE 用户选择启用智能合并功能，IF `.gitignore`文件缺少某些推荐规则，THE System SHALL 在文件末尾追加缺失的规则，并添加注释说明
3. THE System SHALL 在追加规则前添加分隔注释（如`# Added by Chronos`）
4. THE System SHALL 避免添加重复的规则

### 需求 4：清理已追踪的系统文件

**用户故事**：作为Chronos用户，如果我的仓库在添加`.gitignore`之前已经追踪了系统文件，我希望系统能帮我清理这些文件，让它们不再被追踪。

#### 验收标准

1. WHEN 用户初始化时光库且检测到已追踪的系统文件（如`.DS_Store`），THE System SHALL 提示用户这些文件已被追踪
2. WHERE 用户确认清理，THE System SHALL 执行`git rm --cached`命令移除这些文件的追踪状态
3. THE System SHALL 保留文件在工作目录中，仅移除Git追踪
4. THE System SHALL 在初始提交中包含`.gitignore`文件和清理操作

### 需求 5：用户可配置的忽略规则

**用户故事**：作为Chronos用户，我希望能在`.chronos`配置文件中自定义需要忽略的文件规则，以适应我的特定需求。

#### 验收标准

1. THE `.chronos`配置文件 SHALL 包含`gitignore_rules`配置项
2. THE System SHALL 在创建`.gitignore`时读取`.chronos`中的自定义规则
3. WHERE 用户在`.chronos`中定义了自定义规则，THE System SHALL 将这些规则添加到`.gitignore`文件中
4. THE System SHALL 提供默认的推荐规则列表，用户可以选择启用或禁用
