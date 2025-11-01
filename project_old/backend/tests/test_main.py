"""Tests for main application"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns success"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "message" in data["data"]
    assert "Chronos Backend is running" in data["data"]["message"]


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "chronos-backend"
