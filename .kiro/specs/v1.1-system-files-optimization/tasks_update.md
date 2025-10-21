# 实现计划：v1.1 系统文件自动忽略优化

## 概述

本文档记录Chronos v1.1版本的迭代优化任务，主要解决UAT测试中发现的问题0：.DS_Store等隐藏文件需要自动添加到.gitignore中。

## 任务列表

- [x] 1. 实现.gitignore规则管理基础设施
- [x] 1.1 在GitWrapper类中添加默认规则常量
  - 在`backend/services/git_wrapper.py`顶部定义`GITIGNORE_RULES`字典
  - 包含四个类别：macOS、Windows、Linux、IDE
  - 定义`SYSTEM_FILE_PATTERNS`列表用于正则匹配
  - _需求: 1.2, 1.3, 1.4, 1.5_

- [x] 1.2 实现`_get_default_gitignore_rules()`方法
  - 读取.chronos配置中的`settings.gitignore.enabled_categories`
  - 根据配置返回对应类别的规则列表
  - 支持合并`settings.gitignore.custom_rules`自定义规则
  - 返回格式化的规则字符串列表
  - _需求: 1.1, 5.2, 5.3, 5.4_

- [x] 1.3 实现`_is_system_file()`静态方法
  - 接收文件路径参数
  - 使用`SYSTEM_FILE_PATTERNS`进行正则匹配
  - 支持文件名和路径匹配（如`.DS_Store`、`.vscode/`）
  - 返回布尔值
  - _需求: 4.1_

- [x] 2. 实现.gitignore文件创建和更新逻辑
- [x] 2.1 实现`_create_or_update_gitignore()`核心方法
  - 检查仓库根目录是否存在`.gitignore`文件
  - 如果不存在，创建新文件并写入默认规则
  - 如果存在且`settings.gitignore.smart_merge`为true，调用合并逻辑
  - 如果存在且smart_merge为false，保留原文件不修改
  - 返回操作结果字典：`{created, updated, rules_added}`
  - _需求: 1.1, 2.1, 2.2, 3.1, 3.2_

- [x] 2.2 实现智能合并逻辑`_merge_gitignore_rules()`辅助方法
  - 接收现有文件内容和新规则列表
  - 解析现有内容，提取已有规则（忽略注释和空行）
  - 使用集合（set）识别缺失的推荐规则
  - 在文件末尾追加缺失规则，添加`# Added by Chronos`注释
  - 避免添加重复规则
  - 返回合并后的完整内容
  - _需求: 3.1, 3.2, 3.3, 3.4_

- [x] 2.3 生成.gitignore文件模板内容
  - 创建`_generate_gitignore_template()`方法
  - 包含文件头注释（生成时间、Chronos标识）
  - 按类别分组规则（macOS、Windows、Linux、IDE）
  - 每个类别添加注释说明
  - 返回格式化的完整文件内容
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. 实现已追踪系统文件清理功能
- [x] 3.1 实现`_cleanup_tracked_system_files()`方法
  - 调用`get_tracked_files()`获取所有已追踪文件
  - 使用`_is_system_file()`筛选系统文件
  - 对每个系统文件执行`git rm --cached <file>`
  - 捕获单个文件失败的异常，不影响其他文件
  - 返回成功清理的文件路径列表
  - _需求: 4.1, 4.2, 4.3, 4.4_

- [x] 4. 集成到init_repository()流程
- [x] 4.1 修改`init_repository()`方法
  - 在执行`git init`和配置后，调用`_create_or_update_gitignore()`
  - 在创建初始提交前，调用`_cleanup_tracked_system_files()`
  - 将.gitignore操作结果添加到返回字典中
  - 处理可能的异常，记录警告但不阻止初始化
  - _需求: 1.1, 2.1, 4.1_

- [x] 4.2 更新.chronos配置文件结构
  - 在`init_repository()`中创建.chronos时添加gitignore配置
  - 默认配置：`auto_create: true, smart_merge: false`
  - 默认启用所有类别：`enabled_categories: ["macos", "windows", "linux", "ide"]`
  - 空的自定义规则列表：`custom_rules: []`
  - _需求: 5.1, 5.2, 5.4_

- [ ] 5. 编写单元测试
- [ ]* 5.1 测试默认规则获取功能
  - 测试`_get_default_gitignore_rules()`返回正确的规则
  - 测试不同enabled_categories配置的效果
  - 测试自定义规则合并
  - _需求: 1.1, 5.2, 5.3_

- [ ]* 5.2 测试系统文件检测功能
  - 测试`_is_system_file()`正确识别各类系统文件
  - 测试正常文件不被误判
  - 测试路径匹配（如`.vscode/settings.json`）
  - _需求: 4.1_

- [ ]* 5.3 测试.gitignore创建功能
  - 测试在新仓库中创建.gitignore
  - 测试保留现有.gitignore（smart_merge=false）
  - 测试智能合并模式（smart_merge=true）
  - 验证文件内容格式正确
  - _需求: 1.1, 2.1, 2.2, 3.1, 3.2_

- [ ]* 5.4 测试系统文件清理功能
  - 创建并追踪测试用的系统文件
  - 调用`_cleanup_tracked_system_files()`
  - 验证文件不再被追踪但仍存在于工作目录
  - 测试清理失败的容错处理
  - _需求: 4.1, 4.2, 4.3_

- [ ]* 5.5 测试完整初始化流程
  - 测试包含.gitignore创建的完整初始化
  - 验证.gitignore在初始提交中
  - 验证系统文件被正确清理
  - 测试初始化返回结果包含gitignore信息
  - _需求: 1.1, 2.1, 4.1_

- [x] 6. 更新API响应和文档
- [x] 6.1 更新init_repository API响应格式
  - 在`backend/api/repository.py`中更新响应模型
  - 添加gitignore操作结果字段
  - 更新API文档注释
  - _需求: 1.1_

- [x] 6.2 更新用户文档
  - 在`docs/user/USER_GUIDE.md`中添加.gitignore说明
  - 在`docs/user/FAQ.md`中添加系统文件相关FAQ
  - 说明如何自定义.gitignore规则
  - _需求: 1.1, 5.1_

- [x] 7. 验证和测试
- [x] 7.1 手动测试完整流程
  - 在干净的目录初始化仓库
  - 验证.gitignore文件被创建
  - 添加系统文件（如.DS_Store）
  - 验证系统文件不出现在git status中
  - _需求: 1.1, 4.1_

- [x] 7.2 测试已有仓库的兼容性
  - 在已有.gitignore的仓库测试
  - 验证原有配置不被破坏
  - 测试smart_merge模式
  - _需求: 2.1, 2.2, 3.1_

## 任务执行顺序建议

1. **第一阶段：基础设施** (任务1.1-1.3)
   - 先实现规则定义和基础工具方法
   - 这些是后续功能的基础

2. **第二阶段：核心功能** (任务2.1-2.3, 3.1)
   - 实现.gitignore创建和更新逻辑
   - 实现系统文件清理功能

3. **第三阶段：集成** (任务4.1-4.2)
   - 将功能集成到init_repository流程
   - 更新配置文件结构

4. **第四阶段：测试** (任务5.1-5.5)
   - 编写单元测试验证功能
   - 可选任务，但建议至少完成核心功能测试

5. **第五阶段：文档和验证** (任务6.1-7.2)
   - 更新API和用户文档
   - 进行手动测试验证

## 预期成果

完成所有任务后，Chronos将具备以下能力：

1. ✅ 自动创建包含跨平台规则的.gitignore文件
2. ✅ 智能保护用户已有的.gitignore配置
3. ✅ 可选的智能合并模式补充缺失规则
4. ✅ 自动清理已追踪的系统文件
5. ✅ 用户可通过.chronos配置自定义规则

## 相关文件

- `backend/services/git_wrapper.py` - 主要实现文件
- `backend/api/repository.py` - API接口更新
- `backend/tests/test_git_wrapper.py` - 单元测试
- `docs/user/USER_GUIDE.md` - 用户指南
- `docs/user/FAQ.md` - 常见问题

## 参考文档

- 需求文档：`.kiro/specs/v1.1-system-files-optimization/requirements.md`
- 设计文档：`.kiro/specs/v1.1-system-files-optimization/design.md`
- UAT优化建议：`docs/UAT/UAT_record/advice.md`
- 之前的Bug修复：`docs/bugfix/DS_STORE_FIX.md`
