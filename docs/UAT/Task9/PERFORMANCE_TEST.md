# Chronos MVP 性能测试报告

## 测试环境

- **操作系统**: macOS
- **Python版本**: 3.13.1
- **Node.js版本**: 22.19.0
- **硬件**: [待填写]

## 性能目标（MVP）

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 初始化1000个文件 | < 1秒 | _待测试_ | ⏳ |
| 10个文件修改后状态检查 | < 500ms | _待测试_ | ⏳ |
| 100个commit历史加载 | < 500ms | _待测试_ | ⏳ |
| UI响应时间 | < 200ms | _待测试_ | ⏳ |

## 测试1: 初始化1000个文件

### 测试脚本

```bash
#!/bin/bash
# 创建测试仓库
TEST_DIR="/tmp/chronos-perf-test"
rm -rf $TEST_DIR
mkdir -p $TEST_DIR

# 创建1000个小文件
for i in {1..1000}; do
    echo "Test file $i" > "$TEST_DIR/file_$i.txt"
done

echo "Created 1000 files in $TEST_DIR"
```

### 测试步骤

1. 运行上述脚本创建1000个文件
2. 在Chronos中初始化该目录
3. 记录初始化时间

### 测试结果

**初始化时间**: _待测试_

**分析**:
- Git init操作本身很快（< 100ms）
- 主要时间在于Git添加文件到索引
- 预期时间：300-800ms

**优化建议**:
- 如果超过1秒，考虑批量添加文件
- 使用`git add .`而不是逐个添加

## 测试2: 10个文件修改后状态检查

### 测试脚本

```bash
#!/bin/bash
TEST_DIR="/tmp/chronos-perf-test"

# 修改10个文件
for i in {1..10}; do
    echo "Modified content $i" > "$TEST_DIR/file_$i.txt"
done

echo "Modified 10 files"
```

### 测试步骤

1. 在已初始化的仓库中修改10个文件
2. 点击"刷新"按钮
3. 记录状态检查时间

### 测试结果

**状态检查时间**: _待测试_

**分析**:
- `git status --porcelain`命令性能
- 网络请求往返时间
- UI渲染时间

**优化建议**:
- 如果超过500ms，考虑缓存状态
- 使用debounce减少频繁刷新

## 测试3: 100个commit历史加载

### 测试脚本

```bash
#!/bin/bash
TEST_DIR="/tmp/chronos-perf-test"
cd $TEST_DIR

# 创建100个commit
for i in {1..100}; do
    echo "Commit $i" > "commit_$i.txt"
    git add "commit_$i.txt"
    git commit -m "Commit $i"
done

echo "Created 100 commits"
```

### 测试步骤

1. 运行上述脚本创建100个commit
2. 在Chronos中打开该仓库
3. 记录历史加载时间

### 测试结果

**历史加载时间**: _待测试_

**分析**:
- `git log`命令性能
- JSON解析时间
- UI渲染时间（Timeline组件）

**优化建议**:
- 如果超过500ms，考虑分页加载
- 限制默认显示数量（如50个）
- 实现虚拟滚动

## 测试4: UI响应时间

### 测试场景

| 操作 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 点击按钮 | < 200ms | _待测试_ | ⏳ |
| 打开对话框 | < 200ms | _待测试_ | ⏳ |
| 切换分支 | < 200ms | _待测试_ | ⏳ |
| 刷新状态 | < 200ms | _待测试_ | ⏳ |

### 测试方法

使用浏览器开发者工具的Performance面板：
1. 开始录制
2. 执行操作
3. 停止录制
4. 分析时间线

### 测试结果

**按钮点击响应**: _待测试_
**对话框打开**: _待测试_
**分支切换**: _待测试_
**状态刷新**: _待测试_

**分析**:
- React渲染时间
- Ant Design组件性能
- 状态更新时间

**优化建议**:
- 使用React.memo减少不必要的渲染
- 使用useMemo和useCallback优化性能
- 考虑代码分割和懒加载

## 单元测试性能

### Backend测试

```bash
cd backend
source venv/bin/activate
time pytest tests/ -v
```

**测试时间**: 1.24秒（18个测试）
**平均每个测试**: ~69ms
**状态**: ✅ 优秀

### Frontend测试

```bash
cd frontend
time npm test
```

**测试时间**: 4.44秒（57个测试）
**平均每个测试**: ~78ms
**状态**: ✅ 良好

## 内存使用

### Backend内存

**启动时**: _待测试_
**处理1000个文件**: _待测试_
**100个commit**: _待测试_

### Frontend内存

**初始加载**: _待测试_
**显示100个commit**: _待测试_
**长时间运行**: _待测试_

## 网络性能

### API响应时间

| 端点 | 目标 | 实际 | 状态 |
|------|------|------|------|
| POST /repository/init | < 100ms | _待测试_ | ⏳ |
| GET /repository/status | < 100ms | _待测试_ | ⏳ |
| POST /repository/commit | < 200ms | _待测试_ | ⏳ |
| GET /repository/log | < 200ms | _待测试_ | ⏳ |
| GET /repository/branches | < 100ms | _待测试_ | ⏳ |

### 测试方法

使用curl测试API响应时间：
```bash
time curl -X POST http://127.0.0.1:8765/repository/init \
  -H "Content-Type: application/json" \
  -d '{"path": "/tmp/test-repo"}'
```

## 优化实施

### 已实施的优化

1. **React Hooks优化**
   - 使用useCallback避免不必要的函数重建
   - 使用useState管理局部状态

2. **API客户端优化**
   - 实现重试机制
   - 统一错误处理

3. **Git操作优化**
   - 直接使用Git CLI（最快）
   - 避免不必要的Git操作

### 待实施的优化

1. **分页加载**
   - 历史记录分页
   - 大文件列表分页

2. **缓存策略**
   - 状态缓存
   - 历史记录缓存

3. **虚拟滚动**
   - 大列表虚拟滚动
   - 减少DOM节点

4. **代码分割**
   - 路由级代码分割
   - 组件懒加载

## 性能监控

### 推荐工具

1. **Chrome DevTools**
   - Performance面板
   - Network面板
   - Memory面板

2. **React DevTools**
   - Profiler
   - Components树

3. **命令行工具**
   - `time`命令
   - `hyperfine`基准测试

## 总结

### 性能评估

**整体性能**: _待评估_

**优点**:
- ✅ 单元测试性能优秀
- ✅ 使用Git CLI保证核心性能
- ✅ React Hooks优化到位

**需要改进**:
- ⏳ 大文件列表性能
- ⏳ 历史记录加载性能
- ⏳ 内存使用优化

### 下一步

1. 完成所有性能测试
2. 根据测试结果实施优化
3. 建立性能基准
4. 持续监控性能指标

## 附录: 性能测试脚本

### 完整测试脚本

```bash
#!/bin/bash
# Chronos性能测试脚本

echo "🚀 Chronos性能测试"
echo ""

# 测试1: 初始化1000个文件
echo "测试1: 初始化1000个文件"
TEST_DIR="/tmp/chronos-perf-test-1"
rm -rf $TEST_DIR
mkdir -p $TEST_DIR

for i in {1..1000}; do
    echo "Test file $i" > "$TEST_DIR/file_$i.txt"
done

START=$(date +%s%N)
cd $TEST_DIR && git init && git add . && git commit -m "Initial"
END=$(date +%s%N)
TIME=$((($END - $START) / 1000000))
echo "  时间: ${TIME}ms"
echo ""

# 测试2: 状态检查
echo "测试2: 10个文件修改后状态检查"
for i in {1..10}; do
    echo "Modified $i" > "$TEST_DIR/file_$i.txt"
done

START=$(date +%s%N)
git status --porcelain
END=$(date +%s%N)
TIME=$((($END - $START) / 1000000))
echo "  时间: ${TIME}ms"
echo ""

# 测试3: 历史加载
echo "测试3: 100个commit历史加载"
TEST_DIR="/tmp/chronos-perf-test-2"
rm -rf $TEST_DIR
mkdir -p $TEST_DIR
cd $TEST_DIR && git init

for i in {1..100}; do
    echo "Commit $i" > "file_$i.txt"
    git add "file_$i.txt"
    git commit -m "Commit $i" > /dev/null
done

START=$(date +%s%N)
git log --pretty=format:'%H|%s|%an|%ad' --date=iso -n 100
END=$(date +%s%N)
TIME=$((($END - $START) / 1000000))
echo "  时间: ${TIME}ms"
echo ""

# 清理
rm -rf /tmp/chronos-perf-test-*
echo "✅ 测试完成"
```
