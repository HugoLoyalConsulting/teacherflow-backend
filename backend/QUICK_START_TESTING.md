# TeacherFlow - Quick Start Guide for End-to-End Testing

**Your complete guide to running TeacherFlow locally and testing all features**

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Terminal/Command Prompt
- Code Editor (VS Code recommended)

---

## 5-Minute Quick Start

### Step 1: Clone & Navigate to Backend

```bash
cd c:\Users\Hugo\ Souza\OneDrive\Documentos\Python\ Scripts\teacherflow-backend
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Create `.env` File

```bash
# Copy the example
cp .env.example .env

# Update these values in .env:
DEBUG=true
SECRET_KEY=your-test-secret-key-min-32-chars
DATABASE_URL=sqlite:///./teacherflow.db
```

### Step 5: Initialize Database

```bash
# Run migrations
alembic upgrade head

# Or if no migrations exist, create tables:
python << 'EOF'
from app.core.database import Base, engine
Base.metadata.create_all(bind=engine)
print("✓ Tables created")
EOF
```

### Step 6: Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
```

### Step 7: Open New Terminal & Start Frontend

```bash
cd c:\Users\Hugo\ Souza\OneDrive\Documentos\Python\ Scripts\TeacherFlow\ App\frontend

npm install  # First time only
npm run dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Step 8: Open Browser & Test

```
Frontend: http://localhost:5173/
Backend API: http://127.0.0.1:8000/
Swagger Docs: http://127.0.0.1:8000/docs (only in DEBUG=true)
```

---

## Manual Testing Workflows

### Workflow 1: User Registration & Login

**Step 1: Register New User**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "SecurePass123!",
    "name": "John Teacher"
  }'

# Expected Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIs...",
#   "token_type": "bearer",
#   "user": {
#     "id": "uuid-1234",
#     "email": "teacher@school.com",
#     "tenant_id": "school.com",
#     "is_admin": false
#   }
# }
```

**Step 2: Copy the access_token**
```bash
# Create variable with token
$TOKEN = "eyJhbGciOiJIUzI1NiIs..."  # (paste your token here)
```

**Step 3: Test Login Endpoint**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "SecurePass123!"
  }'

# Expected: Same JWT token as registration
```

**Step 4: Get Current User Info**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "id": "uuid-1234",
#   "email": "teacher@school.com",
#   "tenant_id": "school.com",
#   "is_admin": false,
#   "is_active": true
# }
```

---

### Workflow 2: Create & Manage Students

**Step 1: Create Student (Requires JWT)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Alice",
    "last_name": "Student",
    "email": "alice@example.com",
    "phone": "+5511999999999",
    "status": "active"
  }'

# Expected Response:
# {
#   "id": "student-uuid-1",
#   "tenant_id": "school.com",
#   "first_name": "Alice",
#   "email": "alice@example.com",
#   ...
# }

# Save the student ID for next steps
$STUDENT_ID = "student-uuid-1"
```

**Step 2: Get All Students**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $TOKEN"

# Expected: List of students for this tenant only
```

**Step 3: Get Specific Student**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: Single student details
```

**Step 4: Update Student**
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/students/$STUDENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Alice",
    "last_name": "Updated",
    "status": "active"
  }'
```

**Step 5: Delete Student**
```bash
curl -X DELETE http://127.0.0.1:8000/api/v1/students/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 204 No Content (success)
```

---

### Workflow 3: Multi-Tenant Isolation Test (CRITICAL)

**Step 1: Create User A (School 1)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school1.com",
    "password": "SchoolA123!",
    "name": "Teacher A"
  }'

# Copy token as $TOKEN_A
$TOKEN_A = "eyJhbGc..."
```

**Step 2: Create User B (School 2)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school2.com",
    "password": "SchoolB123!",
    "name": "Teacher B"
  }'

# Copy token as $TOKEN_B
$TOKEN_B = "eyJhbGc..."
```

**Step 3: User A Creates Student (Alice)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{
    "first_name": "Alice",
    "last_name": "SchoolA",
    "email": "alice@school1.com",
    "status": "active"
  }'

# Save student ID: $ALICE_ID
$ALICE_ID = "student-id-from-response"
```

**Step 4: User B Creates Student (Bob)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{
    "first_name": "Bob",
    "last_name": "SchoolB",
    "email": "bob@school2.com",
    "status": "active"
  }'

# Save student ID: $BOB_ID
```

**Step 5: ISOLATION TEST - User A Lists Students**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: Only Alice (1 student)
# Should NOT include Bob
# ✅ PASS if Alice only
```

**Step 6: ISOLATION TEST - User B Lists Students**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $TOKEN_B"

# Expected: Only Bob (1 student)
# Should NOT include Alice
# ✅ PASS if Bob only
```

**Step 7: CRITICAL SECURITY TEST - User A Tries to Access Bob**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/$BOB_ID \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 404 Not Found
# NOT: 200 with Bob's data
# ✅ PASS if 404 (User A cannot access Bob's data)
# ❌ FAIL if 200 (Security breach!)
```

**Step 8: ISOLATION TEST - User A Tries Forged Header Attack**
```bash
# Even if User A tries to forge x-tenant-id header, it should be ignored
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "x-tenant-id: school2.com"

# Expected: Still returns only Alice (User A's student)
# The x-tenant-id header is ignored; JWT determines tenant
# ✅ PASS if Alice only (header ignored)
```

---

### Workflow 4: Rate Limiting Test

**Step 1: Login and Get Token**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "SecurePass123!"
  }' | jq -r '.access_token' > token.txt

$TOKEN = Get-Content token.txt
```

**Step 2: Send Requests at Max Rate**
```bash
# PowerShell: Send 125 requests rapidly
for ($i = 1; $i -le 125; $i++) {
    $response = curl -s -o /dev/null -w "%{http_code}" `
        -H "Authorization: Bearer $TOKEN" `
        http://127.0.0.1:8000/api/v1/students
    
    if ($response -eq "429") {
        Write-Host "Request $i: ❌ 429 Rate Limited (EXPECTED)" -ForegroundColor Red
        break
    } else {
        Write-Host "Request $i: ✅ $response" -ForegroundColor Green
    }
}

# Expected: Requests 1-120 succeed (200/201)
# Request 121+ fail with 429 Too Many Requests
```

**Step 3: Verify Rate Limit Reset**
```bash
# Wait 60 seconds
Start-Sleep -Seconds 60

# Try request again - should succeed
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v1/students

# Expected: 200 OK (rate window reset)
```

---

### Workflow 5: JWT Security Test

**Step 1: Test Missing Token**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students

# Expected: 403 Forbidden
# {"detail": "Not authenticated"}
```

**Step 2: Test Invalid Token**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer invalid-token-xyz"

# Expected: 403 Forbidden
# {"detail": "Invalid token"}
```

**Step 3: Test Expired Token (Simulated)**
```bash
# Create token with expiration in past
python << 'EOF'
from datetime import datetime, timedelta
from app.services.auth_service import create_access_token

# Create token that expired 1 hour ago
expired_token = create_access_token(
    data={"sub": "test-user", "tenant_id": "test.com"},
    expires_delta=timedelta(hours=-1)
)
print(expired_token)
EOF

# Use that token:
curl -X GET http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $EXPIRED_TOKEN"

# Expected: 403 Forbidden
# {"detail": "Token expired"}
```

---

### Workflow 6: Plan Limits Test

**Step 1: Create Free Plan Tenant**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@freeschool.com",
    "password": "FreeSchool123!",
    "name": "Free Teacher"
  }' | jq -r '.access_token' > token_free.txt

$TOKEN_FREE = Get-Content token_free.txt
```

**Step 2: Create 12 Students (FREE Plan Limit)**
```bash
# Create students 1-12
for ($i = 1; $i -le 12; $i++) {
    curl -X POST http://127.0.0.1:8000/api/v1/students \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN_FREE" \
        -d "{
            \"first_name\": \"Student\",
            \"last_name\": \"$i\",
            \"email\": \"student$i@freeschool.com\",
            \"status\": \"active\"
        }" > /dev/null
    echo "Student $i created ✅"
}
```

**Step 3: Try to Create 13th Student (Should Fail)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_FREE" \
  -d '{
    "first_name": "Student",
    "last_name": "13",
    "email": "student13@freeschool.com",
    "status": "active"
  }'

# Expected: 400 Bad Request
# {"detail": "Plan limit reached: max 12 students for FREE plan"}
# ✅ PASS if limit enforced
```

---

## Automated Testing

### Run Full Test Suite

```bash
# From backend directory
cd backend

# Install pytest (if not already)
pip install pytest

# Run all tests
pytest tests -v

# Expected:
# ============================= 23 passed in 2.84s =============================
```

### Run Specific Test Category

```bash
# Test only authentication
pytest tests/test_auth.py -v

# Test only students/isolation
pytest tests/test_students.py -v

# Test only rate limiting
pytest tests -k "rate_limit" -v
```

### Run with Coverage Report

```bash
# Install coverage
pip install pytest-cov

# Run with coverage
pytest tests --cov=app --cov-report=html

# Open report
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
xdg-open htmlcov/index.html  # Linux
```

---

## Frontend Testing

### Test Login Flow in Browser

1. Open http://localhost:5173/ in browser
2. Click "Login"
3. Enter your test credentials:
   - Email: `teacher@school.com`
   - Password: `SecurePass123!`
4. Click "Login" button
5. Expected:
   - ✅ Redirected to dashboard
   - ✅ "Students" page loads
   - ✅ Students list displays (if any exist)
   - ✅ Can create new student

### Test Error Handling

1. Try login with wrong password
   - Expected: Error message displayed
2. Try login with invalid email format
   - Expected: Email validation error
3. Try to access `/api/v1/students` without logging in
   - Expected: Redirected to login page

---

## Troubleshooting

### Backend Won't Start

**Error:** `Address already in use`
```bash
# Solution: Port 8000 is in use
# Option 1: Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Option 2: Use different port
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

**Error:** `Secret key not found`
```bash
# Solution: SECRET_KEY not in .env
# Create .env with:
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
```

### Database Connection Error

**Error:** `sqlite:///./teacherflow.db` doesn't exist
```bash
# Solution: Create database
python << 'EOF'
from app.core.database import Base, engine
Base.metadata.create_all(bind=engine)
EOF
```

### JWT Token Invalid

**Error:** `Invalid token` on API call
```bash
# Possible causes:
# 1. Token expired (30 min default)
#    Solution: Get new token via login
# 2. SECRET_KEY in .env differs from deployment
#    Solution: Use same SECRET_KEY everywhere
# 3. Token malformed
#    Solution: Copy entire token carefully
```

### Frontend Can't Connect to Backend

**Error:** `CORS error: Cross-Origin Request Blocked`
```bash
# Solution: Update CORS_ORIGINS in .env
# Should include frontend URL:
CORS_ORIGINS=["http://localhost:5173"]

# Then restart backend
```

---

## Quick Reference: Important URLs & Commands

| Component | URL/Command | Port |
|-----------|------------|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://127.0.0.1:8000 | 8000 |
| Swagger Docs | http://127.0.0.1:8000/docs | 8000 |
| Health Check | http://127.0.0.1:8000/health | 8000 |
| Register | POST /api/v1/auth/register | API |
| Login | POST /api/v1/auth/login | API |
| Students | GET /api/v1/students | API |

---

## Success Criteria - All Tests Passing ✅

- [ ] Backend starts without errors
- [ ] Frontend shows login page
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create student
- [ ] Can view student list
- [ ] Multi-tenant isolation verified (User A can't see User B's students)
- [ ] Rate limiting works (429 after 120 requests/60s)
- [ ] JWT security enforced (missing/invalid tokens rejected)
- [ ] Plan limits work (FREE limited to 12 students)
- [ ] All 23 backend tests passing
- [ ] No errors in browser console

---

## Next Steps

Once all tests pass locally:

1. **Deploy Backend** → Render.com / Railway.app / AWS
2. **Deploy Frontend** → Vercel / Netlify
3. **Run Integration Tests** → Test production endpoints
4. **Monitor Errors** → Set up Sentry/error tracking
5. **Go Live** → 🎉

---

**Need Help?**

- Backend Issues: Check `DEBUG=true` in .env and look at server logs
- Frontend Issues: Check browser console (F12 → Console tab)
- Database Issues: Verify `DATABASE_URL` in .env and check PostgreSQL/SQLite is running
- Network Issues: Verify CORS_ORIGINS includes your frontend URL
- Security Issues: Check JWT token expiry (30 min default)

---

**Happy Testing! 🚀**

Your teacherFlow SaaS is ready for the world.
