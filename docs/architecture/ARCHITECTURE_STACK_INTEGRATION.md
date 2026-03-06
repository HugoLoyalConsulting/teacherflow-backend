# TeacherFlow - Architecture & Stack Integration Guide

**Last Updated:** March 6, 2026

## 📋 Table of Contents

1. [Stack Overview](#stack-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Integration Status](#integration-status)
4. [Development Workflow](#development-workflow)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Data Flow](#data-flow)
7. [Security & Multi-tenancy](#security--multi-tenancy)
8. [Observability](#observability)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Stack Overview

### Development Tools
- **IDE:** VSCode with GitHub Copilot
- **Version Control:** GitHub
- **Package Managers:** npm (frontend), pip (backend)

### Production Infrastructure

| Component | Service | Tier | URL |
|-----------|---------|------|-----|
| Frontend | Vercel | Hobby (Free) | https://teacherflow-app.vercel.app |
| Backend API | Render | Free | https://teacherflow-backend.onrender.com |
| Database | Neon PostgreSQL | Free | See connection strings below |
| Telemetry | PostHog | Free (1M events/month) | https://app.posthog.com |
| Error Monitoring | Sentry | Free (5K events/month) | https://sentry.io |
| Analytics Dashboard | Metabase | Self-hosted | TBD |

---

## 🗄️ Database Connections (Neon)

**Three database instances available:**

```bash
# Primary Database (Production)
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Development Database
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-royal-lab-ac3axf9o-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Testing/Staging Database
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-mute-glade-actrhygq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Console:** https://console.neon.tech/app/projects/rapid-forest-55425359

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VSCode + Copilot                                               │
│         │                                                        │
│         ▼                                                        │
│    Git Commit                                                   │
│         │                                                        │
│         ▼                                                        │
│     GitHub                                                      │
│    (Repository)                                                 │
│         │                                                        │
│         ├─────────────────┬───────────────────┐                │
│         │                 │                   │                 │
│         ▼                 ▼                   ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  CI/CD       │  │  CI/CD       │  │   Code       │        │
│  │  (Frontend)  │  │  (Backend)   │  │   Analysis   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                 │                                     │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │                 │
          │                 │
┌─────────┼─────────────────┼─────────────────────────────────────┐
│         │    PRODUCTION   │                                      │
├─────────┼─────────────────┼─────────────────────────────────────┤
│         ▼                 ▼                                      │
│   ┌──────────┐      ┌──────────┐                               │
│   │  Vercel  │◄────►│  Render  │                               │
│   │ (React)  │ HTTP │ (FastAPI)│                               │
│   └──────────┘      └──────────┘                               │
│         │                 │                                      │
│         │                 ├────────────► Neon (PostgreSQL)     │
│         │                 │                                      │
│         │                 ├────────────► PostHog (Telemetry)   │
│         │                 │                                      │
│         │                 └────────────► Sentry (Errors)       │
│         │                                                        │
│         └──────────────────────────────► PostHog (Frontend     │
│                                            Events)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

                              │
                              ▼
                    ┌──────────────────┐
                    │    Metabase      │
                    │   (Dashboards)   │
                    └──────────────────┘
                              ▲
                              │
                    Connects to Neon DB
```

---

## ✅ Integration Status

### Fully Integrated ✅
- [x] GitHub → Vercel auto-deploy
- [x] GitHub → Render auto-deploy
- [x] Frontend → Backend API (CORS configured)
- [x] Backend → Neon PostgreSQL
- [x] JWT Authentication
- [x] Google OAuth
- [x] Database migrations (Alembic)

### Partially Integrated ⚠️
- [⚠] Multi-tenant isolation (uses teacher_id, needs organization_id)
- [⚠] Soft delete (prepared but not implemented on all models)

### To Be Integrated 🔜
- [ ] PostHog telemetry integration
- [ ] Sentry error monitoring integration
- [ ] Metabase dashboard setup
- [ ] Rate limiting (endpoint protection)
- [ ] Product events tracking

---

## 🔄 Development Workflow

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/teacherflow.git
cd teacherflow

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload

# 3. Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with VITE_API_URL
npm run dev
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... code ...

# 3. Test locally
npm run build  # frontend
pytest         # backend

# 4. Commit and push
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
# 6. After approval, merge to main
# 7. Auto-deploy triggers to Vercel & Render
```

---

## 🚀 Deployment Pipeline

### Automatic Deployment

**Trigger:** Push to `main` branch

```mermaid
graph LR
    A[Push to main] --> B{Changed files?}
    B -->|frontend/**| C[Deploy to Vercel]
    B -->|backend/**| D[Deploy to Render]
    B -->|both| E[Deploy Both]
    C --> F[Live in ~2 min]
    D --> G[Live in ~5 min]
    E --> F
    E --> G
```

### Manual Deployment

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Render):**
- Go to https://dashboard.render.com
- Find `teacherflow-backend`
- Click "Manual Deploy" → "Deploy latest commit"

### Environment Variables

**Vercel (Frontend):**
```env
VITE_API_URL=https://teacherflow-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_POSTHOG_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Render (Backend):**
```env
DATABASE_URL=<neon-connection-string>
SECRET_KEY=<secure-random-key-min-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=false
API_V1_STR=/api/v1
ENVIRONMENT=production
CORS_ORIGINS=["https://teacherflow-app.vercel.app"]
SENTRY_DSN=<sentry-dsn>
POSTHOG_API_KEY=<posthog-project-key>
```

---

## 📊 Data Flow

### User Registration & Authentication

```
1. User submits credentials (Frontend)
   ↓
2. POST /api/v1/auth/signup (Backend)
   ↓
3. Hash password, create user in Neon DB
   ↓
4. Generate JWT token
   ↓
5. Return token to Frontend
   ↓
6. Store token in localStorage
   ↓
7. Log event to PostHog: user_signed_up
   ↓
8. Redirect to Dashboard
```

### Multi-tenant Data Isolation

**Every API request:**
```python
# 1. Extract JWT token from Authorization header
# 2. Decode token to get user_id
# 3. Query user to get organization_id
# 4. Filter all queries by organization_id

# Example:
def get_students(db: Session, user: User):
    return db.query(Student).filter(
        Student.organization_id == user.organization_id
    ).all()
```

**Database schema:**
```sql
-- Every table must have organization_id
CREATE TABLE students (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR NOT NULL,
    -- ... other fields
    deleted_at TIMESTAMP,  -- soft delete
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_students_org ON students(organization_id);
```

---

## 🔒 Security & Multi-tenancy

### Authentication Layers

1. **Password Security**
   - Bcrypt hashing (12 rounds)
   - Minimum password strength requirements
   - Rate limiting on login attempts (5 attempts = 15min lockout)

2. **JWT Tokens**
   - Access token: 30 minutes
   - Refresh token: 7 days
   - Secure, httpOnly cookies (production)

3. **Google OAuth**
   - OAuth 2.0 flow
   - Verified email required
   - Auto-create account

### Multi-tenant Isolation

**Organization Model:**
```python
class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Settings
    subscription_tier = Column(String, default="free")
    max_students = Column(Integer, default=100)
    
    # Soft delete
    deleted_at = Column(DateTime, nullable=True)
```

**Data Isolation Rules:**
1. Every model has `organization_id` foreign key
2. All queries MUST filter by `organization_id`
3. API endpoints verify user belongs to organization
4. No cross-organization data access

### Soft Delete Protection

```python
# Instead of:
db.delete(student)

# Use:
student.deleted_at = datetime.utcnow()
db.commit()

# Queries automatically filter out deleted records:
def get_active_students(db, org_id):
    return db.query(Student).filter(
        Student.organization_id == org_id,
        Student.deleted_at.is_(None)
    ).all()
```

---

## 📈 Observability

### PostHog (Product Analytics)

**Events to track:**
```javascript
// Frontend
posthog.capture('user_signed_up', {
  organization_id: user.organization_id,
  method: 'email', // or 'google'
});

posthog.capture('student_created', {
  organization_id: user.organization_id,
  student_id: student.id,
});
```

**Backend events:**
```python
from app.core.telemetry import track_event

track_event(
    event_name="payment_created",
    user_id=current_user.id,
    organization_id=current_user.organization_id,
    properties={
        "amount": payment.amount,
        "status": payment.status,
    }
)
```

### Sentry (Error Monitoring)

**Frontend:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

// Errors are automatically captured
// Manual capture:
Sentry.captureException(error);
```

**Backend:**
```python
import sentry_sdk

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=1.0,
)

# Errors are automatically captured
# Manual capture:
sentry_sdk.capture_exception(exception)
```

### Metabase (Business Intelligence)

**Connection Setup:**
1. Install Metabase (Docker/Cloud)
2. Add PostgreSQL connection
3. Use read-only Neon connection string
4. Create dashboards

**Key Dashboards:**
- Daily Active Users
- New Signups
- Revenue (MRR)
- Student Enrollment
- Payment Success Rate
- Churn Rate

---

## 🛠️ Troubleshooting

### Common Issues

**1. CORS Errors**
```
Symptom: "Access-Control-Allow-Origin" error
Fix: Add frontend URL to backend CORS_ORIGINS
Location: backend/.env or Render dashboard
```

**2. Database Connection Failed**
```
Symptom: "could not connect to server"
Fix: Check DATABASE_URL format, ensure SSL parameters
Verify: Neon database is active (not paused)
```

**3. JWT Token Expired**
```
Symptom: 401 Unauthorized on API calls
Fix: Frontend should refresh token or re-login
Check: Token expiration times in backend config
```

**4. Build Failures**
```
Frontend: Check npm install logs, verify Node version (18+)
Backend: Check pip install logs, verify Python version (3.11+)
```

### Health Check Endpoints

```bash
# Frontend (Vercel)
curl https://teacherflow-app.vercel.app

# Backend (Render)
curl https://teacherflow-backend.onrender.com/health

# Database (Neon)
psql <connection_string> -c "SELECT 1;"
```

### Logs Access

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Runtime logs: Click project → Deployment → "Runtime Logs"

**Render:**
- Dashboard: https://dashboard.render.com
- Logs: Click service → "Logs" tab (realtime)

**Neon:**
- Console: https://console.neon.tech
- Query logs available in UI

---

## 📚 Additional Resources

- [Backend API Documentation](../../backend/README.md)
- [Frontend Setup Guide](../../frontend/README.md)
- [Database Schema](../../backend/docs/DATABASE_SCHEMA.md)
- [Security Best Practices](../../backend/AUTH_SECURITY.md)
- [Deployment Checklist](./deployment/PRE_DEPLOY_CHECKLIST.md)

---

## 🔄 Next Steps

1. [ ] Complete PostHog integration
2. [ ] Complete Sentry integration
3. [ ] Set up Metabase dashboards
4. [ ] Migrate to organization-based multi-tenancy
5. [ ] Implement soft delete on all models
6. [ ] Add rate limiting middleware
7. [ ] Set up automated backups
8. [ ] Create monitoring alerts

---

**For questions or issues, see:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
