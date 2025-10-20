# Chronos 安装指南

欢迎使用Chronos - 本地文件时光机！本指南将帮助你快速安装和配置Chronos。

## 系统要求

### 操作系统
- macOS 10.13 或更高版本

### 必需软件
- **Git**: 版本 2.0 或更高
- **Python**: 版本 3.10 或更高
- **Node.js**: 版本 18.0 或更高
- **npm**: 版本 9.0 或更高

## 检查系统环境

在安装之前，请先检查你的系统是否满足要求：

```bash
# 检查Git版本
git --version
# 应该显示: git version 2.x.x

# 检查Python版本
python3 --version
# 应该显示: Python 3.10.x 或更高

# 检查Node.js版本
node --version
# 应该显示: v18.x.x 或更高

# 检查npm版本
npm --version
# 应该显示: 9.x.x 或更高
```

## 安装步骤

### 1. 获取源代码

从GitHub克隆项目：

```bash
git clone https://github.com/steven780-sudo/vibecoding.git
cd vibecoding
```

### 2. 运行自动安装脚本

Chronos提供了一键安装脚本，会自动完成所有配置：

```bash
chmod +x setup.sh
./setup.sh
```

安装脚本会自动完成以下操作：
- ✅ 创建Python虚拟环境
- ✅ 安装Backend依赖
- ✅ 安装Frontend依赖
- ✅ 验证所有依赖是否正确安装

### 3. 验证安装

安装完成后，你应该看到类似以下的成功消息：

```
✅ Backend依赖安装成功
✅ Frontend依赖安装成功
🎉 Chronos安装完成！

下一步：
  运行开发服务器: ./start-dev.sh
  运行代码质量检查: ./check-quality.sh
```

## 手动安装（可选）

如果自动安装脚本遇到问题，你可以手动安装：

### Backend安装

```bash
# 进入backend目录
cd backend

# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 验证安装
python -c "import fastapi; print('FastAPI安装成功')"
```

### Frontend安装

```bash
# 进入frontend目录
cd frontend

# 安装依赖
npm install

# 验证安装
npm list react
```

## 配置Git用户信息

Chronos使用Git进行版本控制，请确保已配置Git用户信息：

```bash
# 检查当前配置
git config --global user.name
git config --global user.email

# 如果未配置，请设置
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"
```

## 启动应用

安装完成后，启动Chronos：

```bash
./start-dev.sh
```

启动成功后：
- Backend服务运行在: `http://127.0.0.1:8765`
- Frontend界面访问: `http://localhost:5173`

在浏览器中打开 `http://localhost:5173` 即可开始使用Chronos！

## 常见安装问题

### 问题1: Python版本过低

**错误信息**: `Python 3.10 or higher is required`

**解决方案**:
```bash
# macOS使用Homebrew安装最新Python
brew install python@3.11

# 验证版本
python3 --version
```

### 问题2: Node.js版本过低

**错误信息**: `Node.js version 18 or higher is required`

**解决方案**:
```bash
# 使用nvm安装最新Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 验证版本
node --version
```

### 问题3: 权限错误

**错误信息**: `Permission denied`

**解决方案**:
```bash
# 给脚本添加执行权限
chmod +x setup.sh
chmod +x start-dev.sh
chmod +x check-quality.sh
```

### 问题4: 端口被占用

**错误信息**: `Port 8765 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8765

# 终止该进程
kill -9 <PID>

# 或者修改Backend端口
# 编辑 backend/main.py，修改端口号
```

### 问题5: npm安装失败

**错误信息**: `npm ERR! code EACCES`

**解决方案**:
```bash
# 清理npm缓存
npm cache clean --force

# 重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 卸载Chronos

如果需要卸载Chronos：

```bash
# 删除项目目录
cd ..
rm -rf vibecoding

# 如果需要，也可以删除Git配置
git config --global --unset user.name
git config --global --unset user.email
```

## 更新Chronos

获取最新版本：

```bash
# 进入项目目录
cd vibecoding

# 拉取最新代码
git pull origin main

# 重新安装依赖
./setup.sh
```

## 下一步

安装完成后，请查看：
- [使用教程](./USER_GUIDE.md) - 学习如何使用Chronos
- [常见问题](./FAQ.md) - 查找常见问题的解决方案

## 获取帮助

如果遇到安装问题：
1. 查看本文档的"常见安装问题"部分
2. 查看[常见问题解答](./FAQ.md)
3. 在GitHub上提交Issue: https://github.com/steven780-sudo/vibecoding/issues

祝你使用愉快！🎉
