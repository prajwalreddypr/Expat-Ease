#!/usr/bin/env python3
"""
Test login with correct password
"""
from app.api.api_v1.endpoints.auth import login
from app.models.auth import LoginRequest
from app.db.session import get_session

def test_login():
    """Test login with correct password"""
    print("🔐 Testing login with correct password...")
    
    # Create login request with correct password
    login_data = LoginRequest(
        email="reddyprajwal2000@gmail.com",
        password="12345678"  # Correct password
    )
    
    try:
        # Get session
        session = next(get_session())
        
        # Call the login function directly
        result = login(login_data, session)
        print(f"✅ Login successful!")
        print(f"   Access token: {result.access_token[:50]}...")
        print(f"   Token type: {result.token_type}")
        
        session.close()
        return True
    except Exception as e:
        print(f"❌ Login failed: {e}")
        session.close()
        return False

if __name__ == "__main__":
    test_login()
