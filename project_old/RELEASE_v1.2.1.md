# Chronos v1.2.1 发布说明 - 错误处理优化版

**发布日期**: 2025-11-01  
**版本**: v1.2.1  
**安装包**: Chronos_v1.2.1_macOS.dmg (17MB)  
**平台**: macOS (Apple Silicon)

---

## 🎯 本次更新

这是一个紧急修复版本，主要解决了 v1.2.0 中的两个关键问题。

---

## 🐛 Bug修复

### 1. 修复后端启动失败问题 ✅

**问题描述**：
- v1.2.0 安装包中，后端服务无法启动
- 应用显示"后端服务启动失败"错误
- 原因：Rust 代码使用了错误的路径解析方式

**修复方案**：
- 改用 Tauri 2.0 推荐的 sidecar API
- 使用 `shell.sidecar("backend")` 自动处理路径
- 添加进程生命周期管理

**修复代码**：
```rust
// 旧代码（有问题）
let backend_path = app
    .path()
    .resolve(format!("binaries/{}", backend_name), BaseDirectory::Resource)
    .expect("failed to resolve backend binary");

// 新代码（正确）
let shell = app.shell();
match shell.sidecar("backend") {
    Ok(sidecar) => {
        match sidecar.spawn() {
            Ok(child) => { /* 启动成功 */ }
            Err(e) => { /* 错误处理 */ }
        }
    }
}
```

**影响**：
- ✅ 后端服务现在可以正常启动
- ✅ 应用可以正常使用所有功能
- ✅ 更符合 Tauri 2.0 最佳实践

---

### 2. 修复错误提示不准确问题 ✅

**问题描述**：
- 所有包含 "Not Found" 的错误都显示为"资源不存在！"
- 用户无法看到具体的错误原因
- 例如："不是Git仓库: /path" 也被转换成"资源不存在！"

**修复方案**：
- 改进错误消息匹配逻辑
- 只有通用错误才转换为友好提示
- 具体错误信息原样显示

**修复代码**：
```typescript
// 旧代码（有问题）
if (message.includes('404') || message.includes('Not Found')) {
  return '资源不存在！'  // 所有包含 "Not Found" 的都转换
}

// 新代码（正确）
if (message === 'Not Found') {  // 精确匹配
  return '资源不存在！'
}
// 其他情况返回原始错误消息
return message
```

**影响**：
- ✅ 用户可以看到具体的错误原因
- ✅ 更容易定位和解决问题
- ✅ 错误提示更加准确

**示例对比**：

| 后端错误 | v1.2.0 显示 | v1.2.1 显示 |
|---------|------------|------------|
| "Not Found" | 资源不存在！ | 资源不存在！ |
| "不是Git仓库: /path" | 资源不存在！❌ | 不是Git仓库: /path ✅ |
| "文件不存在: file.txt" | 资源不存在！❌ | 文件不存在: file.txt ✅ |

---

### 3. 优化 API 错误处理 ✅

**改进**：
- 添加对 FastAPI `detail` 字段的支持
- 改进错误消息提取逻辑

**修复代码**：
```typescript
// client.ts
if (!response.ok) {
  // FastAPI的HTTPException返回格式是 {detail: "错误信息"}
  const errorMsg = data.error || data.message || data.detail || `HTTP错误: ${response.status}`
  throw new Error(errorMsg)
}
```

---

## 📊 技术改进

### 后端启动机制
- 使用 Tauri sidecar API（推荐方式）
- 自动处理跨平台路径差异
- 添加进程清理逻辑（窗口关闭时）

### 错误处理流程
```
后端错误 → FastAPI返回 → 前端API客户端 → 组件错误处理 → 用户看到
HTTPException  {detail: "..."}  throw Error()   getErrorMessage()  具体错误信息
```

---

## 🔄 从 v1.2.0 升级

1. 卸载旧版本（可选）
2. 安装 `Chronos_v1.2.1_macOS.dmg`
3. 首次打开时右键选择"打开"
4. 开始使用

**注意**：
- 不会影响现有的时光机文件夹
- 所有数据和历史记录保持不变

---

## 📦 安装说明

1. 下载 `Chronos_v1.2.1_macOS.dmg`
2. 双击打开dmg文件
3. 将Chronos拖入Applications文件夹
4. 首次打开时，右键点击应用选择"打开"（绕过macOS安全检查）
5. 开始使用！

**系统要求**：
- macOS 10.13 或更高版本
- Apple Silicon (M1/M2/M3) 或 Intel芯片
- 需要安装Git（`brew install git`）

---

## 🔍 调试信息

如果遇到问题，可以查看控制台日志：
1. 打开应用
2. 按 `Cmd + Option + I` 打开开发者工具
3. 查看 Console 标签页
4. 查找以下日志：
   - `🏥 后端健康状态`
   - `📡 API请求`
   - `❌ API错误`

---

## 📝 已知问题

1. **Git依赖**：用户需要自己安装Git
   - 计划在 v1.3 中内置Git，无需用户安装

2. **平台支持**：目前仅支持 macOS
   - 计划在 v1.4-v1.5 支持 Windows 和 Linux

---

## 🚀 下一步计划

### v1.3 - 内置Git（最高优先级）
- 内置Git二进制文件，无需用户安装
- 开箱即用的完整体验

### v1.4 - 文件整理助手
- 智能识别相似文件
- 批量整理历史版本文件
- 可视化文件分组

---

## 🙏 致谢

感谢用户的耐心测试和反馈！

---

**感谢使用 Chronos！**

如有问题或建议，请联系：sunshunda@gmail.com

**GitHub**: https://github.com/steven780-sudo/vibecoding

---

## 📋 完整更新日志

### v1.2.1 (2025-11-01)
- 🐛 修复后端启动失败问题（使用 Tauri sidecar API）
- 🐛 修复错误提示不准确问题（精确匹配错误消息）
- ✨ 优化 API 错误处理（支持 FastAPI detail 字段）
- 📝 改进错误日志输出

### v1.2.0 (2025-10-22)
- ✨ 文件树状展示
- ✨ 用户友好文案
- ✨ 使用说明和更新记录
- ✨ 返回首页功能
- ✨ 历史记录智能校验
- 🐛 修复 API 错误处理逻辑（v1.2.0 的修复不完整）

### v1.1.0 (2025-10-22)
- ✨ 系统文件自动忽略
- ✨ 最近使用仓库列表
- ✨ Tauri 桌面应用

### v1.0.0 (2025-10-21)
- 🎉 MVP 版本发布
- ✨ 基础版本管理功能
