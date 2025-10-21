# Chronos 脚本文件说明

本目录包含 Chronos 项目的所有脚本文件。

---

## 📜 脚本列表

### 🚀 开发脚本

#### `start-dev.sh`
**用途**: 启动开发环境（Backend + Frontend）

**使用方法**:
```bash
./scripts/start-dev.sh
```

**功能**:
- 启动 Backend 服务器（端口 8765）
- 启动 Frontend 开发服务器（端口 5173）
- 自动重载代码更改

**访问地址**:
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8765
- API 文档: http://127.0.0.1:8765/docs

---

#### `start_tauri.sh`
**用途**: 启动 Tauri 桌面应用（规划中）

**使用方法**:
```bash
./scripts/start_tauri.sh
```

**状态**: 🚧 开发中

---

### ⚙️ 安装脚本

#### `setup.sh`
**用途**: 一键安装项目依赖

**使用方法**:
```bash
./scripts/setup.sh
```

**功能**:
- 创建 Python 虚拟环境
- 安装 Backend 依赖（requirements.txt）
- 安装 Frontend 依赖（package.json）
- 验证环境配置

**前置要求**:
- Python 3.10+
- Node.js 18+
- Git

---

#### `verify_setup.sh`
**用途**: 验证环境配置是否正确

**使用方法**:
```bash
./scripts/verify_setup.sh
```

**检查项**:
- ✅ Python 版本
- ✅ Node.js 版本
- ✅ Git 版本
- ✅ 虚拟环境
- ✅ 依赖安装

---

### 🔍 质量检查脚本

#### `check-quality.sh`
**用途**: 运行所有代码质量检查

**使用方法**:
```bash
./scripts/check-quality.sh
```

**检查项**:

**Backend**:
- ✅ Black 代码格式化
- ✅ Ruff 代码检查
- ✅ Pytest 单元测试

**Frontend**:
- ✅ Prettier 代码格式化
- ✅ ESLint 代码检查
- ✅ TypeScript 类型检查
- ✅ Vitest 单元测试

**建议**: 在提交代码前运行此脚本

---

### 🧪 测试脚本

#### `test_fix.sh`
**用途**: 测试修复脚本（开发调试用）

**使用方法**:
```bash
./scripts/test_fix.sh
```

**状态**: 🔧 开发工具

---

### 🎨 工具脚本

#### `generate_icons.py`
**用途**: 生成应用图标（Tauri 用）

**使用方法**:
```bash
python scripts/generate_icons.py
```

**功能**:
- 生成不同尺寸的应用图标
- 用于 Tauri 桌面应用

**状态**: 🚧 规划中

---

## 🔧 脚本使用技巧

### 给脚本添加执行权限

如果脚本无法执行，运行：

```bash
chmod +x scripts/*.sh
```

### 从项目根目录运行

所有脚本都应该从项目根目录运行：

```bash
# 正确 ✅
./scripts/start-dev.sh

# 错误 ❌
cd scripts && ./start-dev.sh
```

### 查看脚本内容

如果想了解脚本的具体实现：

```bash
cat scripts/start-dev.sh
```

---

## 📝 脚本开发规范

### 命名规范

- 使用小写字母和连字符
- 描述性命名（如 `start-dev.sh` 而不是 `run.sh`）
- Python 脚本使用下划线（如 `generate_icons.py`）

### 文件头注释

每个脚本应包含：
```bash
#!/bin/bash
# 脚本名称和用途
# 作者和日期
```

### 错误处理

- 使用 `set -e` 在错误时退出
- 提供清晰的错误消息
- 检查前置条件

### 用户友好

- 显示进度信息
- 使用颜色区分不同类型的消息
- 提供使用说明

---

## 🐛 故障排除

### 脚本无法执行

**问题**: `Permission denied`

**解决**:
```bash
chmod +x scripts/start-dev.sh
```

---

### Python 虚拟环境问题

**问题**: `venv not found`

**解决**:
```bash
./scripts/setup.sh
```

---

### 端口被占用

**问题**: `Address already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :8765
lsof -i :5173

# 终止进程
kill -9 <PID>
```

---

## 📚 相关文档

- [安装指南](../docs/user/INSTALLATION_GUIDE.md)
- [开发指南](../README.md#-开发指南)
- [故障排除](../docs/user/FAQ.md)
- [项目说明](../README.md)

---

## 🤝 贡献

如果你想添加新的脚本或改进现有脚本：

1. 遵循命名规范
2. 添加清晰的注释
3. 更新本 README
4. 测试脚本功能
5. 提交 Pull Request

---

**最后更新**: 2025-10-21
