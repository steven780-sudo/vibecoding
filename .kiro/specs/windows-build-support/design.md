# Design Document - Windows Build Support

## Overview

本设计文档描述了为Chronos项目添加Windows平台构建支持的技术方案。当前Chronos使用Tauri框架构建，已支持macOS平台。Tauri本身具备跨平台能力，因此扩展Windows支持主要涉及：

1. **构建配置调整**: 更新Tauri配置以支持Windows目标平台
2. **Python后端打包**: 使用PyInstaller为Windows平台打包Python后端
3. **路径处理兼容**: 确保代码正确处理Windows路径格式
4. **系统文件过滤**: 扩展.gitignore规则以包含Windows系统文件
5. **构建脚本**: 创建Windows平台的自动化构建脚本
6. **文档更新**: 提供Windows构建和使用文档

核心策略是利用Tauri的跨平台特性，最小化代码修改，主要工作集中在构建配置和平台特定的适配上。

## Architecture

### 整体架构保持不变

```
┌─────────────────────────────────────────┐
│   Tauri Desktop Application (Windows)   │
│  ┌─────────────┐  ┌───────────────────┐ │
│  │  Frontend   │  │   Backend         │ │
│  │  React+TS   │◄─┤  Python+FastAPI   │ │
│  │  (Vite)     │  │  (PyInstaller)    │ │
│  └─────────────┘  └───────────────────┘ │
└─────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Git CLI     │
    │  (Windows)   │
    └──────────────┘
```

### 构建流程

```

[开发者] → [构建命令]
     ↓
[1. 编译前端] (npm run build)
     ↓
[2. 打包Python后端] (PyInstaller for Windows)
     ↓
[3. Tauri构建] (cargo tauri build --target x86_64-pc-windows-msvc)
     ↓
[4. 生成安装包] (.msi / .exe)
     ↓
[Windows安装包] → [用户安装]
```

### 跨平台构建策略

由于macOS无法直接构建Windows应用，有两种方案：

**方案A: 使用GitHub Actions CI/CD（推荐）**
- 在GitHub Actions中配置Windows runner
- 自动化构建流程
- 支持多平台并行构建

**方案B: 本地Windows环境构建**
- 需要Windows物理机或虚拟机
- 手动执行构建脚本
- 适合开发测试阶段

本设计采用方案A作为主要方案，方案B作为备选。

## Components and Interfaces

### 1. Tauri配置组件

**文件**: `frontend/src-tauri/tauri.conf.json`

**修改内容**:
```json
{
  "bundle": {
    "targets": ["dmg", "msi", "nsis"],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": "",
      "wix": {
        "language": "zh-CN"
      }
    }
  }
}
```

**关键配置项**:
- `targets`: 添加`msi`和`nsis`（Windows安装包格式）
- `windows.wix.language`: 设置为中文
- `externalBin`: 确保包含Windows版本的backend.exe

### 2. Python后端打包组件

**文件**: `backend/backend.spec` (PyInstaller配置)

**Windows特定配置**:

```python
# backend.spec - Windows特定配置
exe = EXE(
    # ...
    name='backend.exe',  # Windows可执行文件扩展名
    console=False,       # 不显示控制台窗口（生产环境）
    icon='icon.ico',     # Windows图标
)
```

**构建脚本**: `backend/build_binary_windows.bat`

### 3. 路径处理组件

**文件**: `backend/services/git_wrapper.py`

**当前实现**:
```python
self.repo_path = Path(repo_path).resolve()
```

**分析**: 
- 使用`pathlib.Path`已经具备跨平台能力
- `Path.resolve()`在Windows上会正确处理反斜杠
- Git CLI在Windows上也支持正斜杠路径

**需要验证的场景**:
- Windows路径格式：`C:\Users\username\Documents`
- 包含空格的路径：`C:\Program Files\MyFolder`
- 中文路径：`C:\用户\文档`

### 4. 系统文件过滤组件

**文件**: `backend/services/git_wrapper.py`

**当前实现**:
```python
GITIGNORE_RULES = {
    "windows": [
        "Thumbs.db",
        "Thumbs.db:encryptable",
        "ehthumbs.db",
        "ehthumbs_vista.db",
        "*.stackdump",
        "[Dd]esktop.ini",
        "$RECYCLE.BIN/",
        "*.lnk",
    ],
    # ...
}
```

**分析**: Windows系统文件规则已经定义，无需修改。

### 5. 构建脚本组件

**新增文件**:
- `backend/build_binary_windows.bat` - Windows后端构建脚本
- `scripts/build_windows.bat` - Windows完整构建脚本
- `scripts/setup_windows.bat` - Windows开发环境设置脚本

## Data Models

### 构建配置模型

```typescript
interface BuildConfig {
  platform: 'macos' | 'windows' | 'linux';
  architecture: 'x64' | 'arm64';
  bundleFormat: 'dmg' | 'msi' | 'nsis' | 'appimage';
  backendBinary: string;  // 'backend' or 'backend.exe'
}
```

### 路径模型

```python
class PathHandler:
    """跨平台路径处理"""
    
    @staticmethod
    def normalize_path(path: str) -> Path:
        """标准化路径，支持Windows和Unix格式"""
        return Path(path).resolve()
    
    @staticmethod
    def to_git_path(path: Path) -> str:
        """转换为Git兼容的路径格式（正斜杠）"""
        return path.as_posix()
```

## Error Handling

### 1. Git未安装检测

```python
def _check_git_installation(self) -> bool:
    """检测Git是否安装"""
    try:
        result = subprocess.run(
            ["git", "--version"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False
```

**错误提示**:
- Windows: "未检测到Git，请从 https://git-scm.com/download/win 下载安装"
- macOS: "未检测到Git，请运行 'xcode-select --install' 安装"

### 2. 路径编码问题

```python
def _run_git_command(self, args: List[str]) -> subprocess.CompletedProcess:
    """执行Git命令，处理Windows编码问题"""
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=str(self.repo_path),
            capture_output=True,
            text=True,
            encoding='utf-8',  # 明确指定UTF-8编码
            errors='replace',   # 替换无法解码的字符
            check=False,
        )
        return result
    except Exception as e:
        raise GitError(f"Git命令执行失败: {str(e)}")
```

### 3. 权限问题

Windows特定的权限错误处理：
```python
def init_repository(self) -> Dict[str, Any]:
    """初始化仓库，处理Windows权限问题"""
    try:
        # 检查目录权限
        if not os.access(self.repo_path, os.R_OK | os.W_OK):
            raise InvalidPathError(
                "当前文件目录不可访问或无读写权限！\n"
                "请检查文件夹是否被其他程序占用，或以管理员身份运行。"
            )
        # ...
    except PermissionError as e:
        raise InvalidPathError(f"权限错误: {str(e)}")
```

## Testing Strategy

### 1. 单元测试（跨平台）

**测试文件**: `backend/tests/test_git_wrapper.py`

**新增测试用例**:
```python
class TestWindowsCompatibility:
    """Windows兼容性测试"""
    
    def test_windows_path_handling(self):
        """测试Windows路径处理"""
        if platform.system() == 'Windows':
            path = r"C:\Users\Test\Documents"
            wrapper = GitWrapper(path)
            assert wrapper.repo_path.is_absolute()
    
    def test_windows_system_files(self):
        """测试Windows系统文件过滤"""
        assert GitWrapper._is_system_file("Thumbs.db")
        assert GitWrapper._is_system_file("desktop.ini")
        assert GitWrapper._is_system_file("$RECYCLE.BIN/test.txt")
    
    def test_path_with_spaces(self):
        """测试包含空格的路径"""
        path = "C:\\Program Files\\Test Folder"
        # 测试路径处理逻辑
```

### 2. 集成测试（Windows环境）

**测试场景**:
- 在Windows系统上初始化仓库
- 创建包含中文和空格的文件
- 执行完整的快照创建和回滚流程
- 验证系统文件被正确过滤

### 3. 构建测试

**测试步骤**:
1. 在Windows环境执行构建脚本
2. 验证生成的.msi或.exe安装包
3. 安装应用并测试基本功能
4. 验证Python后端正确启动
5. 验证Git命令正确执行

### 4. 手动测试清单

- [ ] 安装包能否正常安装
- [ ] 应用能否正常启动
- [ ] 能否选择和初始化文件夹
- [ ] 能否创建快照
- [ ] 能否查看历史记录
- [ ] 能否回滚版本
- [ ] 能否创建和切换分支
- [ ] 能否合并分支
- [ ] Windows系统文件是否被正确过滤
- [ ] 中文路径和文件名是否正常工作

## Implementation Plan

### Phase 1: 代码兼容性准备（在macOS上完成）

1. **路径处理增强**
   - 审查所有路径相关代码
   - 确保使用`pathlib.Path`
   - 添加路径编码处理

2. **系统文件过滤验证**
   - 验证Windows规则完整性
   - 添加单元测试

3. **错误处理改进**
   - 添加平台特定的错误提示
   - 改进Git检测逻辑

### Phase 2: 构建配置和脚本（在macOS上完成）

1. **更新Tauri配置**
   - 添加Windows目标平台
   - 配置Windows安装包选项
   - 添加Windows图标

2. **创建Windows构建脚本**
   - Python后端构建脚本（.bat）
   - 完整构建脚本（.bat）
   - 环境设置脚本（.bat）

3. **编写构建文档**
   - Windows环境要求
   - 构建步骤说明
   - 故障排除指南

### Phase 3: Windows环境构建和测试（在Windows上完成）

1. **环境准备**
   - 安装Python 3.10+
   - 安装Node.js 18+
   - 安装Rust和Tauri CLI
   - 安装Git for Windows

2. **执行构建**
   - 运行构建脚本
   - 生成安装包
   - 验证构建产物

3. **功能测试**
   - 安装应用
   - 执行测试清单
   - 记录问题和修复

### Phase 4: 文档和发布

1. **更新用户文档**
   - README添加Windows安装说明
   - 创建Windows用户指南

2. **发布准备**
   - 创建发布说明
   - 准备下载链接
   - 更新版本号

## Design Decisions and Rationales

### 决策1: 在Windows环境构建Windows应用

**理由**:
- 避免交叉编译的复杂性
- 更容易调试和测试
- 可以直接验证功能
- 符合Tauri官方推荐做法

### 决策2: 使用pathlib.Path处理路径

**理由**:
- Python标准库，跨平台支持
- 自动处理不同操作系统的路径分隔符
- 提供丰富的路径操作方法
- 代码更清晰易读

### 决策3: 保持Git CLI调用方式不变

**理由**:
- Git for Windows完全兼容Git CLI命令
- 无需修改现有Git封装逻辑
- 降低实现复杂度
- 保持代码一致性

### 决策4: 使用PyInstaller打包Python后端

**理由**:
- 已在macOS上成功使用
- 支持Windows平台
- 配置简单，易于维护
- 生成单一可执行文件

### 决策5: 支持.msi和.nsis两种安装包格式

**理由**:
- .msi是Windows标准安装包格式
- .nsis提供更灵活的安装选项
- 满足不同用户需求
- Tauri原生支持两种格式

## Performance Considerations

### Windows特定优化

1. **文件系统性能**
   - Windows NTFS文件系统特性
   - 避免频繁的小文件操作
   - 使用批量Git命令

2. **进程启动优化**
   - Python后端预热
   - 减少subprocess调用次数
   - 缓存Git命令结果

3. **内存使用**
   - Windows内存管理特点
   - 控制Python进程内存占用
   - 及时释放资源

## Security Considerations

### Windows特定安全

1. **代码签名**
   - 考虑为.exe和.msi签名
   - 避免Windows SmartScreen警告
   - 提升用户信任度

2. **权限管理**
   - 不要求管理员权限运行
   - 正确处理用户目录权限
   - 避免访问系统敏感目录

3. **防病毒软件兼容**
   - PyInstaller打包的exe可能被误报
   - 考虑添加到白名单
   - 提供说明文档

## Future Enhancements

### 短期改进

1. **自动更新**
   - 集成Tauri updater
   - 支持增量更新
   - 版本检查机制

2. **安装包优化**
   - 减小安装包体积
   - 添加安装向导
   - 支持静默安装

### 长期规划

1. **Linux支持**
   - 扩展到Linux平台
   - 支持多种发行版
   - 提供AppImage/Snap/Deb包

2. **CI/CD自动化**
   - GitHub Actions自动构建
   - 多平台并行构建
   - 自动发布到Release

## References

- [Tauri官方文档 - Windows构建](https://tauri.app/v1/guides/building/windows)
- [PyInstaller文档 - Windows支持](https://pyinstaller.org/en/stable/usage.html)
- [Git for Windows](https://git-scm.com/download/win)
- [Python pathlib文档](https://docs.python.org/3/library/pathlib.html)
