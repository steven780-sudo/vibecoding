"""
API端点集成测试
使用FastAPI TestClient测试所有API端点
"""

import shutil
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


@pytest.fixture
def temp_repo():
    """创建临时仓库目录"""
    temp_path = tempfile.mkdtemp()
    yield temp_path
    shutil.rmtree(temp_path, ignore_errors=True)


class TestRepositoryAPI:
    """测试仓库操作API"""

    def test_init_repository_success(self, temp_repo):
        """测试成功初始化仓库"""
        response = client.post("/api/repository/init", json={"path": temp_repo})

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert data["data"]["already_initialized"] is False

    def test_init_repository_already_initialized(self, temp_repo):
        """测试重复初始化"""
        # 第一次初始化
        client.post("/api/repository/init", json={"path": temp_repo})

        # 第二次初始化
        response = client.post("/api/repository/init", json={"path": temp_repo})

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["already_initialized"] is True

    def test_init_repository_invalid_path(self):
        """测试无效路径"""
        response = client.post(
            "/api/repository/init", json={"path": "/nonexistent/path"}
        )

        assert response.status_code == 400

    def test_get_status_success(self, temp_repo):
        """测试获取仓库状态"""
        # 先初始化仓库
        client.post("/api/repository/init", json={"path": temp_repo})

        # 创建一个文件
        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("test content")

        # 获取状态
        response = client.get(f"/api/repository/status?path={temp_repo}")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "branch" in data["data"]
        assert "changes" in data["data"]
        assert "is_clean" in data["data"]
        assert len(data["data"]["changes"]) > 0

    def test_get_status_not_a_repo(self, temp_repo):
        """测试非Git仓库"""
        response = client.get(f"/api/repository/status?path={temp_repo}")

        assert response.status_code == 404


class TestCommitAPI:
    """测试快照操作API"""

    def test_create_commit_success(self, temp_repo):
        """测试成功创建提交"""
        # 初始化仓库
        client.post("/api/repository/init", json={"path": temp_repo})

        # 创建文件
        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("test content")

        # 创建提交（不传files字段，让Pydantic使用默认值None）
        response = client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "测试提交"},
        )

        if response.status_code != 200:
            print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "commit" in data["data"]
        assert data["data"]["commit"]["message"] == "测试提交"

    def test_create_commit_empty_message(self, temp_repo):
        """测试空消息"""
        # 初始化仓库
        client.post("/api/repository/init", json={"path": temp_repo})

        # 尝试创建空消息提交
        response = client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": ""},
        )

        assert response.status_code == 422  # Validation error

    def test_get_log_success(self, temp_repo):
        """测试获取提交历史"""
        # 初始化仓库并创建提交
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("test content")

        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "测试提交"},
        )

        # 获取历史
        response = client.get(f"/api/repository/log?path={temp_repo}")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "logs" in data["data"]
        assert len(data["data"]["logs"]) > 0

    def test_get_log_with_limit(self, temp_repo):
        """测试限制返回数量"""
        # 初始化仓库并创建多个提交
        client.post("/api/repository/init", json={"path": temp_repo})

        for i in range(3):
            test_file = Path(temp_repo) / f"test{i}.txt"
            test_file.write_text(f"content {i}")
            client.post(
                "/api/repository/commit",
                json={"path": temp_repo, "message": f"提交 {i}"},
            )

        # 获取历史，限制2条
        response = client.get(f"/api/repository/log?path={temp_repo}&limit=2")

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["logs"]) == 2

    def test_checkout_commit_success(self, temp_repo):
        """测试回滚提交"""
        # 初始化仓库并创建两个提交
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("version 1")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "版本1"},
        )

        test_file.write_text("version 2")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "版本2"},
        )

        # 获取第一个提交的ID
        log_response = client.get(f"/api/repository/log?path={temp_repo}")
        commits = log_response.json()["data"]["logs"]
        first_commit_id = commits[-1]["id"]

        # 回滚到第一个提交
        response = client.post(
            "/api/repository/checkout",
            json={"path": temp_repo, "commit_id": first_commit_id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert test_file.read_text() == "version 1"

    def test_checkout_invalid_commit(self, temp_repo):
        """测试无效的提交ID"""
        client.post("/api/repository/init", json={"path": temp_repo})

        response = client.post(
            "/api/repository/checkout",
            json={"path": temp_repo, "commit_id": "invalid_commit_id"},
        )

        assert response.status_code == 400


class TestBranchAPI:
    """测试分支操作API"""

    def test_get_branches_success(self, temp_repo):
        """测试获取分支列表"""
        # 初始化仓库并创建初始提交
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "初始提交"},
        )

        # 获取分支列表
        response = client.get(f"/api/repository/branches?path={temp_repo}")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "branches" in data["data"]
        assert len(data["data"]["branches"]) > 0

    def test_create_branch_success(self, temp_repo):
        """测试创建分支"""
        # 初始化仓库并创建初始提交
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "初始提交"},
        )

        # 创建分支
        response = client.post(
            "/api/repository/branch",
            json={"path": temp_repo, "branch_name": "feature-test"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["branch"] == "feature-test"

    def test_create_branch_invalid_name(self, temp_repo):
        """测试无效分支名"""
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "初始提交"},
        )

        # 尝试创建无效分支名
        response = client.post(
            "/api/repository/branch",
            json={"path": temp_repo, "branch_name": "invalid branch name"},
        )

        assert response.status_code == 400

    def test_switch_branch_success(self, temp_repo):
        """测试切换分支"""
        # 初始化仓库并创建初始提交
        client.post("/api/repository/init", json={"path": temp_repo})

        test_file = Path(temp_repo) / "test.txt"
        test_file.write_text("content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "初始提交"},
        )

        # 创建并切换分支
        client.post(
            "/api/repository/branch",
            json={"path": temp_repo, "branch_name": "feature-test"},
        )

        response = client.post(
            "/api/repository/switch",
            json={"path": temp_repo, "branch_name": "feature-test"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["branch"] == "feature-test"

    def test_merge_branch_success(self, temp_repo):
        """测试合并分支"""
        # 初始化仓库
        client.post("/api/repository/init", json={"path": temp_repo})

        # 在主分支创建提交
        main_file = Path(temp_repo) / "main.txt"
        main_file.write_text("main content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "主分支提交"},
        )

        # 创建并切换到新分支
        client.post(
            "/api/repository/branch",
            json={"path": temp_repo, "branch_name": "feature"},
        )
        client.post(
            "/api/repository/switch",
            json={"path": temp_repo, "branch_name": "feature"},
        )

        # 在新分支创建提交
        feature_file = Path(temp_repo) / "feature.txt"
        feature_file.write_text("feature content")
        client.post(
            "/api/repository/commit",
            json={"path": temp_repo, "message": "功能分支提交"},
        )

        # 切换回主分支并合并
        client.post(
            "/api/repository/switch", json={"path": temp_repo, "branch_name": "main"}
        )

        response = client.post(
            "/api/repository/merge",
            json={"path": temp_repo, "source_branch": "feature", "target_branch": None},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert feature_file.exists()


class TestAPIResponseFormat:
    """测试API响应格式一致性"""

    def test_response_format_success(self, temp_repo):
        """测试成功响应格式"""
        response = client.post("/api/repository/init", json={"path": temp_repo})

        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "data" in data
        assert isinstance(data["success"], bool)

    def test_response_format_error(self):
        """测试错误响应格式"""
        response = client.post(
            "/api/repository/init", json={"path": "/nonexistent/path"}
        )

        assert response.status_code >= 400
        assert "detail" in response.json()
