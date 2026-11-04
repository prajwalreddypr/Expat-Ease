from datetime import timedelta

from jose import jwt

from app.core.time import utc_now
from app.core.tokens import ALGORITHM
from app.models.user import User


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
    assert registered_user["is_demo"] is False
    assert registered_user["demo_expires_at"] is None
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


def test_malformed_token_subject_returns_unauthorized(client):
    token = jwt.encode(
        {"sub": "not-a-user-id", "email": "invalid@example.com"},
        "test-secret-key",
        algorithm=ALGORITHM,
    )

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials"}


def test_demo_session_creates_isolated_seeded_user(client):
    response = client.post("/api/v1/auth/demo")

    assert response.status_code == 201
    token = response.json()["access_token"]
    claims = jwt.decode(token, "test-secret-key", algorithms=[ALGORITHM])
    assert claims["is_demo"] is True

    headers = {"Authorization": f"Bearer {token}"}
    current_user = client.get("/api/v1/users/me", headers=headers)
    assert current_user.status_code == 200
    assert current_user.json()["is_demo"] is True
    assert current_user.json()["full_name"] == "Demo Guest"
    assert current_user.json()["settlement_country"] == "France"
    assert current_user.json()["country_selected"] is True
    assert current_user.json()["demo_expires_at"].endswith("Z")

    steps = client.get("/api/v1/settlement-steps/", headers=headers)
    assert steps.status_code == 200
    step_data = steps.json()
    assert len(step_data) == 7
    assert [step["is_completed"] for step in step_data[:3]] == [True, True, False]
    assert [step["is_unlocked"] for step in step_data[:4]] == [True, True, True, False]


def test_demo_user_can_edit_own_temporary_profile(client):
    demo = client.post("/api/v1/auth/demo").json()
    headers = {"Authorization": f"Bearer {demo['access_token']}"}

    response = client.patch("/api/v1/users/me", headers=headers, json={"city": "Lyon"})

    assert response.status_code == 200
    assert response.json()["city"] == "Lyon"
    assert response.json()["is_demo"] is True


def test_demo_user_cannot_create_shared_forum_content(client):
    demo = client.post("/api/v1/auth/demo").json()
    headers = {"Authorization": f"Bearer {demo['access_token']}"}

    browse_response = client.get("/api/v1/forum/questions", headers=headers)
    create_response = client.post(
        "/api/v1/forum/questions",
        headers=headers,
        json={"title": "Demo question", "content": "Should not persist", "category": "general"},
    )

    assert browse_response.status_code == 200
    assert create_response.status_code == 403
    assert create_response.json() == {"detail": "This action is unavailable in demo mode."}


def test_demo_user_cannot_upload_permanent_files_or_change_password(client):
    demo = client.post("/api/v1/auth/demo").json()
    headers = {"Authorization": f"Bearer {demo['access_token']}"}

    document_upload = client.post("/api/v1/documents/upload", headers=headers)
    photo_upload = client.post("/api/v1/users/me/profile-photo", headers=headers)
    password_change = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"new_password": "AnotherValidPass123!"},
    )

    assert document_upload.status_code == 403
    assert photo_upload.status_code == 403
    assert password_change.status_code == 403


def test_expired_demo_user_is_rejected(client, session):
    demo = client.post("/api/v1/auth/demo").json()
    claims = jwt.decode(demo["access_token"], "test-secret-key", algorithms=[ALGORITHM])
    user = session.get(User, int(claims["sub"]))
    user.demo_expires_at = utc_now() - timedelta(minutes=1)
    session.add(user)
    session.commit()

    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {demo['access_token']}"},
    )

    assert response.status_code == 401
