from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.main import app
from app.db.init_db import create_db_and_tables
from app.db.session import engine
from sqlmodel import Session, select
from app.models.password_reset_token import PasswordResetToken


client = TestClient(app)


def test_forgot_reset_flow(tmp_path, monkeypatch):
    # Ensure DB is initialized (uses same settings as app)
    create_db_and_tables()

    # Create a test user via existing endpoint
    email = "test-reset@example.com"
    password = "initialPassword1"
    resp = client.post("/api/v1/users/", json={"email": email, "password": password, "full_name": "Reset Test"})
    assert resp.status_code == 201
    user = resp.json()

    # Request forgot-password (should return 200)
    resp = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert resp.status_code == 200

    # Grab token from DB
    from sqlmodel import Session
    with Session(engine) as session:
        stmt = select(PasswordResetToken).where(PasswordResetToken.user_id == user["id"]) 
        prt = session.exec(stmt).first()
        assert prt is not None
        token = prt.token

    # Reset password with a weak password should fail
    resp = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "short"})
    assert resp.status_code == 400

    # Reset password with valid password
    new_password = "NewSecurePass123"
    resp = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": new_password})
    assert resp.status_code == 200

    # Token should be removed or invalid now
    resp = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "AnotherPass12"})
    assert resp.status_code == 400

    # Try logging in with the new password via the auth endpoint
    resp = client.post("/api/v1/auth/login", data={"username": email, "password": new_password})
    assert resp.status_code == 200

    # Cleanup: delete user via direct DB session (if cleanup endpoints not available)
    # Note: leave records to the test DB lifecycle; assume SQLite file is local and can be reused.
