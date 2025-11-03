# 文件整理助手 - 需求文档

## 简介

文件整理助手（File Organizer）是Chronos v2.0的一个新功能模块，旨在帮助用户清理和整理历史存量文件。通过智能识别相似文件、可视化展示和用户友好的交互流程，让用户能够高效地管理混乱的文件版本，并将整理后的文件无缝接入Chronos的版本管理系统。

## 术语表

- **File Organizer**: 文件整理助手，本功能的系统名称
- **Similarity Score**: 相似度分数，用于衡量两个文件的相似程度（0-100%）
- **File Group**: 文件组，基于相似度算法自动分组的相似文件集合
- **Staging Area**: 暂存区，用户选择保留的文件临时存放区域
- **Source Folder**: 源文件夹，用户选择进行扫描的原始文件夹
- **Target Folder**: 目标文件夹，用户选择保存整理后文件的目标位置
- **Chronos Repository**: 时光库，Chronos的版本管理仓库

## 需求

### 需求 1: 文件扫描与识别

**用户故事**: 作为用户，我希望能够扫描指定文件夹中的所有文件，以便发现可能需要整理的相似文件。

#### 验收标准

1. WHEN 用户选择一个源文件夹并点击"开始扫描"，THE File Organizer SHALL 扫描该文件夹中的所有文件并返回文件列表
2. WHERE 用户启用"包含子文件夹"选项，THE File Organizer SHALL 递归扫描所有子文件夹中的文件
3. WHERE 用户启用"忽略系统文件"选项，THE File Organizer SHALL 排除系统文件（如.DS_Store、Thumbs.db）
4. WHERE 用户启用"仅扫描文档文件"选项，THE File Organizer SHALL 仅扫描指定扩展名的文档文件
5. WHILE 扫描进行中，THE File Organizer SHALL 显示实时进度（已扫描文件数、进度百分比）

### 需求 2: 相似度计算与分组

**用户故事**: 作为用户，我希望系统能够自动识别相似的文件并进行分组，以便我快速找到同一文件的不同版本。

#### 验收标准

1. WHEN 扫描完成后，THE File Organizer SHALL 计算所有文件对之间的相似度分数
2. THE File Organizer SHALL 基于文件名相似度（权重60%）、文件大小接近度（权重20%）和修改时间接近度（权重20%）计算综合相似度
3. WHERE 两个文件的相似度分数大于80%，THE File Organizer SHALL 将它们归入同一个文件组
4. THE File Organizer SHALL 按相似度从高到低排序显示文件组
5. THE File Organizer SHALL 为每个文件组显示相似度百分比和文件数量

### 需求 3: 文件信息展示

**用户故事**: 作为用户，我希望能够查看每个文件的详细信息，以便做出准确的保留或删除决策。

#### 验收标准

1. THE File Organizer SHALL 为每个文件显示文件名、文件大小、创建时间和修改时间
2. WHEN 用户点击文件的"预览"按钮，THE File Organizer SHALL 显示文件内容预览（支持文本、图片、PDF等常见格式）
3. WHERE 用户选择两个文件，THE File Organizer SHALL 提供文件对比功能显示差异
4. THE File Organizer SHALL 使用图标区分不同文件类型（文档、图片、表格、压缩包等）
5. THE File Organizer SHALL 使用颜色标识文件状态（绿色=已选中、红色=待删除、黄色=高相似度、灰色=未处理）

### 需求 4: 暂存区管理

**用户故事**: 作为用户，我希望能够选择要保留的文件并放入暂存区，以便统一处理这些文件。

#### 验收标准

1. WHEN 用户勾选文件复选框，THE File Organizer SHALL 将该文件添加到暂存区
2. THE File Organizer SHALL 在界面右侧实时显示暂存区中的文件列表和总数量
3. THE File Organizer SHALL 显示暂存区文件的总大小
4. WHEN 用户点击"从暂存区移除"，THE File Organizer SHALL 将该文件从暂存区移除
5. THE File Organizer SHALL 提供"清空暂存区"功能一键移除所有暂存文件
6. THE File Organizer SHALL 提供组级别的"全选/全不选"功能
7. THE File Organizer SHALL 提供全局级别的"全选/全不选"功能
8. THE File Organizer SHALL 自动推荐并选中每个文件组中修改时间最新的文件

### 需求 5: 文件保存与导出

**用户故事**: 作为用户，我希望能够将暂存区的文件保存到指定位置，以便完成文件整理。

#### 验收标准

1. WHEN 用户点击"下一步：保存文件"，THE File Organizer SHALL 显示文件保存配置界面
2. THE File Organizer SHALL 允许用户选择"复制到新位置"或"移动到新位置"两种保存模式
3. THE File Organizer SHALL 允许用户通过文件选择器指定目标文件夹
4. THE File Organizer SHALL 提供"保持原文件名"和"统一重命名"两种命名规则
5. WHERE 用户选择"统一重命名"，THE File Organizer SHALL 允许用户指定前缀并自动添加序号
6. THE File Organizer SHALL 在保存前显示文件名预览
7. WHILE 保存进行中，THE File Organizer SHALL 显示实时进度（已保存文件数、进度百分比）
8. IF 目标位置已存在同名文件，THEN THE File Organizer SHALL 提示用户选择覆盖、跳过或重命名

### 需求 6: 原文件清理

**用户故事**: 作为用户，我希望能够安全地删除或归档不需要的原文件，以便释放存储空间。

#### 验收标准

1. WHEN 暂存区文件保存完成后，THE File Organizer SHALL 显示未添加到暂存区的文件列表
2. THE File Organizer SHALL 允许用户选择要删除的文件（默认全选）
3. THE File Organizer SHALL 提供三种清理选项：永久删除、移动到回收站、移动到归档文件夹
4. THE File Organizer SHALL 默认选择"移动到回收站"选项以确保安全性
5. WHERE 用户选择"移动到归档文件夹"，THE File Organizer SHALL 允许用户指定归档位置
6. WHEN 用户点击"确认删除"前，THE File Organizer SHALL 显示二次确认对话框
7. THE File Organizer SHALL 在确认对话框中显示警告信息："删除操作不可恢复"（仅针对永久删除）
8. WHILE 清理进行中，THE File Organizer SHALL 显示实时进度

### 需求 7: 整理报告与统计

**用户故事**: 作为用户，我希望在整理完成后看到统计报告，以便了解整理效果。

#### 验收标准

1. WHEN 整理流程完成后，THE File Organizer SHALL 显示整理完成界面
2. THE File Organizer SHALL 显示以下统计信息：扫描文件总数、相似文件组数、保存文件数、删除文件数、节省空间大小
3. THE File Organizer SHALL 提供"创建时光库"快捷入口，允许用户直接为整理后的文件夹创建Chronos仓库
4. THE File Organizer SHALL 允许用户导出整理报告为文本文件
5. THE File Organizer SHALL 记录整理历史，允许用户查看过往整理记录

### 需求 8: 撤销与恢复

**用户故事**: 作为用户，我希望能够撤销整理操作，以便在发现错误时恢复原状。

#### 验收标准

1. WHERE 用户选择"移动到新位置"模式，THE File Organizer SHALL 在整理完成后提供"撤销"功能
2. WHEN 用户点击"撤销"，THE File Organizer SHALL 将文件恢复到原始位置
3. THE File Organizer SHALL 在撤销操作前显示确认对话框
4. WHERE 用户选择"移动到回收站"或"移动到归档文件夹"，THE File Organizer SHALL 提供"恢复文件"功能
5. THE File Organizer SHALL 保留撤销记录30天

### 需求 9: 用户界面与交互

**用户故事**: 作为用户，我希望整个整理流程清晰直观，以便轻松完成文件整理。

#### 验收标准

1. THE File Organizer SHALL 使用步骤式向导界面（步骤1-4）引导用户完成整理流程
2. THE File Organizer SHALL 在顶部显示当前步骤和进度指示器
3. THE File Organizer SHALL 在每个步骤提供"上一步"和"下一步"按钮
4. THE File Organizer SHALL 在关键操作前提供确认对话框
5. THE File Organizer SHALL 使用响应式布局适配不同屏幕尺寸
6. THE File Organizer SHALL 在左侧显示文件分组列表（70%宽度），右侧显示暂存区（30%宽度）
7. THE File Organizer SHALL 支持拖拽操作将文件添加到暂存区
8. THE File Organizer SHALL 提供搜索和过滤功能快速定位文件

### 需求 10: 性能与可靠性

**用户故事**: 作为用户，我希望系统能够高效处理大量文件，以便快速完成整理任务。

#### 验收标准

1. THE File Organizer SHALL 在10秒内完成1000个文件的扫描
2. THE File Organizer SHALL 在5秒内完成1000个文件的相似度计算和分组
3. WHERE 扫描文件数超过5000个，THE File Organizer SHALL 显示性能警告并建议分批处理
4. IF 扫描或保存过程中发生错误，THEN THE File Organizer SHALL 记录错误日志并显示友好的错误提示
5. THE File Organizer SHALL 在操作失败时保持数据完整性，不丢失用户选择
6. THE File Organizer SHALL 支持中断和恢复功能，允许用户暂停和继续整理流程

### 需求 11: 与Chronos集成

**用户故事**: 作为用户，我希望整理后的文件能够无缝接入Chronos版本管理，以便继续使用版本控制功能。

#### 验收标准

1. WHEN 整理完成后，THE File Organizer SHALL 提供"创建时光库"选项
2. WHEN 用户点击"创建时光库"，THE File Organizer SHALL 自动为目标文件夹初始化Chronos仓库
3. THE File Organizer SHALL 将整理操作记录为初始快照的提交信息
4. THE File Organizer SHALL 在创建时光库后自动跳转到仓库管理界面
5. WHERE 目标文件夹已是Chronos仓库，THE File Organizer SHALL 提示用户并询问是否创建新快照

## 非功能性需求

### 性能要求

- 扫描速度：≥ 100 文件/秒
- 相似度计算：≥ 200 文件对/秒
- 界面响应时间：≤ 100ms
- 内存占用：≤ 500MB（处理10000个文件）

### 兼容性要求

- 支持macOS 10.15+、Windows 10+
- 支持常见文件格式：文档（.doc, .docx, .pdf, .txt）、图片（.jpg, .png, .psd）、表格（.xls, .xlsx）、压缩包（.zip, .rar）

### 安全性要求

- 所有文件操作必须有用户确认
- 默认使用安全的删除方式（回收站）
- 记录所有文件操作日志
- 提供撤销功能防止误操作

### 可用性要求

- 界面语言：中文
- 操作流程：≤ 4步完成整理
- 学习成本：首次使用无需教程即可完成整理
- 错误提示：清晰友好，提供解决方案

## 约束条件

1. 必须使用现有的Chronos技术栈（React + TypeScript + Ant Design）
2. 必须与现有的Chronos架构保持一致
3. 不能影响现有的时光库管理功能
4. 必须支持跨平台（macOS + Windows）
5. 文件操作必须使用Node.js fs模块确保安全性

## 未来扩展

1. 支持云端文件扫描和整理
2. AI辅助文件分类和命名建议
3. 批量文件格式转换
4. 文件内容相似度分析（不仅是文件名）
5. 整理模板和预设方案
6. 团队协作整理功能
