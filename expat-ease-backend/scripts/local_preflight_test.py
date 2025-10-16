import sys
from pathlib import Path

# Ensure the project root (expat-ease-backend) is on sys.path so 'app' can be imported
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from fastapi.testclient import TestClient
from app.main import app
import logging

# Configure logging so RequestLoggingMiddleware output is visible during the test
logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)

client = TestClient(app)
resp = client.options('/debug-echo', headers={
    'Origin': 'https://expat-ease.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type',
})
print('status', resp.status_code)
print('headers', dict(resp.headers))
try:
    print('json', resp.json())
except Exception as e:
    print('no json body:', e)
    print('text:', resp.text)
