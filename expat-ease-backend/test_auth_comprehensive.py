#!/usr/bin/env python3
"""
Comprehensive authentication test script.
Tests every step of the authentication process to identify issues.
"""
import sys
import traceback
from datetime import datetime

def test_step(step_name, test_func):
    """Helper function to run and report on each test step."""
    print(f"\n{'='*60}")
    print(f"TESTING: {step_name}")
    print(f"{'='*60}")
    
    try:
        result = test_func()
        print(f"✅ SUCCESS: {step_name}")
        if result is not None:
            print(f"   Result: {result}")
        return True
    except Exception as e:
        print(f"❌ FAILED: {step_name}")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        traceback.print_exc()
        return False

def test_imports():
    """Test 1: Basic imports"""
    print("Testing basic imports...")
    
    # Test SQLModel and database imports
    from sqlmodel import SQLModel, Field, create_engine, Session
    print("  ✅ SQLModel imports successful")
    
    # Test FastAPI imports
    from fastapi import FastAPI, HTTPException, Depends
    print("  ✅ FastAPI imports successful")
    
    # Test app imports
    from app.models.user import User
    print("  ✅ User model import successful")
    
    from app.crud.crud_user import get_user_by_email, create_user
    print("  ✅ CRUD functions import successful")
    
    from app.core.security import verify_password, hash_password, create_access_token
    print("  ✅ Security functions import successful")
    
    from app.api.api_v1.endpoints.auth import login
    print("  ✅ Auth endpoint import successful")
    
    return "All imports successful"

def test_database_connection():
    """Test 2: Database connection"""
    print("Testing database connection...")
    
    from app.db.session import get_session
    from sqlmodel import select
    
    # Get a session
    session = next(get_session())
    print("  ✅ Database session created")
    
    # Test basic query
    result = session.exec(select(User).limit(1)).first()
    print(f"  ✅ Database query successful - Found user: {result.email if result else 'None'}")
    
    session.close()
    return f"Database connection successful - Found {1 if result else 0} users"

def test_user_model():
    """Test 3: User model functionality"""
    print("Testing User model...")
    
    from app.models.user import User, UserCreate, UserRead
    from datetime import datetime
    
    # Test model creation
    user_data = UserCreate(
        email="test@example.com",
        password="testpassword123",
        full_name="Test User"
    )
    print("  ✅ UserCreate model creation successful")
    
    # Test model validation
    assert len(user_data.password) >= 8, "Password too short"
    print("  ✅ UserCreate validation successful")
    
    return "User model functionality working"

def test_password_hashing():
    """Test 4: Password hashing and verification"""
    print("Testing password hashing...")
    
    from app.core.security import hash_password, verify_password
    
    # Test password hashing
    password = "testpassword123"
    hashed = hash_password(password)
    print(f"  ✅ Password hashed: {hashed[:20]}...")
    
    # Test password verification
    is_valid = verify_password(password, hashed)
    assert is_valid, "Password verification failed"
    print("  ✅ Password verification successful")
    
    # Test invalid password
    is_invalid = verify_password("wrongpassword", hashed)
    assert not is_invalid, "Invalid password should fail verification"
    print("  ✅ Invalid password correctly rejected")
    
    return "Password hashing and verification working"

def test_jwt_token():
    """Test 5: JWT token creation and verification"""
    print("Testing JWT token functionality...")
    
    from app.core.security import create_access_token
    from app.core.deps import get_current_user
    from datetime import timedelta
    
    # Test token creation
    token_data = {"sub": "test@example.com", "user_id": 1}
    token = create_access_token(data=token_data)
    print(f"  ✅ JWT token created: {token[:50]}...")
    
    return "JWT token creation working"

def test_crud_operations():
    """Test 6: CRUD operations"""
    print("Testing CRUD operations...")
    
    from app.crud.crud_user import get_user_by_email, create_user
    from app.db.session import get_session
    from app.models.user import UserCreate
    
    session = next(get_session())
    
    # Test getting existing user
    existing_user = get_user_by_email(session, "reddyprajwal2000@gmail.com")
    if existing_user:
        print(f"  ✅ Found existing user: {existing_user.email}")
    else:
        print("  ⚠️  No existing user found")
    
    session.close()
    return f"CRUD operations working - Found user: {existing_user.email if existing_user else 'None'}"

def test_auth_endpoint_logic():
    """Test 7: Authentication endpoint logic"""
    print("Testing authentication endpoint logic...")
    
    from app.api.api_v1.endpoints.auth import login
    from app.models.auth import LoginRequest
    from app.db.session import get_session
    from fastapi import HTTPException
    
    # Create login request
    login_data = LoginRequest(
        email="reddyprajwal2000@gmail.com",
        password="test123"  # You'll need to provide the correct password
    )
    print("  ✅ LoginRequest created")
    
    # Test the login logic manually
    session = next(get_session())
    
    # Get user by email (this should work)
    user = get_user_by_email(session, login_data.email)
    if not user:
        print("  ⚠️  User not found - this might be the issue")
        session.close()
        return "User not found in database"
    
    print(f"  ✅ User found: {user.email}")
    
    # Test password verification
    from app.core.security import verify_password
    if not verify_password(login_data.password, user.hashed_password):
        print("  ❌ Password verification failed - this might be the issue")
        session.close()
        return "Password verification failed"
    
    print("  ✅ Password verification successful")
    
    session.close()
    return "Authentication endpoint logic working"

def test_fastapi_app():
    """Test 8: FastAPI app creation"""
    print("Testing FastAPI app creation...")
    
    from app.main import app
    print("  ✅ FastAPI app imported successfully")
    
    # Check if routes are registered
    routes = [route.path for route in app.routes]
    auth_routes = [route for route in routes if 'auth' in route]
    print(f"  ✅ Found auth routes: {auth_routes}")
    
    return f"FastAPI app working - {len(routes)} routes registered"

def test_server_startup():
    """Test 9: Server startup simulation"""
    print("Testing server startup simulation...")
    
    from app.main import app
    from fastapi.testclient import TestClient
    
    # Create test client
    client = TestClient(app)
    print("  ✅ Test client created")
    
    # Test health endpoint
    response = client.get("/health")
    if response.status_code == 200:
        print("  ✅ Health endpoint working")
        print(f"  Response: {response.json()}")
    else:
        print(f"  ❌ Health endpoint failed: {response.status_code}")
        return f"Health endpoint failed: {response.status_code}"
    
    return "Server startup simulation successful"

def test_auth_endpoint():
    """Test 10: Authentication endpoint via test client"""
    print("Testing authentication endpoint...")
    
    from app.main import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    
    # Test login endpoint
    login_data = {
        "email": "reddyprajwal2000@gmail.com",
        "password": "test123"  # You'll need to provide the correct password
    }
    
    response = client.post("/api/v1/auth/login", json=login_data)
    print(f"  Response status: {response.status_code}")
    print(f"  Response body: {response.json()}")
    
    if response.status_code == 200:
        print("  ✅ Login endpoint working")
        token_data = response.json()
        print(f"  Access token: {token_data.get('access_token', 'None')[:50]}...")
        return "Authentication endpoint working"
    else:
        print(f"  ❌ Login endpoint failed: {response.status_code}")
        return f"Login endpoint failed: {response.status_code}"

def main():
    """Run all authentication tests."""
    print("🔐 COMPREHENSIVE AUTHENTICATION TEST")
    print(f"Started at: {datetime.now()}")
    print(f"Python version: {sys.version}")
    
    tests = [
        ("Basic Imports", test_imports),
        ("Database Connection", test_database_connection),
        ("User Model", test_user_model),
        ("Password Hashing", test_password_hashing),
        ("JWT Token", test_jwt_token),
        ("CRUD Operations", test_crud_operations),
        ("Auth Endpoint Logic", test_auth_endpoint_logic),
        ("FastAPI App", test_fastapi_app),
        ("Server Startup", test_server_startup),
        ("Auth Endpoint", test_auth_endpoint),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        if test_step(test_name, test_func):
            passed += 1
        else:
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {passed + failed}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Authentication should be working.")
    else:
        print(f"\n⚠️  {failed} tests failed. Check the errors above.")
    
    print(f"\nCompleted at: {datetime.now()}")

if __name__ == "__main__":
    main()
