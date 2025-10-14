#!/usr/bin/env python3
"""
Script to check user password in database
"""
from app.db.session import get_session
from app.crud.crud_user import get_user_by_email
from app.core.security import verify_password

def check_user_password():
    """Check the user's password in the database"""
    session = next(get_session())
    
    # Get the user
    user = get_user_by_email(session, "reddyprajwal2000@gmail.com")
    if not user:
        print("❌ User not found")
        return
    
    print(f"✅ User found: {user.email}")
    print(f"   Full name: {user.full_name}")
    print(f"   Hashed password: {user.hashed_password}")
    
    # Test common passwords
    common_passwords = [
        "test123",
        "password",
        "123456",
        "password123",
        "admin",
        "test",
        "123456789",
        "qwerty",
        "abc123",
        "password1",
        "12345678",
        "welcome",
        "monkey",
        "dragon",
        "master",
        "hello",
        "login",
        "pass",
        "letmein",
        "welcome123"
    ]
    
    print("\n🔍 Testing common passwords...")
    for password in common_passwords:
        if verify_password(password, user.hashed_password):
            print(f"✅ CORRECT PASSWORD FOUND: '{password}'")
            session.close()
            return password
    
    print("❌ None of the common passwords worked")
    print("💡 You'll need to either:")
    print("   1. Reset the password")
    print("   2. Create a new user")
    print("   3. Check what password was used during registration")
    
    session.close()
    return None

if __name__ == "__main__":
    check_user_password()
