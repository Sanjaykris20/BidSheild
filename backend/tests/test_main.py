"""Tests for app/main.py root and health endpoints."""

import pytest

pytestmark = pytest.mark.asyncio


async def test_root_returns_200(client):
    """GET / returns a JSON object with a message."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "environment" in data


async def test_health_returns_200(client):
    """GET /health returns 200 and a status field."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "degraded")
    assert "database" in data
    assert "service" in data
