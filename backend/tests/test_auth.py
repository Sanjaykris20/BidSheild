"""Tests for app/auth/router.py (register, login, refresh, me, users)."""

import pytest

pytestmark = pytest.mark.asyncio


async def test_register_creates_user(client):
    """POST /auth/register creates a new user and returns its id."""
    response = await client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "strongpassword",
            "full_name": "New User",
            "role": "bidder",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "bidder"


async def test_register_duplicate_email_returns_400(client, seeded_user):
    """Registering the same email twice must 400."""
    response = await client.post(
        "/auth/register",
        json={"email": seeded_user.email, "password": "x"},
    )
    assert response.status_code == 400
    assert "already" in response.json()["detail"].lower()


async def test_login_returns_token_pair(client, seeded_user):
    """POST /auth/login returns access_token, refresh_token, token_type."""
    response = await client.post(
        "/auth/login",
        json={"email": seeded_user.email, "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["expires_in"], int)


async def test_login_bad_password_returns_401(client, seeded_user):
    """Wrong password must 401."""
    response = await client.post(
        "/auth/login",
        json={"email": seeded_user.email, "password": "wrong"},
    )
    assert response.status_code == 401


async def test_login_unknown_email_returns_401(client):
    """Unknown email must 401."""
    response = await client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "irrelevant"},
    )
    assert response.status_code == 401


async def test_me_returns_user_when_token_present(client, auth_headers, seeded_user):
    """GET /auth/me returns the authenticated user (header was broken)."""
    response = await client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == seeded_user.email
    assert data["role"] == "bidder"
    assert data["active"] is True


async def test_me_without_header_returns_401(client):
    """No Authorization header must 401."""
    response = await client.get("/auth/me")
    assert response.status_code == 401


async def test_me_with_garbage_header_returns_401(client):
    """Invalid token must 401."""
    response = await client.get("/auth/me", headers={"Authorization": "Bearer not-a-token"})
    assert response.status_code == 401


async def test_refresh_returns_new_pair(client, seeded_user):
    """POST /auth/refresh issues a new token pair and revokes the old."""
    login = await client.post(
        "/auth/login",
        json={"email": seeded_user.email, "password": "password123"},
    )
    refresh_token = login.json()["refresh_token"]

    response = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


async def test_logout_returns_message(client, seeded_user):
    """POST /auth/logout revokes the refresh token."""
    login = await client.post(
        "/auth/login",
        json={"email": seeded_user.email, "password": "password123"},
    )
    refresh_token = login.json()["refresh_token"]

    response = await client.post(
        "/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out"


async def test_users_endpoint_requires_admin(client, bidder_token, admin_token):
    """Non-admin tokens are rejected; admin tokens see all users."""
    # Bidder
    r1 = await client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {bidder_token}"},
    )
    assert r1.status_code == 403

    # Admin
    r2 = await client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r2.status_code == 200
    body = r2.json()
    assert isinstance(body, list)
    assert len(body) >= 1
