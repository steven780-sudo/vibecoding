UAT优化建议：
0. .DS_Store等隐藏文件需要添加到.ignore里面，不然每次都会动态变化，导致无法回滚
1. 目前只有服务启动的脚本，但是当用户需要终止服务时，没有脚本或者按钮来终止，需要增加。
2. 如果仓库已经初始化过，进入页面时输入仓库地址，点击初始化，并不会提示报错，而是继续进入。
3. 首页没有显示目前已经设置“远程仓库”的文件有哪些，用户无法选择进入，而是要输入路径地址，需要增加一个功能，供用户选择已创建的仓库，然后进入查看。
4. 进入第一个页面初始化仓库后，需要手动点击刷新，而无法自动刷新展示文件列表
5. 新建分支后需要手动切换分支，无法自动切换到新创建的分支


---

## 功能优化

### 6. 隐藏系统文件
**问题**: `.chronos` 等系统配置文件显示在"已追踪文件"列表中，用户不应该看到这些文件。

**发现时间**: 2025-10-21 场景1测试

**优先级**: 🟡 中等

**影响范围**:
- 已追踪文件列表
- 文件状态显示
- 快照创建时的文件选择

**建议方案**:
- 在 `get_tracked_files()` 方法中过滤以点开头的文件
- 在 `get_status()` 方法中过滤系统文件
- 系统文件应该自动包含在提交中，但不显示给用户

**技术实现**:
```python
# 在 backend/services/git_wrapper.py 中
def get_tracked_files(self) -> List[str]:
    files = self._run_git_command(["ls-files"]).stdout.splitlines()
    # 过滤隐藏文件（以点开头的文件，或路径中包含/.的文件）
    return [f for f in files if not f.startswith('.') and '/.' not in f]
```

**状态**: ⏳ 待修复（后续迭代）


### 7. 错误处理优化
**问题**: 输入无效路径时，没有显示友好的错误提示，而是直接跳转到错误页面显示"发生错误 400"。

**发现时间**: 2025-10-21 场景9.3测试

**优先级**: 🟡 中等

**影响范围**:
- 初始化仓库时的路径验证
- 用户体验和错误提示

**当前行为**:
- 输入 `/invalid/path/test`
- 点击"初始化时光库"
- 页面跳转到错误页面，显示"发生错误 400"

**期望行为**:
- 在当前页面显示友好的错误提示："路径不存在或无法访问"
- 不跳转页面
- 允许用户修正路径后重试

**建议方案**:
1. Frontend在API调用失败时捕获错误
2. 显示友好的错误消息（使用Ant Design的message组件）
3. 不跳转到错误页面
4. 可选：在输入框下方显示错误提示

**技术实现**:
```typescript
// 在 frontend/src/hooks/useRepository.ts 中
try {
  const result = await apiClient.initRepository(path);
  if (result.success) {
    message.success('时光库初始化成功');
  }
} catch (error) {
  // 捕获错误并显示友好提示
  if (error.response?.status === 400) {
    message.error('路径不存在或无法访问，请检查路径是否正确');
  } else {
    message.error('初始化失败，请重试');
  }
}
```

**状态**: ⏳ 待修复（后续迭代）


### 8. 重复初始化提示优化
**问题**: 在已初始化的文件夹再次点击"初始化时光库"时，没有显示任何提示信息。

**发现时间**: 2025-10-21 场景9.4测试

**优先级**: 🟢 低

**影响范围**:
- 初始化仓库功能
- 用户体验

**当前行为**:
- 在已初始化的文件夹点击"初始化时光库"
- 直接进入仓库页面
- 没有任何提示信息

**期望行为**:
- 检测到仓库已初始化
- 显示友好提示："该文件夹已经是时光库"
- 提供选项："继续使用"或"返回"

**建议方案**:
1. Backend已经返回 `already_initialized: true`
2. Frontend需要检查这个标志并显示提示
3. 使用Modal对话框提示用户

**技术实现**:
```typescript
// 在 frontend/src/hooks/useRepository.ts 中
const result = await apiClient.initRepository(path);
if (result.success) {
  if (result.data?.already_initialized) {
    Modal.info({
      title: '提示',
      content: '该文件夹已经是时光库，是否继续使用？',
      onOk: () => {
        message.info('继续使用现有时光库');
        // 刷新状态
      }
    });
  } else {
    message.success('时光库初始化成功');
  }
}
```

**状态**: ⏳ 待修复（后续迭代）
