# Chronos MVP - 开发环境设置指南

## 项目结构

```
chronos/
├── backend/          # Python FastAPI 后端
│   ├── api/         # API 路由处理器
│   ├── models/      # 数据模型
│   ├── services/    # 业务逻辑
│   ├── tests/       # 测试文件
│   ├── main.py      # 应用入口
│   └── start.sh     # 启动脚本
├── frontend/         # React + TypeScript 前端
│   ├── src/
│   │   ├── api/     # API 客户端
│   │   ├── components/  # React 组件
│   │   ├── hooks/   # 自定义 Hooks
│   │   ├── tests/   # 测试文件
│   │   └── App.tsx  # 主应用组件
│   └── start.sh     # 启动脚本
└── docs/            # 项目文档
```

## 环境要求

- Python 3.10+
- Node.js 18+
- npm 或 yarn

## 安装步骤

### 1. 后端设置

```bash
# 创建虚拟环境
python3 -m venv backend/venv

# 激活虚拟环境
source backend/venv/bin/activate  # macOS/Linux
# 或
backend\venv\Scripts\activate  # Windows

# 安装依赖
pip install -r backend/requirements.txt
```

### 2. 前端设置

```bash
# 安装依赖
cd frontend
npm install
```

## 运行开发服务器

### 方式一：使用启动脚本（推荐）

```bash
# 启动后端（在一个终端窗口）
./backend/start.sh

# 启动前端（在另一个终端窗口）
./frontend/start.sh
```

### 方式二：手动启动

```bash
# 启动后端
cd backend
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8765 --reload

# 启动前端
cd frontend
npm run dev
```

## 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://127.0.0.1:8765
- **API 文档**: http://127.0.0.1:8765/docs

## 开发工具

### 后端代码质量检查

```bash
# 格式化代码
cd backend
./venv/bin/black .

# 检查代码规范
./venv/bin/ruff check .

# 运行测试
./venv/bin/pytest
```

### 前端代码质量检查

```bash
cd frontend

# 格式化代码
npm run format

# 检查代码规范
npm run lint

# 运行测试
npm run test
```

## 验证安装

### 1. 测试后端

```bash
# 运行后端测试
cd backend
./venv/bin/pytest -v

# 测试 API 端点
curl http://127.0.0.1:8765/
curl http://127.0.0.1:8765/health
```

预期输出：
```json
{"success":true,"data":{"message":"Chronos Backend is running","version":"1.0.0"}}
{"status":"healthy","service":"chronos-backend"}
```

### 2. 测试前端

```bash
# 运行前端测试
cd frontend
npm run test
```

### 3. 测试集成

1. 启动后端服务器
2. 启动前端服务器
3. 在浏览器中访问 http://localhost:5173
4. 应该看到 "Chronos - 文件时光机" 标题
5. 应该看到绿色的成功消息，表明前端成功连接到后端

## 常见问题

### 端口已被占用

如果 8765 或 5173 端口已被占用，可以修改：

- 后端：修改 `backend/start.sh` 中的 `--port` 参数
- 前端：修改 `frontend/vite.config.ts` 中的 `server.port`

### Python 版本问题

确保使用 Python 3.10 或更高版本：

```bash
python3 --version
```

### 依赖安装失败

尝试升级 pip：

```bash
pip install --upgrade pip
```

## Tauri 桌面应用

Chronos 现在是一个完整的桌面应用程序！

### 运行 Tauri 应用

```bash
# 使用便捷脚本
./start_tauri.sh

# 或手动启动
cd frontend
npm run tauri:dev
```

### 构建桌面应用

```bash
cd frontend
npm run tauri:build
```

这将生成可分发的桌面应用程序：
- macOS: `.dmg` 和 `.app`
- Windows: `.msi` 和 `.exe`  
- Linux: `.deb` 和 `.AppImage`

### 后端二进制文件

后端已打包为独立的可执行文件，会在 Tauri 应用启动时自动运行。

重新构建后端二进制：
```bash
cd backend
bash build_binary.sh
```

详细信息请参阅 `TAURI_INTEGRATION.md`

## 下一步

环境设置完成后，可以开始实现核心功能：

1. Git 封装服务 (backend/services/git_wrapper.py)
2. API 端点 (backend/api/)
3. 前端组件 (frontend/src/components/)

参考 `.kiro/specs/chronos-mvp/tasks.md` 查看完整的实施计划。
