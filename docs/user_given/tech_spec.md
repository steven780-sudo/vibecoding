# 技术规格文档 (Tech Spec): Chronos v0.1

## 1. 系统架构

### 1.1. 概述
Chronos采用前后端分离的C/S架构，但特殊之处在于其“服务器”和“客户端”均运行在用户的本地机器上。这种设计能清晰地分离业务逻辑和用户界面，便于独立开发和测试。

```mermaid
graph TD
    subgraph 用户电脑
        A[前端GUI <br> (Tauri/React)] --> B{本地HTTP API};
        B --> C[后端服务 <br> (Python/FastAPI)];
        C --> D[Git命令行工具];
        D --> E[.git 仓库 <br> (文件系统)];
    end
```

### 1.2. 组件说明
- **前端GUI (Tauri/React)**: 负责所有用户界面的渲染和交互。它是一个独立的原生窗口应用，不直接执行Git命令。它通过调用**本地HTTP API**与后端通信。
- **本地HTTP API**: 前后端之间的通信桥梁。前端通过发送HTTP请求（如GET, POST）到本地端口（如`http://127.0.0.1:8765`）来请求数据或执行操作。
- **后端服务 (Python/FastAPI)**: 负责处理所有业务逻辑。它接收前端的API请求，调用系统的Git命令行工具，解析其输出，并将结构化的数据（通常是JSON）返回给前端。
- **Git命令行工具**: 版本控制的核心引擎。后端服务通过`subprocess`等模块来执行`git`命令。
- **.git仓库**: 所有版本数据的实际存储位置，位于用户指定的“时光库”文件夹内。

---

## 2. 后端API设计 (FastAPI)

### 2.1. 通用约定
- **Host**: `127.0.0.1:8765`
- **通用成功响应**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **通用失败响应**:
  ```json
  {
    "success": false,
    "error": "具体的错误信息"
  }
  ```
- **路径参数**: 所有需要操作Git仓库的API，都将仓库的绝对路径作为查询参数`repo_path`传入。

### 2.2. 核心API端点

#### **`POST /repository/init`**
- **功能**: 初始化一个文件夹为“时光库”。
- **请求体**: `{"path": "/path/to/user/folder"}`
- **成功响应 (`200 OK`)**: `{"success": true, "data": {"message": "Repository initialized successfully."}}`
- **核心实现 (Python伪代码)**:
  ```python
  import subprocess
  
  def init_repo(path: str):
      result = subprocess.run(["git", "init"], cwd=path, capture_output=True, text=True)
      if result.returncode != 0:
          raise Exception(result.stderr)
      # 可以在此创建 .chronos 配置文件
      return {"message": "Repository initialized successfully."}
  ```

#### **`GET /repository/status`**
- **功能**: 获取指定时光库的状态（已修改、新增的文件等）。
- **查询参数**: `?repo_path=/path/to/repo`
- **成功响应 (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "branch": "main",
      "changes": [
        {"status": "A", "file": "分册-1017.doc"},
        {"status": "M", "file": "总册-封面.ppt"},
        {"status": "D", "file": "旧的草稿.txt"}
      ]
    }
  }
  ```
- **核心实现 (Python伪代码)**:
  ```python
  def get_status(repo_path: str):
      # 获取当前分支名
      branch_result = subprocess.run(["git", "branch", "--show-current"], cwd=repo_path, ...)
      
      # 获取文件状态
      status_result = subprocess.run(["git", "status", "--porcelain"], cwd=repo_path, ...)
      
      changes = []
      for line in status_result.stdout.strip().splitlines():
          status_code = line[:2].strip()
          file_path = line[3:]
          # 将 ' M' -> 'M', '??' -> 'A' 等状态码进行标准化处理
          changes.append({"status": normalize_status(status_code), "file": file_path})
      
      return {"branch": branch_result.stdout.strip(), "changes": changes}
  ```

#### **`POST /repository/commit`**
- **功能**: 创建一个快照。
- **查询参数**: `?repo_path=/path/to/repo`
- **请求体**:
  ```json
  {
    "message": "feat: 完成初步设计方案第一章",
    "files_to_add": ["分册-1017.doc", "总册-封面.ppt"] 
  }
  ```
- **核心实现 (Python伪代码)**:
  ```python
  def create_commit(repo_path: str, message: str, files_to_add: list):
      # 先add指定文件，如果列表为空则 add .
      subprocess.run(["git", "add"] + files_to_add, cwd=repo_path, ...)
      
      # 再commit
      subprocess.run(["git", "commit", "-m", message], cwd=repo_path, ...)
      
      return {"message": "Commit created successfully."}
  ```

#### **`GET /repository/log`**
- **功能**: 获取历史快照列表。
- **查询参数**: `?repo_path=/path/to/repo`
- **成功响应 (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "logs": [
        {
          "id": "a1b2c3d",
          "message": "feat: 完成初步设计方案",
          "author": "Alex",
          "date": "2025-10-20T10:30:00"
        },
        ...
      ]
    }
  }
  ```
- **核心实现 (Python伪代码)**:
  ```python
  def get_log(repo_path: str):
      # 使用 --pretty=format 自定义输出格式，方便解析
      log_format = "%h|%s|%an|%aI" # 短hash|主题|作者|ISO 8601格式日期
      result = subprocess.run(["git", "log", f"--pretty=format:{log_format}"], cwd=repo_path, ...)
      
      logs = []
      for line in result.stdout.strip().splitlines():
          parts = line.split("|")
          logs.append({"id": parts[0], "message": parts[1], "author": parts[2], "date": parts[3]})
      
      return {"logs": logs}
  ```

*(其他API如分支管理、回滚等，将遵循类似的设计模式)*

---

## 3. 质量保障 (QA)

### 3.1. 代码规范
- **Python**: 强制使用`Black`进行代码格式化，使用`Ruff`进行代码风格检查和Linting。
- **TypeScript/React**: 强制使用`Prettier`进行代码格式化，使用`ESLint`进行代码风格检查。

### 3.2. 单元测试
- **Python**: 使用`Pytest`框架。重点测试所有调用Git命令并进行输出解析的函数，模拟各种可能的Git输出（正常、报错、空状态），确保解析逻辑的健壮性。
- **TypeScript/React**: 使用`Vitest`框架。重点测试UI组件的渲染和用户交互的响应，模拟后端API的各种返回数据，验证UI表现的正确性。

### 3.3. 性能基准 (MVP)
- **初始化**: 在一个包含1000个小文件（1KB/个）的文件夹上初始化，响应时间应 < 1s。
- **状态检查**: 在上述文件夹修改10个文件后，获取状态的API响应时间应 < 500ms。
- **历史查看**: 对于一个包含100个commit的历史记录，获取log的API响应时间应 < 500ms。

### 3.4. Bug管理流程
1.  **报告**: 使用GitHub Issues模板，清晰描述Bug复现步骤、期望结果和实际结果。
2.  **分配**: 项目负责人（我们）为Issue打上`bug`标签并分配给AI开发者。
3.  **修复**: AI开发者在一个新的`fix/issue-XX`分支上进行修复，并提交代码。
4.  **验证**: 我们在本地验证修复效果，并检查相关单元测试是否已添加。
5.  **关闭**: 验证通过后，合并代码并关闭Issue。
