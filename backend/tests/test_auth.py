import time
import pytest

@pytest.mark.asyncio
async def test_register_user(client):
    unique_email = f"reg_officer_{int(time.time() * 1000)}@yogya.gov.in"
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "Password@123",
            "full_name": "New Officer",
            "role": "officer"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["role"] == "officer"

@pytest.mark.asyncio
async def test_login_user(client, test_officer):
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test_officer@yogya.gov.in",
            "password": "Officer@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_officer@yogya.gov.in"

@pytest.mark.asyncio
async def test_get_me(client, officer_token):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_officer@yogya.gov.in"
