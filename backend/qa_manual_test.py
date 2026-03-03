#!/usr/bin/env python3
"""
TeacherFlow - Manual QA Test Script
Testa todas as funcionalidades da aplicação

Uso:
    python qa_manual_test.py

Pré-requisitos:
    - Backend rodando em localhost:8000
    - pip install httpx python-dateutil
"""

import httpx
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"
TIMEOUT = 10.0

# Test user credentials
TEST_TEACHER = {
    "email": "qa_teacher@test.local",
    "full_name": "QA Teacher",
    "password": "QAPassword123!"
}

# ============================================================================
# TEST UTILITIES
# ============================================================================

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.errors: List[str] = []
    
    def add_pass(self):
        self.passed += 1
    
    def add_fail(self, msg: str):
        self.failed += 1
        self.errors.append(msg)
    
    def add_skip(self):
        self.skipped += 1
    
    def report(self):
        print("\n" + "=" * 70)
        print("FINAL TEST REPORT")
        print("=" * 70)
        print(f"PASSED:  {self.passed}")
        print(f"FAILED:  {self.failed}")
        print(f"SKIPPED: {self.skipped}")
        
        if self.errors:
            print("\nERRORS:")
            for i, err in enumerate(self.errors, 1):
                print(f"  {i}. {err}")
        
        total = self.passed + self.failed + self.skipped
        rate = (self.passed / total * 100) if total > 0 else 0
        print(f"\nSUCCESS RATE: {rate:.1f}% ({self.passed}/{total})")
        print("=" * 70 + "\n")

results = TestResult()

def test(name: str, fn, *args, **kwargs) -> bool:
    """Execute a test and report result"""
    try:
        print(f"\n[TEST] {name}")
        result = fn(*args, **kwargs)
        print(f"[PASS] {name}")
        results.add_pass()
        return result
    except AssertionError as e:
        print(f"[FAIL] {name}: {e}")
        results.add_fail(f"{name}: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] {name}: {type(e).__name__}: {e}")
        results.add_fail(f"{name}: {type(e).__name__}: {e}")
        return None

# ============================================================================
# API HELPERS
# ============================================================================

def api_call(method: str, path: str, json_data=None, headers=None, expect_status=None):
    """Make API call and return response"""
    url = f"{API_V1}{path}"
    
    if method.upper() == "GET":
        r = httpx.get(url, headers=headers, timeout=TIMEOUT)
    elif method.upper() == "POST":
        r = httpx.post(url, json=json_data, headers=headers, timeout=TIMEOUT)
    elif method.upper() == "PUT":
        r = httpx.put(url, json=json_data, headers=headers, timeout=TIMEOUT)
    elif method.upper() == "DELETE":
        r = httpx.delete(url, headers=headers, timeout=TIMEOUT)
    else:
        raise ValueError(f"Unknown method: {method}")
    
    if expect_status and r.status_code != expect_status:
        raise AssertionError(
            f"Expected {expect_status}, got {r.status_code}. "
            f"Response: {r.text[:100]}"
        )
    
    return r

# ============================================================================
# TESTS: HEALTH & CONNECTIVITY
# ============================================================================

def test_health_check():
    """Test /health endpoint"""
    r = api_call("GET", "/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    return True

def test_root_endpoint():
    """Test root / endpoint"""
    r = httpx.get(BASE_URL, timeout=TIMEOUT)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    return True

# ============================================================================
# TESTS: AUTHENTICATION
# ============================================================================

def test_register_user() -> str:
    """Register user and return token"""
    r = api_call("POST", "/auth/register", json_data={
        "email": TEST_TEACHER["email"],
        "full_name": TEST_TEACHER["full_name"],
        "password": TEST_TEACHER["password"]
    })
    
    assert r.status_code in [201, 400], f"Unexpected status {r.status_code}"
    
    data = r.json()
    token = data.get("access_token")
    assert token, "No access_token in response"
    return token

def test_login_user() -> str:
    """Login user and return token"""
    r = api_call("POST", "/auth/login", json_data={
        "email": TEST_TEACHER["email"],
        "password": TEST_TEACHER["password"]
    })
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    
    data = r.json()
    token = data.get("access_token")
    assert token, "No access_token in response"
    return token

def test_get_current_user(token: str):
    """Get current user info"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("GET", "/auth/me", headers=headers)
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    user = r.json()
    assert user.get("email") == TEST_TEACHER["email"]
    return user

# ============================================================================
# TESTS: STUDENT MANAGEMENT
# ============================================================================

def test_create_location(token: str) -> str:
    """Create a location"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("POST", "/locations", json_data={
        "name": "Sala Centro QA",
        "address": "Rua Teste, 123",
        "city": "Rio de Janeiro"
    }, headers=headers)
    
    assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}"
    location_id = r.json().get("id")
    assert location_id, "No location ID in response"
    return location_id

def test_create_group(token: str, location_id: str) -> str:
    """Create a group"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("POST", "/groups", json_data={
        "name": "Turma Iniciantes QA",
        "description": "Turma para testes QA",
        "hourly_rate": 75.0,
        "max_students": 10,
        "location_id": location_id
    }, headers=headers)
    
    assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}"
    group_id = r.json().get("id")
    assert group_id, "No group ID in response"
    return group_id

def test_create_student(token: str) -> str:
    """Create a student"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("POST", "/students", json_data={
        "first_name": "Alice",
        "last_name": "QA Test",
        "email": "alice_qa@test.local",
        "phone": "21999991111",
        "guardian_name": "Guardian Alice",
        "guardian_phone": "21999992222"
    }, headers=headers)
    
    assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}"
    student_id = r.json().get("id")
    assert student_id, "No student ID in response"
    return student_id

def test_list_students(token: str) -> List[str]:
    """List all students"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("GET", "/students", headers=headers)
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    students = r.json()
    assert isinstance(students, list), "Expected list of students"
    return [s["id"] for s in students]

# ============================================================================
# TESTS: PAYMENT MANAGEMENT  
# ============================================================================

def test_create_payment(token: str, student_id: str) -> str:
    """Create a payment"""
    headers = {"Authorization": f"Bearer {token}"}
    due_date = (datetime.now() + timedelta(days=7)).date().isoformat()
    
    r = api_call("POST", "/payments", json_data={
        "student_id": student_id,
        "amount": 150.0,
        "due_date": due_date,
        "description": "Aula - Março/2026"
    }, headers=headers)
    
    assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}: {r.text}"
    payment_id = r.json().get("id")
    assert payment_id, "No payment ID in response"
    return payment_id

def test_list_payments(token: str) -> List[Dict]:
    """List all payments"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("GET", "/payments", headers=headers)
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    payments = r.json()
    assert isinstance(payments, (list, dict)), "Expected list/dict of payments"
    return payments

def test_dashboard_summary(token: str) -> Dict:
    """Get dashboard payment summary"""
    headers = {"Authorization": f"Bearer {token}"}
    r = api_call("GET", "/dashboard/payment-summary", headers=headers)
    
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    summary = r.json()
    assert "total_students" in summary, "Missing total_students"
    return summary

# ============================================================================
# MAIN TEST SUITE
# ============================================================================

def run_all_tests():
    """Run complete QA test suite"""
    print("=" * 70)
    print("TeacherFlow - Complete QA Test Suite")
    print("=" * 70)
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 70)
    
    # -------- Health checks
    print("\n[SECTION] Health & Connectivity")
    test("Health Check", test_health_check)
    test("Root Endpoint", test_root_endpoint)
    
    # -------- Authentication
    print("\n[SECTION] Authentication")
    token = test("Register User", test_register_user)
    if not token:
        # Try login if register failed
        token = test("Login User", test_login_user)
    
    if not token:
        print("\nAbort: Cannot get authentication token")
        results.report()
        return
    
    print(f"Token obtained: {token[:20]}...")
    user = test("Get Current User", test_get_current_user, token)
    
    # -------- Student Management
    print("\n[SECTION] Student Management")
    location = test("Create Location", test_create_location, token)
    group = test("Create Group", test_create_group, token, location) if location else None
    student = test("Create Student", test_create_student, token)
    students = test("List Students", test_list_students, token)
    
    # -------- Payment Management
    print("\n[SECTION] Payment Management")
    if student:
        payment = test("Create Payment", test_create_payment, token, student)
    payments = test("List Payments", test_list_payments, token)
    summary = test("Dashboard Summary", test_dashboard_summary, token)
    
    # -------- Report
    results.report()

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"\nFatal error: {e}")
