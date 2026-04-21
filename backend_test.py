#!/usr/bin/env python3
"""
Backend API Testing for maligeeAi
Tests all new endpoints: auth, builds, chat, pricing
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://genesis-clone-1.preview.emergentagent.com/api"
UNIQUE_EMAIL = f"testuser_{int(time.time())}@test.com"
TEST_PASSWORD = "test123456"
TEST_NAME = "Test User"

# Global variables to store test data
auth_token = None
user_data = None
first_build_id = None
second_build_id = None
session_id = None

def log_test(test_name, status, details=""):
    """Log test results"""
    status_symbol = "✅" if status == "PASS" else "❌"
    print(f"{status_symbol} {test_name}: {details}")

def test_auth_signup():
    """Test POST /api/auth/signup"""
    global auth_token, user_data
    
    print("\n=== Testing Auth Signup ===")
    
    payload = {
        "email": UNIQUE_EMAIL,
        "password": TEST_PASSWORD,
        "name": TEST_NAME
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "token" in data and "user" in data:
                auth_token = data["token"]
                user_data = data["user"]
                
                # Validate user data
                user = data["user"]
                required_fields = ["id", "email", "name", "created_at", "build_count", "has_free_build"]
                missing_fields = [field for field in required_fields if field not in user]
                
                if missing_fields:
                    log_test("Auth Signup", "FAIL", f"Missing user fields: {missing_fields}")
                    return False
                
                # Validate specific values
                if user["email"] != UNIQUE_EMAIL.lower():
                    log_test("Auth Signup", "FAIL", f"Email mismatch: expected {UNIQUE_EMAIL.lower()}, got {user['email']}")
                    return False
                
                if user["build_count"] != 0:
                    log_test("Auth Signup", "FAIL", f"Build count should be 0, got {user['build_count']}")
                    return False
                
                if user["has_free_build"] != True:
                    log_test("Auth Signup", "FAIL", f"has_free_build should be True, got {user['has_free_build']}")
                    return False
                
                log_test("Auth Signup", "PASS", f"User created with ID: {user['id']}")
                return True
            else:
                log_test("Auth Signup", "FAIL", f"Missing token or user in response: {data}")
                return False
        else:
            log_test("Auth Signup", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Auth Signup", "FAIL", f"Exception: {str(e)}")
        return False

def test_auth_login():
    """Test POST /api/auth/login"""
    global auth_token, user_data
    
    print("\n=== Testing Auth Login ===")
    
    payload = {
        "email": UNIQUE_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            if "token" in data and "user" in data:
                auth_token = data["token"]  # Update token
                user_data = data["user"]
                
                log_test("Auth Login", "PASS", f"Login successful for {data['user']['email']}")
                return True
            else:
                log_test("Auth Login", "FAIL", f"Missing token or user in response: {data}")
                return False
        else:
            log_test("Auth Login", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Auth Login", "FAIL", f"Exception: {str(e)}")
        return False

def test_auth_me():
    """Test GET /api/auth/me"""
    print("\n=== Testing Auth Me ===")
    
    if not auth_token:
        log_test("Auth Me", "FAIL", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            required_fields = ["id", "email", "name", "created_at", "build_count", "has_free_build"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                log_test("Auth Me", "FAIL", f"Missing fields: {missing_fields}")
                return False
            
            log_test("Auth Me", "PASS", f"Profile retrieved for {data['email']}")
            return True
        else:
            log_test("Auth Me", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Auth Me", "FAIL", f"Exception: {str(e)}")
        return False

def test_create_first_build():
    """Test POST /api/builds - first build should be FREE"""
    global first_build_id
    
    print("\n=== Testing Create First Build (FREE) ===")
    
    if not auth_token:
        log_test("Create First Build", "FAIL", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "name": "My First App",
        "description": "Testing first free build"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/builds", json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            first_build_id = data.get("id")
            
            # Validate first build is free
            if data.get("is_free") != True:
                log_test("Create First Build", "FAIL", f"First build should be free, got is_free={data.get('is_free')}")
                return False
            
            if data.get("payment_status") != "free":
                log_test("Create First Build", "FAIL", f"First build payment_status should be 'free', got '{data.get('payment_status')}'")
                return False
            
            log_test("Create First Build", "PASS", f"Free build created with ID: {first_build_id}")
            return True
        else:
            log_test("Create First Build", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Create First Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_create_second_build():
    """Test POST /api/builds - second build should cost $10"""
    global second_build_id
    
    print("\n=== Testing Create Second Build ($10) ===")
    
    if not auth_token:
        log_test("Create Second Build", "FAIL", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "name": "Second App",
        "description": "Testing paid build"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/builds", json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            second_build_id = data.get("id")
            
            # Validate second build requires payment
            if data.get("is_free") != False:
                log_test("Create Second Build", "FAIL", f"Second build should not be free, got is_free={data.get('is_free')}")
                return False
            
            if data.get("payment_status") != "pending":
                log_test("Create Second Build", "FAIL", f"Second build payment_status should be 'pending', got '{data.get('payment_status')}'")
                return False
            
            log_test("Create Second Build", "PASS", f"Paid build created with ID: {second_build_id}")
            return True
        else:
            log_test("Create Second Build", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Create Second Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_get_builds():
    """Test GET /api/builds"""
    print("\n=== Testing Get Builds ===")
    
    if not auth_token:
        log_test("Get Builds", "FAIL", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/builds", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if not isinstance(data, list):
                log_test("Get Builds", "FAIL", f"Expected list, got {type(data)}")
                return False
            
            if len(data) != 2:
                log_test("Get Builds", "FAIL", f"Expected 2 builds, got {len(data)}")
                return False
            
            log_test("Get Builds", "PASS", f"Retrieved {len(data)} builds")
            return True
        else:
            log_test("Get Builds", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Get Builds", "FAIL", f"Exception: {str(e)}")
        return False

def test_deploy_unpaid_build():
    """Test POST /api/builds/{second_build_id}/deploy - should FAIL with 402"""
    print("\n=== Testing Deploy Unpaid Build (Should Fail) ===")
    
    if not auth_token or not second_build_id:
        log_test("Deploy Unpaid Build", "FAIL", "No auth token or second build ID available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/builds/{second_build_id}/deploy", headers=headers)
        
        if response.status_code == 402:
            log_test("Deploy Unpaid Build", "PASS", "Correctly rejected unpaid build deployment with 402")
            return True
        else:
            log_test("Deploy Unpaid Build", "FAIL", f"Expected 402, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Deploy Unpaid Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_pay_for_build():
    """Test POST /api/builds/{second_build_id}/pay - mock payment"""
    print("\n=== Testing Pay for Build ===")
    
    if not auth_token or not second_build_id:
        log_test("Pay for Build", "FAIL", "No auth token or second build ID available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/builds/{second_build_id}/pay", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if "payment_status" in data and data["payment_status"] == "mock_paid":
                log_test("Pay for Build", "PASS", "Mock payment successful")
                return True
            else:
                log_test("Pay for Build", "FAIL", f"Unexpected payment response: {data}")
                return False
        else:
            log_test("Pay for Build", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Pay for Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_deploy_paid_build():
    """Test POST /api/builds/{second_build_id}/deploy - should succeed after payment"""
    print("\n=== Testing Deploy Paid Build ===")
    
    if not auth_token or not second_build_id:
        log_test("Deploy Paid Build", "FAIL", "No auth token or second build ID available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/builds/{second_build_id}/deploy", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "deployed":
                log_test("Deploy Paid Build", "PASS", "Paid build deployed successfully")
                return True
            else:
                log_test("Deploy Paid Build", "FAIL", f"Unexpected deploy response: {data}")
                return False
        else:
            log_test("Deploy Paid Build", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Deploy Paid Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_deploy_free_build():
    """Test POST /api/builds/{first_build_id}/deploy - free build should deploy without payment"""
    print("\n=== Testing Deploy Free Build ===")
    
    if not auth_token or not first_build_id:
        log_test("Deploy Free Build", "FAIL", "No auth token or first build ID available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/builds/{first_build_id}/deploy", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "deployed":
                log_test("Deploy Free Build", "PASS", "Free build deployed successfully")
                return True
            else:
                log_test("Deploy Free Build", "FAIL", f"Unexpected deploy response: {data}")
                return False
        else:
            log_test("Deploy Free Build", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Deploy Free Build", "FAIL", f"Exception: {str(e)}")
        return False

def test_get_pricing():
    """Test GET /api/pricing"""
    print("\n=== Testing Get Pricing ===")
    
    try:
        response = requests.get(f"{BASE_URL}/pricing")
        
        if response.status_code == 200:
            data = response.json()
            
            if "plans" not in data:
                log_test("Get Pricing", "FAIL", "Missing 'plans' in response")
                return False
            
            plans = data["plans"]
            if not isinstance(plans, list) or len(plans) < 2:
                log_test("Get Pricing", "FAIL", f"Expected at least 2 pricing plans, got {len(plans) if isinstance(plans, list) else 'not a list'}")
                return False
            
            # Check for free plan
            free_plan = next((p for p in plans if p.get("price") == 0), None)
            if not free_plan:
                log_test("Get Pricing", "FAIL", "No free plan found")
                return False
            
            # Check for paid plan
            paid_plan = next((p for p in plans if p.get("price") == 10.0), None)
            if not paid_plan:
                log_test("Get Pricing", "FAIL", "No $10 plan found")
                return False
            
            log_test("Get Pricing", "PASS", f"Retrieved {len(plans)} pricing plans")
            return True
        else:
            log_test("Get Pricing", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Get Pricing", "FAIL", f"Exception: {str(e)}")
        return False

def test_chat():
    """Test POST /api/chat"""
    global session_id
    
    print("\n=== Testing Chat ===")
    
    if not auth_token:
        log_test("Chat", "FAIL", "No auth token available")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "message": "Hello, who are you?"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            if "response" not in data or "session_id" not in data:
                log_test("Chat", "FAIL", f"Missing response or session_id: {data}")
                return False
            
            session_id = data["session_id"]
            ai_response = data["response"]
            
            if not ai_response or len(ai_response.strip()) == 0:
                log_test("Chat", "FAIL", "Empty AI response")
                return False
            
            log_test("Chat", "PASS", f"AI responded with session_id: {session_id}")
            return True
        else:
            log_test("Chat", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Chat", "FAIL", f"Exception: {str(e)}")
        return False

def test_duplicate_signup():
    """Test POST /api/auth/signup with duplicate email - should return 409"""
    print("\n=== Testing Duplicate Signup ===")
    
    payload = {
        "email": UNIQUE_EMAIL,  # Same email as before
        "password": TEST_PASSWORD,
        "name": "Duplicate User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        
        if response.status_code == 409:
            log_test("Duplicate Signup", "PASS", "Correctly rejected duplicate email with 409")
            return True
        else:
            log_test("Duplicate Signup", "FAIL", f"Expected 409, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Duplicate Signup", "FAIL", f"Exception: {str(e)}")
        return False

def test_wrong_password():
    """Test POST /api/auth/login with wrong password - should return 401"""
    print("\n=== Testing Wrong Password ===")
    
    payload = {
        "email": UNIQUE_EMAIL,
        "password": "wrongpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        
        if response.status_code == 401:
            log_test("Wrong Password", "PASS", "Correctly rejected wrong password with 401")
            return True
        else:
            log_test("Wrong Password", "FAIL", f"Expected 401, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Wrong Password", "FAIL", f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all tests in the specified order"""
    print(f"🚀 Starting maligeeAi Backend API Tests")
    print(f"📧 Using test email: {UNIQUE_EMAIL}")
    print(f"🌐 Testing against: {BASE_URL}")
    
    tests = [
        test_auth_signup,
        test_auth_login,
        test_auth_me,
        test_create_first_build,
        test_create_second_build,
        test_get_builds,
        test_deploy_unpaid_build,
        test_pay_for_build,
        test_deploy_paid_build,
        test_deploy_free_build,
        test_get_pricing,
        test_chat,
        test_duplicate_signup,
        test_wrong_password
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test_func.__name__}: EXCEPTION - {str(e)}")
            failed += 1
    
    print(f"\n📊 Test Results:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    return passed, failed

if __name__ == "__main__":
    run_all_tests()