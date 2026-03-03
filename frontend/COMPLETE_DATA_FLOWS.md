# 🔄 TeacherFlow Authentication - Complete Data Flow

## Visual Architecture

```
FRONTEND (Vercel)                    BACKEND (Render/Local)          DATABASE (Neon PostgreSQL)
═════════════════════════            ══════════════════════          ══════════════════════════

┌──────────────────────────┐
│  React App (Vite)        │
│  ├─ LoginPage.tsx        │
│  ├─ RegisterPage.tsx     │
│  ├─ VerifyEmailPage.tsx  │
│  ├─ authService.ts       │          ┌──────────────────────┐
│  └─ authStore.ts ◄──────┼─────────►│  FastAPI             │
│                          │          │  /api/auth/register  │
│                          │          │  /api/auth/login     │
└──────────────────────────┘          │  /api/auth/refresh   │
         ▲                            │  /api/auth/verify    │
         │                            └──────────────────────┘
         │ Token Storage                      ▲
         │ ┌──────────────┐                   │
         └─┤ localStorage ├───────────────────┘
           │ sessionStorage                ┌──────────────┐
           └──────────────┘                │ Database     │
                                           │ ├─ Users     │
                                           │ ├─ AuditLog  │
                                           │ └─ Sessions  │
                                           └──────────────┘
```

---

## 1️⃣ Registration Flow

```
USER INTERACTION
═════════════════════════════════════════════════════════════════════════════════

Step 1: User navigates to /register
  │
  └─ RegisterPage.tsx loads
     ├─ Empty form fields
     ├─ Password strength validator ready
     └─ User sees requirements checklist

Step 2: User fills form
  │
  ├─ Email: user@example.com
  ├─ Full Name: John Doe
  ├─ Password: SecurePass123!@
  │     └─ Real-time validation shows:
  │        ✅ Min 12 characters
  │        ✅ Uppercase letter
  │        ✅ Lowercase letter
  │        ✅ Number
  │        ✅ Special character
  │
  └─ "Create Account" button enabled

Step 3: User clicks "Create Account"
  │
  ├─ Frontend validates all fields
  ├─ Frontend validates password strength
  ├─ authenticatedFetch() called with:
  │    {
  │      "email": "user@example.com",
  │      "full_name": "John Doe",
  │      "password": "SecurePass123!@"
  │    }
  │
  └─ HTTP POST /api/auth/register

BACKEND PROCESSING
═════════════════════════════════════════════════════════════════════════════════

Step 4: Backend receives request
  │
  ├─ Validates JSON schema
  ├─ Validates email format
  ├─ Validates password strength (same rules)
  ├─ Checks email not already registered
  │    └─ If exists: return 400 "Email already registered"
  │
  └─ Continues...

Step 5: Backend hashes password
  │
  ├─ Uses Bcrypt algorithm
  ├─ Cost factor: 12
  ├─ Result: $2b$12$...irreversible...
  │
  └─ Continues...

Step 6: Backend creates user
  │
  ├─ INSERT into users table:
  │    {
  │      "id": "uuid",
  │      "email": "user@example.com",
  │      "full_name": "John Doe",
  │      "hashed_password": "$2b$12$...",
  │      "email_verified": false,
  │      "is_active": false,
  │      "created_at": now(),
  │      "created_ip": "client_ip"
  │    }
  │
  └─ Continues...

Step 7: Backend generates OTP
  │
  ├─ Random 6-digit code: 123456
  ├─ Hash OTP code
  ├─ INSERT into email_verification table:
  │    {
  │      "email": "user@example.com",
  │      "otp_hash": "$2b$12$...",
  │      "attempts": 0,
  │      "created_at": now(),
  │      "expires_at": now() + 15 minutes
  │    }
  │
  └─ Continues...

Step 8: Backend sends email
  │
  ├─ Email provider: SMTP
  ├─ Subject: "Verify your TeacherFlow email"
  ├─ Body: "Your verification code: 123456"
  ├─ If SMTP not configured:
  │    └─ Log to console: "[Auth] OTP: 123456"
  │
  └─ Continues...

Step 9: Backend returns response
  │
  ├─ HTTP 201 Created
  ├─ Response:
  │    {
  │      "message": "User created. Please verify email.",
  │      "detail": "Check your inbox for OTP code."
  │    }
  │
  └─ Success!

FRONTEND RESPONSE
═════════════════════════════════════════════════════════════════════════════════

Step 10: Frontend receives response
  │
  ├─ Shows success screen
  ├─ Message: "Conta criada com sucesso!"
  ├─ Email: user@example.com
  │
  └─ Continues...

Step 11: Frontend redirects
  │
  ├─ Wait 2 seconds
  ├─ Navigate to /verify-email?email=user@example.com
  │
  └─ VerifyEmailPage.tsx loads

Result: User now needs to verify email
```

---

## 2️⃣ Email Verification Flow

```
USER INTERACTION
═════════════════════════════════════════════════════════════════════════════════

Step 1: User receives email with OTP
  │
  ├─ Email subject: "Verify your TeacherFlow email"
  ├─ Email body: "Your verification code: 123456"
  ├─ Code valid for: 15 minutes
  │
  └─ User at VerifyEmailPage.tsx

Step 2: User enters OTP
  │
  ├─ Input field appears
  ├─ Numeric keyboard on mobile
  ├─ 6-digit input only
  ├─ Countdown timer starts: 15:00
  │
  └─ User types "123456"

Step 3: User clicks "Verify Code"
  │
  ├─ Frontend validates:
  │    ├─ OTP is exactly 6 digits: ✅
  │    ├─ Value not empty: ✅
  │    └─ Time not expired: ✅
  │
  ├─ POST /api/auth/verify-email with:
  │    {
  │      "email": "user@example.com",
  │      "otp_code": "123456"
  │    }
  │
  └─ HTTP POST request sent

BACKEND PROCESSING
═════════════════════════════════════════════════════════════════════════════════

Step 4: Backend receives OTP
  │
  ├─ Validates email exists
  ├─ Finds email_verification record
  │
  └─ Continues...

Step 5: Backend validates OTP
  │
  ├─ Check if expired:
  │    └─ If yes: return 400 "Code expired"
  │
  ├─ Check if max attempts (3) exceeded:
  │    └─ If yes: return 400 "Too many attempts"
  │
  ├─ Compare OTP code:
  │    ├─ Hash submitted code
  │    ├─ Compare with stored hash using timing-resistant comparison
  │    └─ If no match: 
  │        ├─ Increment attempts counter
  │        └─ Return 400 "Invalid code"
  │
  └─ Code is correct, continue...

Step 6: Backend updates user
  │
  ├─ UPDATE users SET:
  │    │
  │    ├─ "email_verified": true
  │    ├─ "is_active": true
  │    ├─ "verified_at": now()
  │    │
  │    └─ WHERE email = "user@example.com"
  │
  └─ Continues...

Step 7: Backend deletes OTP
  │
  ├─ DELETE from email_verification
  │    WHERE email = "user@example.com"
  │
  ├─ Log audit event:
  │    {
  │      "user_id": "uuid",
  │      "action": "email_verified",
  │      "status": "success",
  │      "ip_address": "client_ip",
  │      "user_agent": "Mozilla/5.0...",
  │      "timestamp": now()
  │    }
  │
  └─ Continues...

Step 8: Backend returns response
  │
  ├─ HTTP 200 OK
  ├─ Response:
  │    {
  │      "message": "Email verified successfully",
  │      "detail": "Account is now active"
  │    }
  │
  └─ Success!

FRONTEND RESPONSE
═════════════════════════════════════════════════════════════════════════════════

Step 9: Frontend receives success
  │
  ├─ Shows success screen
  ├─ Message: "Email verificado!"
  │
  └─ Continues...

Step 10: Frontend redirects
  │
  ├─ Wait 2 seconds
  ├─ Navigate to /login
  │
  └─ LoginPage.tsx loads

Result: User can now login
```

---

## 3️⃣ Login Flow

```
USER INTERACTION
═════════════════════════════════════════════════════════════════════════════════

Step 1: User at LoginPage.tsx
  │
  ├─ Enters email: user@example.com
  ├─ Enters password: SecurePass123!@
  │
  └─ Clicks "Login"

Step 2: Frontend validates
  │
  ├─ Email not empty: ✅
  ├─ Password not empty: ✅
  ├─ Email format valid: ✅
  │
  ├─ POST /api/auth/login with:
  │    {
  │      "email": "user@example.com",
  │      "password": "SecurePass123!@"
  │    }
  │
  └─ HTTP POST request sent

BACKEND PROCESSING
═════════════════════════════════════════════════════════════════════════════════

Step 3: Backend receives credentials
  │
  ├─ Rate limiter checks:
  │    ├─ Get login attempts for this email (last 15 min)
  │    ├─ Current attempts: 0
  │    ├─ Max allowed: 5
  │    └─ Continue...
  │
  └─ Continues...

Step 4: Backend validates user
  │
  ├─ Query database:
  │    SELECT * FROM users WHERE email = "user@example.com"
  │
  ├─ User found: ✅
  ├─ User is_active: ✅
  ├─ User email_verified: ✅
  │
  └─ Continues...

Step 5: Backend validates password
  │
  ├─ Compare submitted password with hash:
  │    ├─ bcrypt.verify("SecurePass123!@", "$2b$12$...")
  │    └─ Result: MATCH ✅
  │
  └─ Continues...

Step 6: Backend generates tokens
  │
  ├─ Create access token (JWT):
  │    {
  │      "sub": "user@example.com",
  │      "user_id": "uuid",
  │      "iat": now(),
  │      "exp": now() + 30 minutes,
  │      "algorithm": "HS256"
  │    }
  │    = "eyJhbGc..."
  │
  ├─ Create refresh token (JWT):
  │    {
  │      "sub": "user@example.com",
  │      "type": "refresh",
  │      "iat": now(),
  │      "exp": now() + 7 days,
  │      "algorithm": "HS256"
  │    }
  │    = "eyJhbGc..."
  │
  └─ Continues...

Step 7: Backend logs audit event
  │
  ├─ INSERT into audit_log:
  │    {
  │      "user_id": "uuid",
  │      "action": "login",
  │      "status": "success",
  │      "ip_address": "client_ip",
  │      "user_agent": "Mozilla/5.0...",
  │      "timestamp": now()
  │    }
  │
  ├─ UPDATE users:
  │    {
  │      "last_login_at": now(),
  │      "last_login_ip": "client_ip",
  │      "failed_login_attempts": 0
  │    }
  │
  └─ Continues...

Step 8: Backend returns tokens
  │
  ├─ HTTP 200 OK
  ├─ Response:
  │    {
  │      "access_token": "eyJhbGc...",
  │      "refresh_token": "eyJhbGc...",
  │      "expires_in": 1800,
  │      "user": {
  │        "id": "uuid",
  │        "email": "user@example.com",
  │        "full_name": "John Doe",
  │        "is_admin": false
  │      }
  │    }
  │
  └─ Success!

FRONTEND TOKEN MANAGEMENT
═════════════════════════════════════════════════════════════════════════════════

Step 9: Frontend receives tokens
  │
  ├─ Access token stored in localStorage:
  │    localStorage.setItem("access_token", "eyJhbGc...")
  │
  ├─ Refresh token stored in sessionStorage:
  │    sessionStorage.setItem("refresh_token", "eyJhbGc...")
  │
  ├─ User info stored in localStorage:
  │    localStorage.setItem("user", JSON.stringify({...}))
  │
  ├─ Expiry time stored:
  │    localStorage.setItem("token_expiry", timestamp)
  │
  └─ Continues...

Step 10: Frontend updates state
  │
  ├─ useAuthStore().setUser({
  │    id: "uuid",
  │    email: "user@example.com",
  │    full_name: "John Doe"
  │  })
  │
  └─ Continues...

Step 11: Frontend redirects
  │
  ├─ Navigate to /
  │
  └─ DashboardPage.tsx loads

Result: User logged in successfully ✅
```

---

## 4️⃣ Auto-Refresh Flow

```
SCENARIO: User's token is about to expire
═════════════════════════════════════════════════════════════════════════════════

Step 1: User makes API call
  │
  ├─ Click something on dashboard
  ├─ Or component calls API
  ├─ Example: GET /api/classrooms
  │
  └─ Continues...

Step 2: authenticatedFetch() intercepts
  │
  ├─ Check if token expired:
  │    ├─ Get token_expiry from localStorage
  │    ├─ Compare with Date.now()
  │    ├─ If expired: run refresh immediately
  │    └─ If valid: continue
  │
  ├─ Build request:
  │    {
  │      url: "/api/classrooms",
  │      headers: {
  │        "Authorization": "Bearer eyJhbGc...",
  │        "Content-Type": "application/json"
  │      }
  │    }
  │
  └─ Continues...

Step 3: Backend receives request
  │
  ├─ Check Authorization header
  ├─ Extract token: "eyJhbGc..."
  ├─ Validate JWT signature
  ├─ Check expiration time
  │
  ├─ Token valid: ✅
  │    └─ Process request normally
  │
  └─ Returns data

But if token IS expired:

Step 3b: Backend rejects with 401
  │
  ├─ HTTP 401 Unauthorized
  ├─ Response:
  │    {
  │      "detail": "Token expired"
  │    }
  │
  └─ Client receives 401...

FRONTEND HANDLES 401
═════════════════════════════════════════════════════════════════════════════════

Step 4: Frontend detects 401
  │
  ├─ Response status: 401
  ├─ Check if already attempted refresh:
  │    └─ No, first time
  │
  └─ Trigger refresh...

Step 5: Frontend sends refresh request
  │
  ├─ Get refresh_token from sessionStorage
  ├─ POST /api/auth/refresh with:
  │    {
  │      "refresh_token": "eyJhbGc..."
  │    }
  │
  └─ HTTP POST request sent

BACKEND PROCESSES REFRESH
═════════════════════════════════════════════════════════════════════════════════

Step 6: Backend validates refresh token
  │
  ├─ Extract token from request
  ├─ Validate JWT signature
  ├─ Check expiration (7 days):
  │    ├─ If expired: return 401 (user must login again)
  │    └─ If valid: continue
  │
  ├─ Validate token type is "refresh"
  │
  └─ Generate new access token

Step 7: Backend returns new token
  │
  ├─ HTTP 200 OK
  ├─ Response:
  │    {
  │      "access_token": "eyJhbGc...[NEW]",
  │      "expires_in": 1800
  │    }
  │
  └─ Success!

FRONTEND UPDATES TOKEN & RETRIES
═════════════════════════════════════════════════════════════════════════════════

Step 8: Frontend receives new token
  │
  ├─ Update localStorage:
  │    localStorage.setItem("access_token", "eyJhbGc...[NEW]")
  │
  ├─ Update token expiry:
  │    localStorage.setItem("token_expiry", newExpiry)
  │
  └─ Continues...

Step 9: Frontend retries original request
  │
  ├─ Re-run the GET /api/classrooms request
  ├─ Add new Authorization header with fresh token
  │
  └─ Backend processes normally

Step 10: User sees data
  │
  ├─ No interruption
  ├─ No redirect to login
  ├─ Everything works seamlessly
  │
  └─ Success! ✅

Result: Token refresh is TRANSPARENT to user
```

---

## 5️⃣ Logout Flow

```
USER INTERACTION
═════════════════════════════════════════════════════════════════════════════════

Step 1: User clicks logout
  │
  ├─ Button on navbar or menu
  │
  └─ onClick handler calls authService.logout()

FRONTEND CLEANUP
═════════════════════════════════════════════════════════════════════════════════

Step 2: Frontend clears tokens
  │
  ├─ localStorage.removeItem("access_token")
  ├─ localStorage.removeItem("refresh_token")
  ├─ localStorage.removeItem("user")
  ├─ localStorage.removeItem("token_expiry")
  │
  ├─ sessionStorage.removeItem("refresh_token")
  │
  └─ Continues...

Step 3: Frontend updates state
  │
  ├─ useAuthStore().setUser(null)
  ├─ useAuthStore().setIsAuthenticated(false)
  │
  └─ Continues...

Step 4: Frontend redirects
  │
  ├─ Navigate to /login
  │
  └─ LoginPage.tsx loads

BACKEND LOGGING (Optional)
═════════════════════════════════════════════════════════════════════════════════

Step 5: Backend logout endpoint (optional)
  │
  ├─ POST /api/auth/logout
  │
  ├─ Backend logs audit event:
  │    {
  │      "user_id": "uuid",
  │      "action": "logout",
  │      "status": "success",
  │      "timestamp": now()
  │    }
  │
  └─ Mark token as revoked (optional)

Result: User logged out completely ✅
```

---

## 🗄️ Database State Changes

### User Registration
```
BEFORE:
[Empty]

AFTER:
users table:
├─ id: 550e8400-e29b-41d4-a716-446655440000
├─ email: user@example.com
├─ full_name: John Doe
├─ hashed_password: $2b$12$...
├─ email_verified: false
├─ is_active: false
├─ created_at: 2024-01-15 10:00:00
├─ created_ip: 192.168.1.1

email_verification table:
├─ email: user@example.com
├─ otp_hash: $2b$12$...
├─ attempts: 0
├─ created_at: 2024-01-15 10:00:00
├─ expires_at: 2024-01-15 10:15:00
```

### After Email Verification
```
users table:
├─ ... (same as above)
├─ email_verified: true ← CHANGED
├─ is_active: true ← CHANGED
├─ verified_at: 2024-01-15 10:05:00 ← NEW

email_verification table:
├─ [DELETED] ← Completely removed
```

### After Login
```
audit_log table:
├─ user_id: 550e8400-...
├─ action: login
├─ status: success
├─ ip_address: 192.168.1.1
├─ user_agent: Mozilla/5.0...
├─ timestamp: 2024-01-15 10:07:00
├─ details: {} ← JSON for extra info

users table:
├─ ... (same)
├─ last_login_at: 2024-01-15 10:07:00 ← UPDATED
├─ last_login_ip: 192.168.1.1 ← UPDATED
├─ failed_login_attempts: 0 ← RESET
```

---

## 📊 State Transitions Diagram

```
User States:
═════════════════════════════════════════════════════════════════════════════════

[Non-existent] 
      │
      │ POST /api/auth/register
      ▼
[Email not verified, Account Inactive]
      │
      │ POST /api/auth/verify-email
      ▼
[Email VERIFIED, Account ACTIVE] ◄─── Can now login
      │
      │ Multiple login/logout cycles:
      │
      ├─ POST /api/auth/login ──────► [LOGGED IN]
      │                                    │
      │                                    │ POST /api/auth/logout
      │                                    ▼
      │ ◄─────────────────────────── [LOGGED OUT]
      │
      └─ POST /api/auth/change-password ──► [Password updated]


Token States:
═════════════════════════════════════════════════════════════════════════════════

[No tokens]
    │
    │ Login successful
    ▼
[Access token: VALID (30 min), Refresh token: VALID (7 days)]
    │
    ├─ Access token expires ──► [Access token: EXPIRED, Refresh token: VALID]
    │                                 │
    │                                 │ Call /api/auth/refresh
    │                                 ▼
    │ ◄──────────────────── [Access token: VALID, Refresh token: VALID]
    │
    └─ Refresh token expires ──► [Both tokens: EXPIRED]
                                       │
                                       │ User must login again
                                       ▼
                                   [No tokens]
```

---

## 🔑 Key Take-Aways

### Security
- Passwords never stored in plain text (Bcrypt hashing)
- Tokens unsigned/verified using HMAC-SHA256
- OTP validated with timing-resistant comparison
- All authentication events logged for compliance

### Efficiency
- Auto-refresh prevents user interruption
- Single API call to refresh both access and refresh tokens
- Tokens cached locally (no API call needed for every request)
- Rate limiting prevents brute force attacks

### User Experience
- Clear error messages
- Real-time validation feedback
- Transparent token management
- Countdown timers for OTP expiry

### Scalability
- Stateless JWT tokens (no session storage needed)
- Database maintains audit trail
- Rate limiting prevents overload
- Email verification ensures real users

---

**All flows are designed for security, performance, and user experience.**
