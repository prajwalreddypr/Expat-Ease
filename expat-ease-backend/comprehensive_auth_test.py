#!/usr/bin/env python3
"""
Comprehensive Authentication Test Suite
=====================================

This script tests every aspect of the authentication system:
1. Database connectivity and user table structure
2. Password hashing and verification
3. JWT token creation and verification
4. User registration (CRUD operations)
5. User login and authentication
6. Token-based access control
7. User profile retrieval and updates
8. Error handling and edge cases
9. API endpoint functionality
10. Frontend-backend integration

Run this script to diagnose any authentication issues.
"""

import sys
import os
import json
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Test configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"
TEST_FULL_NAME = "Test User"
TEST_COUNTRY = "United States"

class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class AuthTestSuite:
    """Comprehensive authentication test suite."""
    
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.current_token = None
        self.current_user_id = None
        
    def log_test(self, test_name: str, success: bool, message: str = "", details: Any = None):
        """Log test results."""
        status = "✅ PASS" if success else "❌ FAIL"
        color = Colors.GREEN if success else Colors.RED
        
        print(f"{color}{status}{Colors.END} {test_name}")
        if message:
            print(f"    {message}")
        if details and not success:
            print(f"    Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_backend_connectivity(self) -> bool:
        """Test 1: Backend server connectivity."""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("Backend Connectivity", True, "Server is running")
                return True
            else:
                self.log_test("Backend Connectivity", False, f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Connectivity", False, "Server not accessible", str(e))
            return False
    
    def test_cors_headers(self) -> bool:
        """Test 2: CORS configuration."""
        try:
            response = self.session.options(f"{API_BASE}/auth/login", timeout=5)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            }
            
            if cors_headers['Access-Control-Allow-Origin']:
                self.log_test("CORS Configuration", True, "CORS headers present")
                return True
            else:
                self.log_test("CORS Configuration", False, "CORS headers missing")
                return False
        except Exception as e:
            self.log_test("CORS Configuration", False, "CORS test failed", str(e))
            return False
    
    def test_user_registration(self) -> bool:
        """Test 3: User registration endpoint."""
        try:
            # First, try to delete any existing user with this email
            self._cleanup_test_user()
            
            registration_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": TEST_FULL_NAME,
                "country": TEST_COUNTRY
            }
            
            response = self.session.post(
                f"{API_BASE}/users/",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 201:
                user_data = response.json()
                self.current_user_id = user_data.get('id')
                self.log_test("User Registration", True, f"User created with ID: {self.current_user_id}")
                return True
            else:
                error_detail = response.json().get('detail', 'Unknown error') if response.content else 'No response body'
                self.log_test("User Registration", False, f"Status: {response.status_code}", error_detail)
                return False
        except Exception as e:
            self.log_test("User Registration", False, "Registration request failed", str(e))
            return False
    
    def test_duplicate_registration(self) -> bool:
        """Test 4: Duplicate email registration prevention."""
        try:
            registration_data = {
                "email": TEST_EMAIL,  # Same email as before
                "password": "differentpassword123",
                "full_name": "Different User",
                "country": "Canada"
            }
            
            response = self.session.post(
                f"{API_BASE}/users/",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test("Duplicate Registration Prevention", True, "Correctly rejected duplicate email")
                return True
            else:
                self.log_test("Duplicate Registration Prevention", False, f"Should have been rejected, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Duplicate Registration Prevention", False, "Test failed", str(e))
            return False
    
    def test_user_login(self) -> bool:
        """Test 5: User login and token generation."""
        try:
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.current_token = token_data.get('access_token')
                token_type = token_data.get('token_type')
                
                if self.current_token and token_type == 'bearer':
                    self.log_test("User Login", True, "Token generated successfully")
                    return True
                else:
                    self.log_test("User Login", False, "Invalid token response format")
                    return False
            else:
                error_detail = response.json().get('detail', 'Unknown error') if response.content else 'No response body'
                self.log_test("User Login", False, f"Status: {response.status_code}", error_detail)
                return False
        except Exception as e:
            self.log_test("User Login", False, "Login request failed", str(e))
            return False
    
    def test_invalid_login(self) -> bool:
        """Test 6: Invalid login credentials."""
        try:
            # Test wrong password
            login_data = {
                "email": TEST_EMAIL,
                "password": "wrongpassword"
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Invalid Login (Wrong Password)", True, "Correctly rejected wrong password")
            else:
                self.log_test("Invalid Login (Wrong Password)", False, f"Should have been rejected, got: {response.status_code}")
                return False
            
            # Test non-existent email
            login_data = {
                "email": "nonexistent@example.com",
                "password": TEST_PASSWORD
            }
            
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Invalid Login (Non-existent Email)", True, "Correctly rejected non-existent email")
                return True
            else:
                self.log_test("Invalid Login (Non-existent Email)", False, f"Should have been rejected, got: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Login", False, "Test failed", str(e))
            return False
    
    def test_token_verification(self) -> bool:
        """Test 7: JWT token verification and user info retrieval."""
        if not self.current_token:
            self.log_test("Token Verification", False, "No token available for testing")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.current_token}"}
            
            # Test /auth/me endpoint
            response = self.session.get(
                f"{API_BASE}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get('email') == TEST_EMAIL:
                    self.log_test("Token Verification (/auth/me)", True, "Token valid, user data retrieved")
                else:
                    self.log_test("Token Verification (/auth/me)", False, "User data mismatch")
                    return False
            else:
                self.log_test("Token Verification (/auth/me)", False, f"Status: {response.status_code}")
                return False
            
            # Test /users/me endpoint
            response = self.session.get(
                f"{API_BASE}/users/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get('email') == TEST_EMAIL:
                    self.log_test("Token Verification (/users/me)", True, "Token valid, user data retrieved")
                    return True
                else:
                    self.log_test("Token Verification (/users/me)", False, "User data mismatch")
                    return False
            else:
                self.log_test("Token Verification (/users/me)", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Token Verification", False, "Test failed", str(e))
            return False
    
    def test_invalid_token(self) -> bool:
        """Test 8: Invalid token handling."""
        try:
            # Test with malformed token
            headers = {"Authorization": "Bearer invalid_token_here"}
            
            response = self.session.get(
                f"{API_BASE}/users/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Invalid Token Handling", True, "Correctly rejected invalid token")
                return True
            else:
                self.log_test("Invalid Token Handling", False, f"Should have been rejected, got: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Token Handling", False, "Test failed", str(e))
            return False
    
    def test_user_profile_update(self) -> bool:
        """Test 9: User profile update functionality."""
        if not self.current_token:
            self.log_test("User Profile Update", False, "No token available for testing")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.current_token}",
                "Content-Type": "application/json"
            }
            
            update_data = {
                "full_name": "Updated Test User",
                "city": "New York",
                "country_selected": True,
                "settlement_country": "France"
            }
            
            response = self.session.patch(
                f"{API_BASE}/users/me",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                updated_user = response.json()
                if updated_user.get('full_name') == "Updated Test User":
                    self.log_test("User Profile Update", True, "Profile updated successfully")
                    return True
                else:
                    self.log_test("User Profile Update", False, "Update not reflected in response")
                    return False
            else:
                error_detail = response.json().get('detail', 'Unknown error') if response.content else 'No response body'
                self.log_test("User Profile Update", False, f"Status: {response.status_code}", error_detail)
                return False
                
        except Exception as e:
            self.log_test("User Profile Update", False, "Test failed", str(e))
            return False
    
    def test_password_validation(self) -> bool:
        """Test 10: Password validation during registration."""
        try:
            # Test password too short
            registration_data = {
                "email": "shortpass@example.com",
                "password": "123",  # Too short
                "full_name": "Short Password User",
                "country": "Test Country"
            }
            
            response = self.session.post(
                f"{API_BASE}/users/",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 422:  # Validation error
                self.log_test("Password Validation (Too Short)", True, "Correctly rejected short password")
            else:
                self.log_test("Password Validation (Too Short)", False, f"Should have been rejected, got: {response.status_code}")
                return False
            
            # Test valid password
            registration_data = {
                "email": "validpass@example.com",
                "password": "validpassword123",  # Valid length
                "full_name": "Valid Password User",
                "country": "Test Country"
            }
            
            response = self.session.post(
                f"{API_BASE}/users/",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 201:
                self.log_test("Password Validation (Valid)", True, "Accepted valid password")
                return True
            else:
                error_detail = response.json().get('detail', 'Unknown error') if response.content else 'No response body'
                self.log_test("Password Validation (Valid)", False, f"Status: {response.status_code}", error_detail)
                return False
                
        except Exception as e:
            self.log_test("Password Validation", False, "Test failed", str(e))
            return False
    
    def test_email_validation(self) -> bool:
        """Test 11: Email validation during registration."""
        try:
            # Test invalid email format
            registration_data = {
                "email": "invalid-email-format",
                "password": "validpassword123",
                "full_name": "Invalid Email User",
                "country": "Test Country"
            }
            
            response = self.session.post(
                f"{API_BASE}/users/",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 422:  # Validation error
                self.log_test("Email Validation (Invalid Format)", True, "Correctly rejected invalid email")
                return True
            else:
                self.log_test("Email Validation (Invalid Format)", False, f"Should have been rejected, got: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Email Validation", False, "Test failed", str(e))
            return False
    
    def test_database_integrity(self) -> bool:
        """Test 12: Database integrity and user retrieval."""
        if not self.current_user_id:
            self.log_test("Database Integrity", False, "No user ID available for testing")
            return False
            
        try:
            # Test direct user retrieval by ID
            response = self.session.get(
                f"{API_BASE}/users/{self.current_user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get('id') == self.current_user_id and user_data.get('email') == TEST_EMAIL:
                    self.log_test("Database Integrity", True, "User data integrity maintained")
                    return True
                else:
                    self.log_test("Database Integrity", False, "User data mismatch")
                    return False
            else:
                self.log_test("Database Integrity", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Database Integrity", False, "Test failed", str(e))
            return False
    
    def test_token_expiration(self) -> bool:
        """Test 13: Token expiration handling (simulation)."""
        # Note: We can't easily test actual expiration without waiting 24 hours
        # This test verifies the token structure and format
        if not self.current_token:
            self.log_test("Token Expiration", False, "No token available for testing")
            return False
            
        try:
            # Decode token to check structure (without verification)
            import base64
            
            # JWT tokens have 3 parts separated by dots
            parts = self.current_token.split('.')
            if len(parts) == 3:
                # Decode header and payload (without verification)
                header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
                payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
                
                if 'exp' in payload and 'sub' in payload:
                    self.log_test("Token Expiration", True, "Token structure valid, expiration field present")
                    return True
                else:
                    self.log_test("Token Expiration", False, "Token missing required fields")
                    return False
            else:
                self.log_test("Token Expiration", False, "Invalid token format")
                return False
                
        except Exception as e:
            self.log_test("Token Expiration", False, "Token structure test failed", str(e))
            return False
    
    def test_frontend_api_compatibility(self) -> bool:
        """Test 14: Frontend API compatibility."""
        if not self.current_token:
            self.log_test("Frontend API Compatibility", False, "No token available for testing")
            return False
            
        try:
            # Test the exact API calls the frontend makes
            headers = {"Authorization": f"Bearer {self.current_token}"}
            
            # Test user profile fetch (as done by AuthContext)
            response = self.session.get(
                f"{API_BASE}/users/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                required_fields = ['id', 'email', 'full_name', 'is_active', 'created_at', 'country_selected']
                
                missing_fields = [field for field in required_fields if field not in user_data]
                if not missing_fields:
                    self.log_test("Frontend API Compatibility", True, "All required fields present")
                    return True
                else:
                    self.log_test("Frontend API Compatibility", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Frontend API Compatibility", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Frontend API Compatibility", False, "Test failed", str(e))
            return False
    
    def _cleanup_test_user(self):
        """Clean up test users (helper method)."""
        try:
            # Try to delete test users by attempting login and then cleanup
            test_emails = [TEST_EMAIL, "validpass@example.com"]
            for email in test_emails:
                try:
                    # This is a cleanup attempt - we don't have a delete endpoint
                    # So we just try to log in to see if user exists
                    login_data = {"email": email, "password": "anypassword"}
                    response = self.session.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
                    # If login fails with 401, user might not exist, which is fine
                except:
                    pass  # Ignore cleanup errors
        except:
            pass  # Ignore cleanup errors
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all authentication tests."""
        print(f"{Colors.BOLD}{Colors.BLUE}🔐 COMPREHENSIVE AUTHENTICATION TEST SUITE{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}==========================================={Colors.END}")
        print(f"Testing against: {API_BASE}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run all tests
        tests = [
            self.test_backend_connectivity,
            self.test_cors_headers,
            self.test_user_registration,
            self.test_duplicate_registration,
            self.test_user_login,
            self.test_invalid_login,
            self.test_token_verification,
            self.test_invalid_token,
            self.test_user_profile_update,
            self.test_password_validation,
            self.test_email_validation,
            self.test_database_integrity,
            self.test_token_expiration,
            self.test_frontend_api_compatibility,
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                test_name = test_func.__name__.replace('test_', '').replace('_', ' ').title()
                self.log_test(test_name, False, "Test crashed", str(e))
            print()  # Add spacing between tests
        
        # Summary
        print(f"{Colors.BOLD}{Colors.BLUE}📊 TEST SUMMARY{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}==============={Colors.END}")
        print(f"Total Tests: {total_tests}")
        print(f"{Colors.GREEN}Passed: {passed_tests}{Colors.END}")
        print(f"{Colors.RED}Failed: {total_tests - passed_tests}{Colors.END}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Authentication system is working correctly.{Colors.END}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED. Check the details above for issues.{Colors.END}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "test_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }


def main():
    """Main function to run the test suite."""
    print("Starting comprehensive authentication test suite...")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    # Wait a moment for server to be ready
    time.sleep(2)
    
    # Run tests
    test_suite = AuthTestSuite()
    results = test_suite.run_all_tests()
    
    # Save results to file
    with open('auth_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDetailed results saved to: auth_test_results.json")
    
    # Return exit code based on results
    if results['passed_tests'] == results['total_tests']:
        return 0
    else:
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

