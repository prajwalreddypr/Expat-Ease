from pathlib import Path
import sys

# ensure repo root on path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from app.main import app
from app.db.init_db import create_db_and_tables


def run():
    client = TestClient(app)
    create_db_and_tables()

    print('=== Authenticated verify/change flow ===')
    email = 'smoke-auth@example.com'
    pw = 'OldPass123!'
    new_pw = 'NewPass123!'

    # create user (ignore if exists)
    r = client.post('/api/v1/users/', json={'email': email, 'password': pw, 'full_name': 'Smoke Auth'})
    print('create user', r.status_code)

    # login
    r = client.post('/api/v1/auth/login', json={'email': email, 'password': pw})
    print('login status', r.status_code)
    if r.status_code != 200:
        print('login failed; aborting authenticated flow')
    else:
        token = r.json().get('access_token')
        # verify current password
        r2 = client.post('/api/v1/auth/verify-password', json={'current_password': pw}, headers={'Authorization': f'Bearer {token}'})
        print('verify-password', r2.status_code, r2.text)
        # change password
        r3 = client.post('/api/v1/auth/change-password', json={'new_password': new_pw}, headers={'Authorization': f'Bearer {token}'})
        print('change-password', r3.status_code, r3.text)
        # login with new password
        r4 = client.post('/api/v1/auth/login', json={'email': email, 'password': new_pw})
        print('re-login with new pw', r4.status_code, r4.json() if r4.status_code==200 else r4.text)

    print('\n=== Unauthenticated change-by-email flow ===')
    email2 = 'smoke-email@example.com'
    pw2 = 'StartPass123!'
    new_pw2 = 'AfterChange123!'

    r = client.post('/api/v1/users/', json={'email': email2, 'password': pw2, 'full_name': 'Smoke Email'})
    print('create user', r.status_code)

    # change by email endpoint
    r = client.post('/api/v1/auth/change-password-by-email', json={'email': email2, 'current_password': pw2, 'new_password': new_pw2})
    print('change-by-email', r.status_code, r.text)

    # login with new password
    r = client.post('/api/v1/auth/login', json={'email': email2, 'password': new_pw2})
    print('login after change-by-email', r.status_code, r.json() if r.status_code==200 else r.text)


if __name__ == '__main__':
    run()
