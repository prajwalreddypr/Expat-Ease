from app.services.authentication import create_reset_token, get_reset_token


def test_inactive_user_cannot_log_in(client, user_factory):
    user_factory(email="inactive@example.com", is_active=False)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@example.com", "password": "ValidPass123!"},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Inactive user"}


def test_expired_reset_token_is_rejected_and_deleted(client, session, user_factory):
    user = user_factory(email="expired@example.com")
    reset_token = create_reset_token(session, user.id, expires_in_minutes=-1)

    response = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token.token, "new_password": "NewValidPass123!"},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid or expired token"}
    assert get_reset_token(session, reset_token.token) is None


def test_reset_token_is_single_use_and_new_password_works(client, session, user_factory):
    user = user_factory(email="reset@example.com", password="OldValidPass123!")
    reset_token = create_reset_token(session, user.id)
    payload = {"token": reset_token.token, "new_password": "NewValidPass123!"}

    first_reset = client.post("/api/v1/auth/reset-password", json=payload)
    reused_token = client.post("/api/v1/auth/reset-password", json=payload)
    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "reset@example.com", "password": "OldValidPass123!"},
    )
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "reset@example.com", "password": "NewValidPass123!"},
    )

    assert first_reset.status_code == 200
    assert first_reset.json() == {"msg": "Password reset successful"}
    assert reused_token.status_code == 400
    assert reused_token.json() == {"detail": "Invalid or expired token"}
    assert old_login.status_code == 401
    assert new_login.status_code == 200


def test_authenticated_password_change_replaces_credentials(client, auth_headers):
    changed = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={"new_password": "ReplacementPass123!"},
    )

    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "prajwal@example.com", "password": "ValidPass123!"},
    )
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "prajwal@example.com", "password": "ReplacementPass123!"},
    )

    assert changed.status_code == 200
    assert changed.json() == {"msg": "Password changed successfully"}
    assert old_login.status_code == 401
    assert new_login.status_code == 200


def test_registration_rejects_password_over_bcrypt_byte_limit(client):
    response = client.post(
        "/api/v1/users/",
        json={
            "email": "unicode@example.com",
            "password": "é" * 40,
            "full_name": "Unicode Password",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Password too long"}


def test_profile_update_cannot_bypass_password_workflow(client, auth_headers):
    response = client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"password": "BypassAttempt123!"},
    )

    assert response.status_code == 422


def test_change_password_by_email_uses_generic_credential_error(client, user_factory):
    user_factory(email="email-change@example.com", password="CurrentValid123!")

    response = client.post(
        "/api/v1/auth/change-password-by-email",
        json={
            "email": "email-change@example.com",
            "current_password": "WrongCurrent123!",
            "new_password": "NewValidPass123!",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid email or password"}
