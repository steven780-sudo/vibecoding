# Chronos v2.0 优化功能 - 手动测试清单

**测试日期**: 2025-11-02  
**测试版本**: v2.0.0 (优化后)

---

## ⚠️ 重要提示

如果你看不到新功能，请执行以下操作：

### 1. 强制刷新浏览器
- **Chrome/Edge**: `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)
- **清除缓存**: 打开开发者工具 → Network → 勾选 "Disable cache"

### 2. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl + C)
# 然后重新启动
npm run dev
```

### 3. 检查代码是否真的存在
```bash
# 检查新组件是否存在
ls -la src/client/src/components/HelpDrawer.tsx
ls -la src/client/src/components/ReleaseNotesDrawer.tsx

# 检查 HomePage 是否有版权信息
grep "Copyright" src/client/src/pages/HomePage.tsx

# 检查 HomePage 是否有最近使用记录
grep "最近使用" src/client/src/pages/HomePage.tsx

# 检查 RepositoryPage 是否导入了新组件
grep "ReleaseNotesDrawer\|HelpDrawer" src/client/src/pages/RepositoryPage.tsx
```

---

## 📋 测试清单

### ✅ 首页功能

#### 1. 版权信息
- [ ] 打开首页 http://localhost:5173
- [ ] 查看右上角是否显示 "Copyright © sunshunda"
- [ ] 文字颜色是否为灰色
- [ ] 位置是否在右上角

**如果看不到**:
- 强制刷新浏览器 (Cmd + Shift + R)
- 检查代码: `grep -A 5 "Copyright" src/client/src/pages/HomePage.tsx`

---

#### 2. 最近使用记录
- [ ] 如果之前打开过仓库，应该看到"最近使用的时光机文件夹"
- [ ] 显示仓库路径列表
- [ ] 每个记录右侧有删除按钮（垃圾桶图标）
- [ ] 点击记录可以打开仓库
- [ ] 点击删除按钮会弹出确认对话框

**如果看不到**:
- 先打开一个仓库，然后返回首页
- 检查代码: `grep -A 10 "最近使用" src/client/src/pages/HomePage.tsx`
- 检查 API: 打开 http://localhost:3000/api/repository/recent

---

### ✅ 仓库页面功能

#### 3. 软件更新说明按钮
- [ ] 打开一个仓库
- [ ] 顶部工具栏是否有"软件更新说明"按钮
- [ ] 点击按钮，右侧是否打开抽屉
- [ ] 抽屉中是否显示版本历史（v2.0.0, v1.2.0, v1.1.0, v1.0.0）
- [ ] 是否使用时间线展示

**如果看不到**:
- 检查代码: `grep -B 5 -A 5 "软件更新说明" src/client/src/pages/RepositoryPage.tsx`
- 检查组件: `cat src/client/src/components/ReleaseNotesDrawer.tsx | head -50`

---

#### 4. 使用说明按钮
- [ ] 顶部工具栏是否有"使用说明"按钮
- [ ] 点击按钮，右侧是否打开抽屉
- [ ] 抽屉中是否显示核心用法（4步）
- [ ] 是否显示功能按钮说明（6个）
- [ ] 是否显示联系方式

**如果看不到**:
- 检查代码: `grep -B 5 -A 5 "使用说明" src/client/src/pages/RepositoryPage.tsx`
- 检查组件: `cat src/client/src/components/HelpDrawer.tsx | head -50`

---

#### 5. 历史记录展开详情
- [ ] 查看历史记录列表
- [ ] 最新记录是否有"最新"绿色标签
- [ ] 如果提交消息有多行，是否显示"展开详情 ▼"标签
- [ ] 点击记录，是否展开显示完整消息
- [ ] 展开后是否显示"收起详情 ▲"
- [ ] 再次点击是否收起

**如果看不到**:
- 检查代码: `grep -A 20 "展开详情" src/client/src/components/HistoryViewer.tsx`
- 创建一个多行提交消息测试

---

#### 6. Git ID 优化
- [ ] 查看历史记录
- [ ] 每条记录是否显示身份证图标（IdcardOutlined）
- [ ] 是否显示 "ID:" 文字
- [ ] ID 是否使用 Tag 组件显示

**如果看不到**:
- 检查代码: `grep -A 5 "IdcardOutlined" src/client/src/components/HistoryViewer.tsx`

---

#### 7. 文件状态标识
- [ ] 修改一个文件
- [ ] 刷新页面
- [ ] 修改的文件是否显示黄色圆点 ● 和 [修改] 标签
- [ ] 新增文件是否显示绿色圆点 ● 和 [新增] 标签
- [ ] 删除文件是否显示红色圆点 ● 和 [删除] 标签

**如果看不到**:
- 检查代码: `grep -A 20 "getStatusIcon" src/client/src/components/FileTree.tsx`

---

#### 8. 文件树展开/折叠
- [ ] 文件夹是否默认折叠
- [ ] 点击文件夹是否可以展开
- [ ] 再次点击是否可以折叠
- [ ] 文件夹图标是否会变化（FolderOutlined ↔ FolderOpenOutlined）

**如果看不到**:
- 检查代码: `grep -A 10 "expandedKeys" src/client/src/components/FileTree.tsx`

---

## 🔍 调试步骤

### 1. 检查浏览器 Console
打开开发者工具 (F12)，查看 Console 是否有错误

### 2. 检查 Network
查看 Network 标签，确认 API 请求是否成功：
- `/api/repository/recent` - 最近使用记录
- `/api/repository/log` - 历史记录
- `/api/repository/status` - 仓库状态

### 3. 检查 React DevTools
安装 React DevTools 扩展，查看组件树：
- HomePage 组件是否有 recentRepos 状态
- RepositoryPage 组件是否有 helpDrawerVisible 和 releaseNotesVisible 状态
- HistoryViewer 组件是否有 expandedIds 状态

### 4. 检查文件是否真的被修改
```bash
# 查看最近修改的文件
ls -lt src/client/src/pages/*.tsx | head -5
ls -lt src/client/src/components/*.tsx | head -10

# 查看文件修改时间
stat -f "%Sm %N" src/client/src/pages/HomePage.tsx
stat -f "%Sm %N" src/client/src/pages/RepositoryPage.tsx
stat -f "%Sm %N" src/client/src/components/HistoryViewer.tsx
```

---

## 🐛 常见问题

### Q1: 看不到任何新功能
**A**: 
1. 强制刷新浏览器 (Cmd + Shift + R)
2. 清除浏览器缓存
3. 重启开发服务器
4. 检查代码是否真的被修改

### Q2: 最近使用记录不显示
**A**: 
1. 先打开一个仓库
2. 返回首页
3. 应该就能看到记录了

### Q3: 抽屉打不开
**A**: 
1. 检查 Console 是否有错误
2. 检查组件是否正确导入
3. 检查状态管理是否正常

### Q4: 文件状态标识不显示
**A**: 
1. 确保文件有变更（修改、新增或删除）
2. 刷新页面
3. 检查 Git 状态

---

## 📊 测试结果记录

请在测试后填写：

### 首页功能
- [ ] 版权信息: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] 最近使用记录: ✅ 正常 / ❌ 异常 / ⚠️ 未测试

### 仓库页面功能
- [ ] 软件更新说明: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] 使用说明: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] 历史记录展开: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] Git ID 优化: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] 文件状态标识: ✅ 正常 / ❌ 异常 / ⚠️ 未测试
- [ ] 文件树展开/折叠: ✅ 正常 / ❌ 异常 / ⚠️ 未测试

### 发现的问题
（请在这里记录发现的任何问题）

---

**测试完成时间**: _____________  
**测试人员**: _____________
