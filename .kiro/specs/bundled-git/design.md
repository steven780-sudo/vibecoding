# 内置Git功能设计文档

## 概述

本文档描述如何将Git打包进Chronos应用，实现开箱即用的用户体验。

---

## 架构设计

### 整体架构

```
Chronos应用
├── Frontend (React + Tauri)
├── Backend (Python FastAPI)
└── Bundled Git
    ├── macOS/
    │   ├── aarch64/
    │   │   └── git (+ libexec, share等)
    │   └── x86_64/
    │       └── git (+ libexec, share等)
    ├── Windows/
    │   ├── x64/
    │   │   └── git.exe (+ mingw64等)
    │   └── x86/
    │       └── git.exe (+ mingw32等)
    └── Linux/
        ├── x86_64/
        │   └── git (+ lib等)
        └── aarch64/
            └── git (+ lib等)
```

### 工作流程

```
应用启动
    ↓
检测内置Git
    ↓
是否存在？
    ├─ 是 → 验证版本 → 设置Git路径
    └─ 否 → 检测系统Git
              ├─ 存在 → 使用系统Git
              └─ 不存在 → 显示错误提示
    ↓
Backend使用配置的Git路径
    ↓
执行Git命令
```

---

## 组件设计

### 1. Git资源管理器 (GitResourceManager)

**位置**: `backend/services/git_resource_manager.py`

**职责**:
- 检测内置Git
- 验证Git版本
- 管理Git路径配置
- 提供降级策略

```python
class GitResourceManager:
    def __init__(self):
        self.bundled_git_path = None
        self.system_git_path = None
        self.active_git_path = None
        
    def detect_git(self) -> GitInfo:
        """检测可用的Git"""
        # 1. 检测内置Git
        bundled = self._detect_bundled_git()
        if bundled:
            return bundled
            
        # 2. 回退到系统Git
        system = self._detect_system_git()
        if system:
            return system
            
        # 3. 都不可用
        return None
        
    def _detect_bundled_git(self) -> Optional[GitInfo]:
        """检测内置Git"""
        # 根据平台和架构确定路径
        platform = sys.platform
        arch = platform.machine()
        
        git_path = self._get_bundled_git_path(platform, arch)
        
        if os.path.exists(git_path):
            version = self._get_git_version(git_path)
            if self._is_version_compatible(version):
                return GitInfo(path=git_path, version=version, source='bundled')
        
        return None
        
    def _detect_system_git(self) -> Optional[GitInfo]:
        """检测系统Git"""
        try:
            result = subprocess.run(['git', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                version = self._parse_version(result.stdout)
                return GitInfo(path='git', version=version, source='system')
        except FileNotFoundError:
            pass
        
        return None
```

### 2. Git包装器更新 (GitWrapper)

**位置**: `backend/services/git_wrapper.py`

**更新内容**:
```python
class GitWrapper:
    def __init__(self):
        self.git_manager = GitResourceManager()
        self.git_info = self.git_manager.detect_git()
        
        if not self.git_info:
            raise RuntimeError("Git not available")
        
        self.git_command = self.git_info.path
        
    def _run_git_command(self, args: List[str], cwd: str) -> subprocess.CompletedProcess:
        """执行Git命令"""
        cmd = [self.git_command] + args
        
        # 设置环境变量（如果使用内置Git）
        env = os.environ.copy()
        if self.git_info.source == 'bundled':
            env.update(self._get_bundled_git_env())
        
        return subprocess.run(cmd, cwd=cwd, capture_output=True, 
                            text=True, env=env)
    
    def _get_bundled_git_env(self) -> dict:
        """获取内置Git所需的环境变量"""
        git_dir = os.path.dirname(self.git_command)
        return {
            'GIT_EXEC_PATH': os.path.join(git_dir, 'libexec', 'git-core'),
            'GIT_TEMPLATE_DIR': os.path.join(git_dir, 'share', 'git-core', 'templates'),
        }
```

### 3. 前端Git状态显示

**位置**: `frontend/src/components/GitStatus.tsx`

```typescript
interface GitStatusProps {
  gitInfo: {
    version: string
    source: 'bundled' | 'system' | 'none'
    path: string
  }
}

export const GitStatus: React.FC<GitStatusProps> = ({ gitInfo }) => {
  const getStatusColor = () => {
    switch (gitInfo.source) {
      case 'bundled': return 'success'
      case 'system': return 'warning'
      case 'none': return 'error'
    }
  }
  
  const getStatusText = () => {
    switch (gitInfo.source) {
      case 'bundled': return `内置Git ${gitInfo.version}`
      case 'system': return `系统Git ${gitInfo.version}`
      case 'none': return 'Git未安装'
    }
  }
  
  return (
    <Badge status={getStatusColor()} text={getStatusText()} />
  )
}
```

---

## 打包策略

### Git来源

使用官方的便携版Git：

**macOS**:
- 从Homebrew提取Git二进制
- 或使用Git官方的便携版本

**Windows**:
- 使用Git for Windows的便携版（PortableGit）
- 下载地址: https://github.com/git-for-windows/git/releases

**Linux**:
- 使用AppImage或静态编译版本
- 或从官方仓库提取

### 精简策略

只保留必需的组件：

```
保留:
✅ git (核心命令)
✅ git-* (子命令: add, commit, log, checkout等)
✅ libexec/git-core/ (Git内部命令)
✅ share/git-core/templates/ (模板)

移除:
❌ gitk, git-gui (图形界面)
❌ git-svn, git-cvs (SVN/CVS集成)
❌ 文档和手册页
❌ 翻译文件（只保留英文）
❌ Perl/Python脚本（如果不需要）
```

### 体积估算

```
完整Git:
- macOS: ~40MB
- Windows: ~50MB
- Linux: ~35MB

精简后:
- macOS: ~15MB
- Windows: ~20MB
- Linux: ~12MB

压缩后:
- macOS: ~8MB
- Windows: ~10MB
- Linux: ~6MB
```

---

## 构建流程

### 1. 准备Git二进制

```bash
# scripts/prepare-bundled-git.sh

#!/bin/bash

PLATFORM=$(uname -s)
ARCH=$(uname -m)
GIT_VERSION="2.43.0"

case "$PLATFORM" in
  Darwin)
    # macOS
    prepare_macos_git
    ;;
  Linux)
    # Linux
    prepare_linux_git
    ;;
  MINGW*|MSYS*)
    # Windows
    prepare_windows_git
    ;;
esac

function prepare_macos_git() {
  echo "准备macOS Git..."
  
  # 下载便携版Git或从Homebrew提取
  brew install git
  
  # 创建目录
  mkdir -p bundled-git/macos/$ARCH
  
  # 复制必需文件
  cp -r /usr/local/bin/git bundled-git/macos/$ARCH/
  cp -r /usr/local/libexec/git-core bundled-git/macos/$ARCH/libexec/
  cp -r /usr/local/share/git-core bundled-git/macos/$ARCH/share/
  
  # 精简
  remove_unnecessary_files bundled-git/macos/$ARCH
  
  # 压缩
  tar -czf bundled-git-macos-$ARCH.tar.gz -C bundled-git/macos/$ARCH .
}

function remove_unnecessary_files() {
  local dir=$1
  
  # 移除不需要的文件
  rm -rf $dir/share/man
  rm -rf $dir/share/doc
  rm -rf $dir/share/locale
  rm -f $dir/bin/gitk
  rm -f $dir/bin/git-gui
}
```

### 2. 集成到Tauri构建

**更新 `tauri.conf.json`**:

```json
{
  "bundle": {
    "resources": [
      "binaries/*",
      "bundled-git/*"
    ],
    "externalBin": [
      "binaries/backend"
    ]
  }
}
```

### 3. 首次运行时解压

```rust
// frontend/src-tauri/src/git_setup.rs

pub fn setup_bundled_git(app: &tauri::App) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    
    let git_archive = resource_dir.join("bundled-git")
        .join(format!("git-{}-{}.tar.gz", OS, ARCH));
    
    let git_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .join("git");
    
    // 如果已解压，直接返回
    if git_dir.join("bin").join("git").exists() {
        return Ok(git_dir);
    }
    
    // 解压
    println!("Extracting bundled Git...");
    extract_tar_gz(&git_archive, &git_dir)?;
    
    // 设置执行权限
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let git_bin = git_dir.join("bin").join("git");
        let mut perms = fs::metadata(&git_bin)?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&git_bin, perms)?;
    }
    
    Ok(git_dir)
}
```

---

## 许可证合规

### GPL v2要求

Git使用GPL v2许可证，我们需要：

1. **保留版权声明**
   - 在应用的"关于"页面显示Git的版权信息
   - 包含GPL v2许可证全文

2. **提供源代码**
   - 在应用中提供Git源代码的下载链接
   - 或在我们的网站上提供

3. **声明修改**
   - 如果修改了Git，必须声明
   - Chronos不修改Git，只是打包使用

### 实现

```typescript
// frontend/src/components/AboutDialog.tsx

<Collapse>
  <Panel header="开源许可证">
    <div>
      <h4>Git</h4>
      <p>版本: 2.43.0</p>
      <p>许可证: GPL v2</p>
      <p>
        Git是自由软件，您可以根据自由软件基金会发布的
        GNU通用公共许可证第2版的条款重新分发和/或修改它。
      </p>
      <Button 
        type="link" 
        href="https://github.com/git/git"
        target="_blank"
      >
        查看Git源代码
      </Button>
    </div>
  </Panel>
</Collapse>
```

---

## 测试策略

### 单元测试

```python
# backend/tests/test_git_resource_manager.py

def test_detect_bundled_git():
    manager = GitResourceManager()
    git_info = manager.detect_git()
    
    assert git_info is not None
    assert git_info.source == 'bundled'
    assert git_info.version >= '2.40.0'

def test_fallback_to_system_git(monkeypatch):
    # 模拟内置Git不存在
    monkeypatch.setattr('os.path.exists', lambda x: False)
    
    manager = GitResourceManager()
    git_info = manager.detect_git()
    
    # 应该回退到系统Git
    assert git_info.source == 'system'
```

### 集成测试

```python
def test_git_commands_with_bundled_git():
    """测试使用内置Git执行命令"""
    wrapper = GitWrapper()
    
    # 确保使用内置Git
    assert wrapper.git_info.source == 'bundled'
    
    # 测试基本命令
    result = wrapper.init_repository('/tmp/test-repo')
    assert result.success
```

### 跨平台测试

- macOS (Intel + Apple Silicon)
- Windows (x64 + x86)
- Linux (Ubuntu, Fedora, Arch)

---

## 性能考虑

### 启动性能

- 首次启动需要解压Git（~2秒）
- 后续启动直接使用已解压的Git（~50ms）

### 运行性能

- 内置Git性能应与系统Git相当
- 通过环境变量优化Git配置

### 存储优化

- 使用压缩减小体积
- 只在需要时解压
- 多个应用实例共享同一份Git

---

## 降级和错误处理

### 降级策略

```
1. 尝试使用内置Git
   ↓ 失败
2. 尝试使用系统Git
   ↓ 失败
3. 显示安装引导
```

### 错误提示

```typescript
if (!gitAvailable) {
  Modal.error({
    title: 'Git不可用',
    content: (
      <div>
        <p>Chronos需要Git才能工作。</p>
        <p>内置Git加载失败，系统也未安装Git。</p>
        <Button onClick={reinstallApp}>重新安装应用</Button>
        <Button onClick={installSystemGit}>安装系统Git</Button>
      </div>
    )
  })
}
```

---

## 实施计划

### 阶段1: 准备工作（1-2天）
- [ ] 下载各平台的便携版Git
- [ ] 编写精简脚本
- [ ] 测试精简后的Git功能

### 阶段2: 后端集成（2-3天）
- [ ] 实现GitResourceManager
- [ ] 更新GitWrapper
- [ ] 添加API端点返回Git信息
- [ ] 编写单元测试

### 阶段3: 前端集成（1-2天）
- [ ] 添加Git状态显示
- [ ] 更新关于页面（许可证信息）
- [ ] 添加错误处理UI

### 阶段4: 构建集成（2-3天）
- [ ] 更新构建脚本
- [ ] 集成到Tauri构建流程
- [ ] 实现首次运行解压逻辑
- [ ] 测试多平台构建

### 阶段5: 测试和优化（2-3天）
- [ ] 跨平台测试
- [ ] 性能测试
- [ ] 体积优化
- [ ] 文档更新

**总计**: 8-13天

---

## 风险和缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| GPL许可证合规问题 | 高 | 低 | 咨询法律顾问，严格遵守GPL要求 |
| 体积过大影响下载 | 中 | 中 | 精简和压缩，目标<50MB |
| 跨平台兼容性问题 | 高 | 中 | 充分测试，提供降级方案 |
| 维护成本增加 | 中 | 高 | 自动化更新流程 |

---

**文档版本**: 1.0  
**创建日期**: 2025-10-22  
**状态**: 草稿
