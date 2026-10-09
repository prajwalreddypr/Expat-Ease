from jose import jwt

from app.core.tokens import ALGORITHM


def test_register_login_and_read_current_user(client):
    registration = client.post(
        "/api/v1/users/",
        json={
            "email": "new.user@example.com",
            "password": "ValidPass123!",
            "full_name": "New User",
            "country": "India",
        },
    )

    assert registration.status_code == 201
    registered_user = registration.json()
    assert registered_user["id"] == 1
    assert registered_user["email"] == "new.user@example.com"
    assert registered_user["full_name"] == "New User"
    assert registered_user["country"] == "India"
    assert "hashed_password" not in registered_user

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "new.user@example.com", "password": "ValidPass123!"},
    )

    assert login.status_code == 200
    token_body = login.json()
    assert token_body["token_type"] == "bearer"
    claims = jwt.decode(
        token_body["access_token"],
        "test-secret-key",
        algorithms=[ALGORITHM],
    )
    assert claims["sub"] == "1"
    assert claims["email"] == "new.user@example.com"

    current_user = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_body['access_token']}"},
    )
    assert current_user.status_code == 200
    assert current_user.json()["email"] == "new.user@example.com"
    assert current_user.json()["full_name"] == "New User"


def test_registration_rejects_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "ValidPass123!",
        "full_name": "First User",
    }

    first = client.post("/api/v1/users/", json=payload)
    duplicate = client.post("/api/v1/users/", json=payload)

    assert first.status_code == 201
    assert duplicate.status_code == 400
    assert duplicate.json() == {"detail": "Email already registered"}


def test_login_rejects_incorrect_password(client, user_factory):
    user_factory(email="secure@example.com", password="CorrectPass123!")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "secure@example.com", "password": "WrongPass123!"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect password"}


def test_forgot_password_does_not_add_empty_token(client):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "missing@example.com"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "msg": "If an account with this email exists, a reset token has been issued."
    }
