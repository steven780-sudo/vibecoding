---
inclusion: always
---

# 技术栈与构建系统

## 架构

完全在用户本地机器上运行的客户端-服务器架构：
- **Frontend**: Tauri + React 18 + TypeScript + Vite
- **Backend**: Python 3.10+ + FastAPI
- **Core Engine**: Git CLI（通过subprocess封装）
- **UI Library**: Ant Design 5.x

## 通信

Frontend通过本地HTTP API在`127.0.0.1:8765`与Backend通信

## 代码质量工具

### Python
- **Formatter**: Black
- **Linter**: Ruff
- **Testing**: Pytest

### TypeScript/React
- **Formatter**: Prettier
- **Linter**: ESLint
- **Testing**: Vitest

## 常用命令

### Backend开发
```bash
# 安装依赖
pip install -r requirements.txt

# 运行后端服务器
python -m uvicorn main:app --reload --port 8765

# 格式化代码
black .

# 检查代码
ruff check .

# 运行测试
pytest
```

### Frontend开发
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 格式化代码
npm run format

# 检查代码
npm run lint

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## Git封装策略

所有版本控制操作都通过Python的`subprocess`模块执行Git CLI命令来完成。Backend解析Git的输出并向Frontend返回结构化的JSON。

示例模式：
```python
result = subprocess.run(
    ["git", "status", "--porcelain"],
    cwd=repo_path,
    capture_output=True,
    text=True
)
```

## 性能目标（MVP）

- 初始化：1000个小文件 < 1秒
- 状态检查：修改10个文件后 < 500毫秒
- 历史检索：100个commit < 500毫秒
- UI响应：所有交互 < 200毫秒
