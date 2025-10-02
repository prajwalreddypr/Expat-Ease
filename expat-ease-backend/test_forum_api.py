#!/usr/bin/env python3
"""
Comprehensive Forum API Test Script
Tests all forum functionality including questions, answers, and voting
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Test data
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
}

TEST_QUESTION = {
    "title": "Test Question for API Testing",
    "content": "This is a test question to verify the forum API functionality works correctly.",
    "category": "general"
}

TEST_ANSWER = {
    "content": "This is a test answer to verify the answer posting functionality works correctly."
}

class ForumAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.question_id = None
        self.answer_id = None
        self.test_results = []

    def log_test(self, test_name, success, message=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })

    def test_health_check(self):
        """Test 1: Health Check"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                self.log_test("Health Check", True, "Backend is running")
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_user_registration(self):
        """Test 2: User Registration"""
        try:
            response = self.session.post(f"{API_BASE}/users/", json=TEST_USER)
            if response.status_code == 201:
                self.log_test("User Registration", True, "User registered successfully")
                return True
            elif response.status_code == 400 and "already exists" in response.text:
                self.log_test("User Registration", True, "User already exists (expected)")
                return True
            else:
                self.log_test("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False

    def test_user_login(self):
        """Test 3: User Login"""
        try:
            login_data = {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                if self.token:
                    self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                    self.log_test("User Login", True, "Login successful, token obtained")
                    return True
                else:
                    self.log_test("User Login", False, "No token in response")
                    return False
            else:
                self.log_test("User Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
            return False

    def test_create_question(self):
        """Test 4: Create Question"""
        try:
            response = self.session.post(f"{API_BASE}/forum/questions", json=TEST_QUESTION)
            if response.status_code == 200:
                data = response.json()
                self.question_id = data.get("id")
                if self.question_id:
                    self.log_test("Create Question", True, f"Question created with ID: {self.question_id}")
                    return True
                else:
                    self.log_test("Create Question", False, "No question ID in response")
                    return False
            else:
                self.log_test("Create Question", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Question", False, f"Error: {str(e)}")
            return False

    def test_get_questions(self):
        """Test 5: Get Questions"""
        try:
            response = self.session.get(f"{API_BASE}/forum/questions")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Get Questions", True, f"Retrieved {len(data)} questions")
                    return True
                else:
                    self.log_test("Get Questions", False, "No questions returned or invalid format")
                    return False
            else:
                self.log_test("Get Questions", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Questions", False, f"Error: {str(e)}")
            return False

    def test_get_question_details(self):
        """Test 6: Get Question Details"""
        if not self.question_id:
            self.log_test("Get Question Details", False, "No question ID available")
            return False
        
        try:
            response = self.session.get(f"{API_BASE}/forum/questions/{self.question_id}")
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "answers" in data:
                    self.log_test("Get Question Details", True, f"Question details retrieved, {len(data.get('answers', []))} answers")
                    return True
                else:
                    self.log_test("Get Question Details", False, "Invalid question data structure")
                    return False
            else:
                self.log_test("Get Question Details", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Question Details", False, f"Error: {str(e)}")
            return False

    def test_create_answer(self):
        """Test 7: Create Answer"""
        if not self.question_id:
            self.log_test("Create Answer", False, "No question ID available")
            return False
        
        try:
            response = self.session.post(f"{API_BASE}/forum/questions/{self.question_id}/answers", json=TEST_ANSWER)
            if response.status_code == 200:
                data = response.json()
                self.answer_id = data.get("id")
                if self.answer_id:
                    self.log_test("Create Answer", True, f"Answer created with ID: {self.answer_id}")
                    return True
                else:
                    self.log_test("Create Answer", False, "No answer ID in response")
                    return False
            else:
                self.log_test("Create Answer", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Answer", False, f"Error: {str(e)}")
            return False

    def test_vote_question(self):
        """Test 8: Vote on Question"""
        if not self.question_id:
            self.log_test("Vote Question", False, "No question ID available")
            return False
        
        try:
            # Test upvote
            response = self.session.post(f"{API_BASE}/forum/questions/{self.question_id}/vote?is_upvote=true")
            if response.status_code == 200:
                self.log_test("Vote Question (Upvote)", True, "Question upvoted successfully")
                
                # Test downvote
                response = self.session.post(f"{API_BASE}/forum/questions/{self.question_id}/vote?is_upvote=false")
                if response.status_code == 200:
                    self.log_test("Vote Question (Downvote)", True, "Question downvoted successfully")
                    return True
                else:
                    self.log_test("Vote Question (Downvote)", False, f"Status: {response.status_code}")
                    return False
            else:
                self.log_test("Vote Question (Upvote)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Vote Question", False, f"Error: {str(e)}")
            return False

    def test_vote_answer(self):
        """Test 9: Vote on Answer"""
        if not self.answer_id:
            self.log_test("Vote Answer", False, "No answer ID available")
            return False
        
        try:
            # Test upvote
            response = self.session.post(f"{API_BASE}/forum/answers/{self.answer_id}/vote?is_upvote=true")
            if response.status_code == 200:
                self.log_test("Vote Answer (Upvote)", True, "Answer upvoted successfully")
                
                # Test downvote
                response = self.session.post(f"{API_BASE}/forum/answers/{self.answer_id}/vote?is_upvote=false")
                if response.status_code == 200:
                    self.log_test("Vote Answer (Downvote)", True, "Answer downvoted successfully")
                    return True
                else:
                    self.log_test("Vote Answer (Downvote)", False, f"Status: {response.status_code}")
                    return False
            else:
                self.log_test("Vote Answer (Upvote)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Vote Answer", False, f"Error: {str(e)}")
            return False

    def test_accept_answer(self):
        """Test 10: Accept Answer"""
        if not self.answer_id:
            self.log_test("Accept Answer", False, "No answer ID available")
            return False
        
        try:
            response = self.session.post(f"{API_BASE}/forum/answers/{self.answer_id}/accept")
            if response.status_code == 200:
                self.log_test("Accept Answer", True, "Answer accepted successfully")
                return True
            else:
                self.log_test("Accept Answer", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Accept Answer", False, f"Error: {str(e)}")
            return False

    def test_category_filtering(self):
        """Test 11: Category Filtering"""
        try:
            response = self.session.get(f"{API_BASE}/forum/questions?category=general")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Category Filtering", True, f"Filtered questions retrieved: {len(data)}")
                return True
            else:
                self.log_test("Category Filtering", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Category Filtering", False, f"Error: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test 12: Unauthorized Access"""
        try:
            # Test without token
            temp_session = requests.Session()
            response = temp_session.get(f"{API_BASE}/forum/questions")
            if response.status_code == 401:
                self.log_test("Unauthorized Access", True, "Correctly rejected unauthorized access")
                return True
            else:
                self.log_test("Unauthorized Access", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Unauthorized Access", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Forum API Testing")
        print("=" * 50)
        
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_create_question,
            self.test_get_questions,
            self.test_get_question_details,
            self.test_create_answer,
            self.test_vote_question,
            self.test_vote_answer,
            self.test_accept_answer,
            self.test_category_filtering,
            self.test_unauthorized_access
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ ERROR in {test.__name__}: {str(e)}")
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 50)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Forum API is working perfectly!")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
        
        return passed == total

    def generate_report(self):
        """Generate detailed test report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(self.test_results),
            "passed_tests": sum(1 for result in self.test_results if result["success"]),
            "failed_tests": sum(1 for result in self.test_results if not result["success"]),
            "test_results": self.test_results
        }
        
        with open("forum_test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: forum_test_report.json")

if __name__ == "__main__":
    tester = ForumAPITester()
    success = tester.run_all_tests()
    tester.generate_report()
    
    if success:
        exit(0)
    else:
        exit(1)
