"""
GitWrapper单元测试
测试Git命令封装服务的核心功能
"""
import pytest
import tempfile
import shutil
import os
from pathlib import Path
from services.git_wrapper import (
    GitWrapper,
    GitError,
    RepositoryNotFoundError,
    InvalidPathError,
    MergeConflictError
)


@pytest.fixture
def temp_dir():
    """创建临时目录用于测试"""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    shutil.rmtree(temp_path, ignore_errors=True)


@pytest.fixture
def git_wrapper(temp_dir):
    """创建GitWrapper实例"""
    return GitWrapper(temp_dir)


@pytest.fixture
def initialized_repo(temp_dir):
    """创建已初始化的Git仓库"""
    wrapper = GitWrapper(temp_dir)
    wrapper.init_repository()
    return wrapper


class TestGitWrapperInit:
    """测试GitWrapper初始化"""
    
    def test_init_with_valid_path(self, temp_dir):
        """测试使用有效路径初始化"""
        wrapper = GitWrapper(temp_dir)
        assert wrapper.repo_path == Path(temp_dir).resolve()
    
    def test_init_with_relative_path(self, temp_dir):
        """测试使用相对路径初始化"""
        # 使用相对路径
        rel_path = os.path.relpath(temp_dir)
        wrapper = GitWrapper(rel_path)
        assert wrapper.repo_path.is_absolute()


class TestRepositoryInit:
    """测试仓库初始化功能"""
    
    def test_init_repository_success(self, git_wrapper, temp_dir):
        """测试成功初始化仓库"""
        result = git_wrapper.init_repository()
        
        assert result["success"] is True
        assert result["already_initialized"] is False
        assert (Path(temp_dir) / ".git").exists()
        assert (Path(temp_dir) / ".chronos").exists()
    
    def test_init_repository_already_initialized(self, initialized_repo, temp_dir):
        """测试重复初始化已存在的仓库"""
        result = initialized_repo.init_repository()
        
        assert result["success"] is True
        assert result["already_initialized"] is True
    
    def test_init_repository_invalid_path(self):
        """测试使用无效路径初始化"""
        wrapper = GitWrapper("/nonexistent/path")
        
        with pytest.raises(InvalidPathError):
            wrapper.init_repository()


class TestRepositoryStatus:
    """测试仓库状态获取功能"""
    
    def test_get_status_clean_repo(self, initialized_repo, temp_dir):
        """测试获取干净仓库的状态"""
        # 提交.chronos文件使仓库变干净
        initialized_repo.create_commit("初始提交")
        
        status = initialized_repo.get_status()
        
        assert status["is_clean"] is True
        assert len(status["changes"]) == 0
        assert "branch" in status
    
    def test_get_status_with_changes(self, initialized_repo, temp_dir):
        """测试获取有变更的仓库状态"""
        # 创建新文件
        test_file = Path(temp_dir) / "test.txt"
        test_file.write_text("test content")
        
        status = initialized_repo.get_status()
        
        assert status["is_clean"] is False
        assert len(status["changes"]) > 0
        assert any(c["file"] == "test.txt" for c in status["changes"])
    
    def test_get_status_not_a_repo(self, git_wrapper):
        """测试在非Git仓库中获取状态"""
        with pytest.raises(RepositoryNotFoundError):
            git_wrapper.get_status()
    
    def test_get_current_branch(self, initialized_repo):
        """测试获取当前分支"""
        branch = initialized_repo.get_current_branch()
        assert branch in ["main", "master"]


class TestCommitCreation:
    """测试快照创建功能"""
    
    def test_create_commit_success(self, initialized_repo, temp_dir):
        """测试成功创建提交"""
        # 创建文件
        test_file = Path(temp_dir) / "test.txt"
        test_file.write_text("test content")
        
        result = initialized_repo.create_commit("测试提交")
        
        assert result["success"] is True
        assert "commit" in result
        assert result["commit"]["message"] == "测试提交"
    
    def test_create_commit_empty_message(self, initialized_repo, temp_dir):
        """测试使用空消息创建提交"""
        test_file = Path(temp_dir) / "test.txt"
        test_file.write_text("test content")
        
        with pytest.raises(ValueError):
            initialized_repo.create_commit("")
    
    def test_create_commit_no_changes(self, initialized_repo):
        """测试在没有变更时创建提交"""
        # 先提交一次使仓库干净
        initialized_repo.create_commit("初始提交")
        
        # 再次尝试提交应该失败
        result = initialized_repo.create_commit("测试提交")
        
        assert result["success"] is False
        assert "没有变更" in result["message"]
    
    def test_create_commit_with_specific_files(self, initialized_repo, temp_dir):
        """测试选择性添加文件"""
        # 创建多个文件
        file1 = Path(temp_dir) / "file1.txt"
        file2 = Path(temp_dir) / "file2.txt"
        file1.write_text("content 1")
        file2.write_text("content 2")
        
        result = initialized_repo.create_commit("测试提交", files=["file1.txt"])
        
        assert result["success"] is True
        
        # 验证file2仍未提交
        status = initialized_repo.get_status()
        assert any(c["file"] == "file2.txt" for c in status["changes"])


class TestCommitHistory:
    """测试历史记录获取功能"""
    
    def test_get_log_empty_repo(self, initialized_repo):
        """测试获取空仓库的历史"""
        log = initialized_repo.get_log()
        assert len(log) == 0
    
    def test_get_log_with_commits(self, initialized_repo, temp_dir):
        """测试获取有提交的历史"""
        # 创建几个提交
        for i in range(3):
            file = Path(temp_dir) / f"file{i}.txt"
            file.write_text(f"content {i}")
            initialized_repo.create_commit(f"提交 {i}")
        
        log = initialized_repo.get_log()
        
        assert len(log) == 3
        assert all("id" in commit for commit in log)
        assert all("message" in commit for commit in log)
        assert all("author" in commit for commit in log)
        assert all("date" in commit for commit in log)
    
    def test_get_log_with_limit(self, initialized_repo, temp_dir):
        """测试限制返回的提交数量"""
        # 创建多个提交
        for i in range(5):
            file = Path(temp_dir) / f"file{i}.txt"
            file.write_text(f"content {i}")
            initialized_repo.create_commit(f"提交 {i}")
        
        log = initialized_repo.get_log(limit=2)
        
        assert len(log) == 2


class TestCheckout:
    """测试版本回滚功能"""
    
    def test_checkout_commit_success(self, initialized_repo, temp_dir):
        """测试成功回滚到指定提交"""
        # 创建两个提交
        file = Path(temp_dir) / "test.txt"
        file.write_text("version 1")
        initialized_repo.create_commit("版本1")
        
        file.write_text("version 2")
        initialized_repo.create_commit("版本2")
        
        # 获取第一个提交的ID
        log = initialized_repo.get_log()
        first_commit_id = log[-1]["id"]
        
        # 回滚到第一个提交
        result = initialized_repo.checkout_commit(first_commit_id)
        
        assert result["success"] is True
        assert file.read_text() == "version 1"
    
    def test_checkout_invalid_commit(self, initialized_repo):
        """测试回滚到无效的提交ID"""
        with pytest.raises(ValueError):
            initialized_repo.checkout_commit("invalid_commit_id")
    
    def test_checkout_with_uncommitted_changes(self, initialized_repo, temp_dir):
        """测试在有未提交变更时回滚"""
        # 创建一个提交
        file = Path(temp_dir) / "test.txt"
        file.write_text("version 1")
        initialized_repo.create_commit("版本1")
        
        # 修改文件但不提交
        file.write_text("uncommitted changes")
        
        log = initialized_repo.get_log()
        commit_id = log[0]["id"]
        
        result = initialized_repo.checkout_commit(commit_id)
        
        assert result["success"] is False
        assert "未保存的变更" in result["message"]


class TestBranchManagement:
    """测试分支管理功能"""
    
    def test_get_branches(self, initialized_repo, temp_dir):
        """测试获取分支列表"""
        # 创建初始提交以建立分支
        file = Path(temp_dir) / "test.txt"
        file.write_text("content")
        initialized_repo.create_commit("初始提交")
        
        result = initialized_repo.get_branches()
        
        assert "branches" in result
        assert "current" in result
        assert len(result["branches"]) > 0
    
    def test_create_branch_success(self, initialized_repo, temp_dir):
        """测试成功创建分支"""
        # 先创建一个提交（分支需要至少一个提交）
        file = Path(temp_dir) / "test.txt"
        file.write_text("content")
        initialized_repo.create_commit("初始提交")
        
        result = initialized_repo.create_branch("feature-test")
        
        assert result["success"] is True
        assert result["branch"] == "feature-test"
        
        # 验证分支已创建
        branches = initialized_repo.get_branches()
        assert any(b["name"] == "feature-test" for b in branches["branches"])
    
    def test_create_branch_invalid_name(self, initialized_repo):
        """测试使用无效名称创建分支"""
        with pytest.raises(ValueError):
            initialized_repo.create_branch("invalid branch name")
    
    def test_switch_branch_success(self, initialized_repo, temp_dir):
        """测试成功切换分支"""
        # 创建提交和新分支
        file = Path(temp_dir) / "test.txt"
        file.write_text("content")
        initialized_repo.create_commit("初始提交")
        initialized_repo.create_branch("feature-test")
        
        result = initialized_repo.switch_branch("feature-test")
        
        assert result["success"] is True
        assert initialized_repo.get_current_branch() == "feature-test"
    
    def test_merge_branch_success(self, initialized_repo, temp_dir):
        """测试成功合并分支"""
        # 在主分支创建提交
        file = Path(temp_dir) / "main.txt"
        file.write_text("main content")
        initialized_repo.create_commit("主分支提交")
        
        # 创建并切换到新分支
        initialized_repo.create_branch("feature")
        initialized_repo.switch_branch("feature")
        
        # 在新分支创建提交
        feature_file = Path(temp_dir) / "feature.txt"
        feature_file.write_text("feature content")
        initialized_repo.create_commit("功能分支提交")
        
        # 切换回主分支并合并
        initialized_repo.switch_branch("main")
        result = initialized_repo.merge_branch("feature")
        
        assert result["success"] is True
        assert feature_file.exists()


class TestErrorHandling:
    """测试错误处理"""
    
    def test_run_git_command_git_not_found(self, monkeypatch):
        """测试Git未安装的情况"""
        def mock_run(*args, **kwargs):
            raise FileNotFoundError()
        
        monkeypatch.setattr("subprocess.run", mock_run)
        
        wrapper = GitWrapper("/tmp/test")
        with pytest.raises(GitError, match="Git未安装"):
            wrapper._run_git_command(["status"])
    
    def test_normalize_status(self, git_wrapper):
        """测试状态码标准化"""
        assert git_wrapper._normalize_status("M") == "modified"
        assert git_wrapper._normalize_status("A") == "added"
        assert git_wrapper._normalize_status("D") == "deleted"
        assert git_wrapper._normalize_status("??") == "added"
        assert git_wrapper._normalize_status("MM") == "modified"
    
    def test_is_valid_branch_name(self, git_wrapper):
        """测试分支名称验证"""
        assert git_wrapper._is_valid_branch_name("feature-test") is True
        assert git_wrapper._is_valid_branch_name("feature/test") is True
        assert git_wrapper._is_valid_branch_name("invalid branch") is False
        assert git_wrapper._is_valid_branch_name("invalid~branch") is False
        assert git_wrapper._is_valid_branch_name(".invalid") is False
        assert git_wrapper._is_valid_branch_name("invalid..name") is False
