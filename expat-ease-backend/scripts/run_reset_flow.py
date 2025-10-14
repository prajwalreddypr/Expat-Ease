import sys
from pathlib import Path

# Ensure repo root is on sys.path so `app` package can be imported when running this script
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import create_db_and_tables
from app.db.session import engine
from sqlmodel import Session, select
from app.models.password_reset_token import PasswordResetToken


def run():
    client = TestClient(app)
    create_db_and_tables()

    # Diagnostic: print registered routes
    print('\nRegistered routes:')
    for route in app.routes:
        try:
            methods = ','.join(route.methods) if hasattr(route, 'methods') and route.methods else ''
        except Exception:
            methods = ''
        print(f"{getattr(route, 'path', str(route))}    {methods}")

    email = 'script-test-reset@example.com'
    password = 'initialPwd123'
    resp = client.post('/api/v1/users/', json={'email': email, 'password': password, 'full_name': 'Script Test'})
    print('create user status', resp.status_code)
    if resp.status_code == 201:
        user = resp.json()
    else:
        # Try to fetch existing user by hitting the users list or by login (simple fallback)
        from app.db.session import engine
        from sqlmodel import Session, select
        from app.models.user import User

        with Session(engine) as session:
            stmt = select(User).where(User.email == email)
            user_obj = session.exec(stmt).first()
            if not user_obj:
                print('Failed to create or find user; aborting')
                return
            user = {"id": user_obj.id, "email": user_obj.email}

    resp = client.post('/api/v1/auth/forgot-password', json={'email': email})
    print('forgot status', resp.status_code, resp.json())

    with Session(engine) as session:
        stmt = select(PasswordResetToken).where(PasswordResetToken.user_id == user['id'])
        prt = session.exec(stmt).first()
        print('got token', bool(prt))
        token = prt.token

    # try weak password
    resp = client.post('/api/v1/auth/reset-password', json={'token': token, 'new_password': 'short'})
    print('weak reset status', resp.status_code, resp.text)
    # proper reset
    new_password = 'NewPassw0rd!!'
    resp = client.post('/api/v1/auth/reset-password', json={'token': token, 'new_password': new_password})
    print('reset status', resp.status_code, resp.text)
    # token reuse attempt
    resp = client.post('/api/v1/auth/reset-password', json={'token': token, 'new_password': 'AnotherPass12'})
    print('reuse status', resp.status_code, resp.text)
    # login with new password
    resp = client.post('/api/v1/auth/login', json={'email': email, 'password': new_password})
    print('login status', resp.status_code, resp.json())


if __name__ == '__main__':
    run()
