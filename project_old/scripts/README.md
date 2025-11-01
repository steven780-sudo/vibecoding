# Chronos 脚本工具

本目录包含 Chronos 项目的实用脚本。

## 📋 脚本列表

### 环境配置

#### `setup.sh`
**用途**: 一键安装和配置开发环境

**功能**:
- 创建 Python 虚拟环境
- 安装 Backend 依赖
- 安装 Frontend 依赖
- 验证环境配置

**使用方法**:
```bash
./scripts/setup.sh
```

#### `verify_setup.sh`
**用途**: 验证开发环境是否正确配置

**检查项**:
- Python 版本和依赖
- Node.js 版本和依赖
- Git 版本
- 端口可用性

**使用方法**:
```bash
./scripts/verify_setup.sh
```

### 开发运行

#### `start-dev.sh`
**用途**: 启动开发环境（Backend + Frontend）

**功能**:
- 启动 Backend 服务（端口 8765）
- 启动 Frontend 服务（端口 5173）
- 后台运行，输出日志

**使用方法**:
```bash
./scripts/start-dev.sh
```

**访问地址**:
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8765
- API 文档: http://127.0.0.1:8765/docs

#### `stop-dev.sh`
**用途**: 停止所有开发服务

**功能**:
- 停止 Backend 服务
- 停止 Frontend 服务
- 清理残留进程

**使用方法**:
```bash
./scripts/stop-dev.sh
```

#### `start_tauri.sh`
**用途**: 启动 Tauri 桌面应用开发模式

**功能**:
- 启动 Backend 服务
- 启动 Tauri 开发窗口
- 热重载支持

**使用方法**:
```bash
./scripts/start_tauri.sh
```

### 代码质量

#### `check-quality.sh`
**用途**: 运行所有代码质量检查

**检查项**:
- Backend: Black 格式化、Ruff 检查、Pytest 测试
- Frontend: Prettier 格式化、ESLint 检查、TypeScript 检查、Vitest 测试

**使用方法**:
```bash
./scripts/check-quality.sh
```

### 工具脚本

#### `generate_icons.py`
**用途**: 生成 Tauri 应用图标

**功能**:
- 从源图片生成多种尺寸的图标
- 生成 macOS、Windows、Linux 所需的图标格式

**使用方法**:
```bash
python scripts/generate_icons.py
```

## 🔧 脚本使用技巧

### 首次使用

1. 运行环境配置：
```bash
./scripts/setup.sh
```

2. 验证环境：
```bash
./scripts/verify_setup.sh
```

3. 启动开发：
```bash
./scripts/start-dev.sh
```

### 日常开发

```bash
# 启动开发环境
./scripts/start-dev.sh

# 代码质量检查
./scripts/check-quality.sh

# 停止服务
./scripts/stop-dev.sh
```

### Tauri 开发

```bash
# 启动 Tauri 开发模式
./scripts/start_tauri.sh

# 或者使用 npm 命令
cd frontend
npm run tauri:dev
```

## 📝 注意事项

1. **权限问题**: 如果脚本无法执行，添加执行权限：
   ```bash
   chmod +x scripts/*.sh
   ```

2. **端口占用**: 如果端口被占用，先停止服务：
   ```bash
   ./scripts/stop-dev.sh
   ```

3. **Python 虚拟环境**: Backend 脚本需要激活虚拟环境：
   ```bash
   cd backend
   source venv/bin/activate
   ```

4. **Node 依赖**: Frontend 脚本需要先安装依赖：
   ```bash
   cd frontend
   npm install
   ```

## 🐛 故障排除

### 脚本无法执行
```bash
# 添加执行权限
chmod +x scripts/*.sh
```

### 端口已被占用
```bash
# 查看占用端口的进程
lsof -i :8765  # Backend
lsof -i :5173  # Frontend

# 停止服务
./scripts/stop-dev.sh
```

### Python 依赖问题
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Node 依赖问题
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

**最后更新**: 2025-10-22
