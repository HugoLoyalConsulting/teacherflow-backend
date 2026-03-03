# TeacherFlow - Production Deployment Guide

**Project:** TeacherFlow SaaS (Multi-Tenant Teacher Management)
**Phase:** 4 Complete, Ready for Production Deployment
**Target Platforms:** Render.com, Railway.app, or AWS (instructions for all)
**Security Level:** Production-Ready, JWT Auth, Multi-Tenant Isolated

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Database Migration](#database-migration)
4. [Deployment Instructions](#deployment-instructions-by-platform)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code & Configuration
- [ ] All 23 backend tests passing (`pytest tests -q`)
- [ ] Frontend build successful (`npm run build` size < 1MB)
- [ ] No security warnings in dependencies (`safety check`)
- [ ] All credentials removed from code (grep for hardcoded secrets)
- [ ] `.env` file created with production secrets
- [ ] `.env` file added to `.gitignore` (verified)

### Security
- [ ] `DEBUG=False` in production .env
- [ ] `SECRET_KEY` is strong random value (32+ chars)
- [ ] `ALLOWED_ORIGINS` set to production frontend domain only
- [ ] `API_HOST` set to appropriate binding (0.0.0.0 for cloud, 127.0.0.1 for local)
- [ ] SSL certificate obtained (Render/Railway provide auto-renewal)
- [ ] CORS whitelist updated with production URLs
- [ ] Rate limiting enabled and tested

### Database
- [ ] PostgreSQL instance created (or managed database service)
- [ ] Database user created with secure password
- [ ] Database name set
- [ ] Backups enabled (automated daily)
- [ ] Connection string tested: `psql postgresql://user:pass@host/dbname`
- [ ] Alembic migrations ready to run

### Monitoring & Logging
- [ ] Sentry account created (or alternative APM)
- [ ] Logging service configured
- [ ] Health check endpoints tested locally
- [ ] Uptime monitoring configured

---

## Environment Variables Setup

### Step 1: Create `.env.production` File

**Location:** `backend/.env.production`

```bash
# ============================================
# APPLICATION CONFIGURATION
# ============================================
DEBUG=false
PROJECT_NAME=TeacherFlow
API_V1_STR=/api/v1

# ============================================
# SECURITY (CRITICAL - Change all from defaults)
# ============================================
# Generate SECRET_KEY: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-super-secret-key-here-min-32-chars-random-value

# Change default algorithm if needed
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# DATABASE (PostgreSQL for production)
# ============================================
# Format: postgresql://user:password@host:5432/dbname
# Example: postgresql://teacherflow_user:SecurePass123@db.example.com:5432/teacherflow_db
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]

# SQLAlchemy settings
SQLALCHEMY_ECHO=false
SQLALCHEMY_POOL_SIZE=20
SQLALCHEMY_POOL_RECYCLE=3600

# ============================================
# CORS & NETWORK
# ============================================
# Production frontend domain (NO localhost)
CORS_ORIGINS=["https://teacherflow.example.com", "https://app.teacherflow.example.com"]

# API binding (cloud platforms usually bind to 0.0.0.0)
API_HOST=0.0.0.0
API_PORT=8000

# Trusted hosts whitelist
TRUSTED_HOSTS=["teacherflow.example.com", "app.teacherflow.example.com"]

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120

# ============================================
# MONITORING & LOGGING (Optional)
# ============================================
SENTRY_DSN=https://[key]@sentry.io/[project-id]
LOG_LEVEL=info

# ============================================
# SMTP (for email features in future)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=[your-email]
# SMTP_PASSWORD=[app-password]
```

### Step 2: Validate Environment Variables

```bash
# Check all required vars are set
python -c "
from app.core.config import settings
print('✓ DEBUG:', settings.DEBUG)
print('✓ DATABASE_URL:', settings.DATABASE_URL[:20] + '...')
print('✓ SECRET_KEY:', settings.SECRET_KEY[:10] + '...')
print('✓ CORS_ORIGINS:', settings.CORS_ORIGINS)
print('✓ API binding:', f'{settings.API_HOST}:{settings.API_PORT}')
"
```

---

## Database Migration

### Step 1: Create PostgreSQL Database

**Option A: Using Platform Managed Database (Recommended)**

**For Render.com:**
1. Go to Dashboard → Create → PostgreSQL
2. Set name: `teacherflow-db`
3. Region: [select closest to your users]
4. Copy connection string from dashboard
5. Add to `.env`: `DATABASE_URL=postgresql://...`

**For Railway.app:**
1. Create new project → Add PostgreSQL
2. Copy DATABASE_URL from Variables tab
3. No additional setup needed

**For AWS RDS:**
1. Create RDS instance (PostgreSQL 14+)
2. Security group allows inbound 5432 from app server
3. Copy endpoint: `postgresql://user:pass@endpoint.rds.amazonaws.com:5432/teacherflow`

**Option B: Self-Hosted PostgreSQL**

```bash
# Install PostgreSQL (Ubuntu)
sudo apt-get install postgresql postgresql-contrib

# Create user and database
sudo -u postgres psql <<EOF
CREATE USER teacherflow_user WITH PASSWORD 'SecurePassword123!';
CREATE DATABASE teacherflow_db OWNER teacherflow_user;
GRANT ALL PRIVILEGES ON DATABASE teacherflow_db TO teacherflow_user;
EOF

# Connection string
DATABASE_URL=postgresql://teacherflow_user:SecurePassword123!@localhost:5432/teacherflow_db
```

### Step 2: Run Database Migrations

```bash
# From backend root directory
cd backend

# Install dependencies first
pip install -r requirements.txt

# Run Alembic migrations (creates tables)
alembic upgrade head

# Verify tables created
python -c "
from app.core.database import Base, engine
from app.models import User, Tenant, Student
inspector = inspect(engine)
tables = inspector.get_table_names()
print('✓ Tables created:', tables)
"
```

### Step 3: Create Initial Admin User

```bash
# Option A: Python script (in backend/)
python << 'EOF'
from app.core.database import SessionLocal
from app.models import Tenant, User
from app.services.auth_service import hash_password
import uuid

db = SessionLocal()

try:
    # Create admin tenant
    admin_tenant = Tenant(
        id=str(uuid.uuid4()),
        name="TeacherFlow Admin",
        plan="PREMIUM",
        is_active=True
    )
    db.add(admin_tenant)
    db.commit()
    
    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        tenant_id=admin_tenant.id,
        email="admin@teacherflow.com",
        password_hash=hash_password("AdminSecurePass123!"),
        is_admin=True,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    
    print(f"✓ Admin user created: admin@teacherflow.com")
    print(f"✓ Tenant ID: {admin_tenant.id}")
except Exception as e:
    print(f"✗ Error: {e}")
    db.rollback()
finally:
    db.close()
EOF
```

---

## Deployment Instructions By Platform

### Platform 1: Render.com (Recommended for Beginners)

**Advantages:** Free tier, automatic HTTPS, git-based deployment, PostgreSQL managed

**Setup Steps:**

#### A. Connect GitHub Repository
1. Go to https://render.com/dashboard
2. Create new → Web Service
3. Connect GitHub account (authorize Render)
4. Select `teacherflow-backend` repository
5. Click "Connect"

#### B. Configure Deployment
```
Name: teacherflow-backend
Region: [select your region] (e.g., Frankfurt for EU)
Branch: main
Root Directory: . (or path if monorepo)
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### C. Add Environment Variables
1. Go to Service → Environment
2. Add variables from `.env.production`:
   ```
   DEBUG=false
   SECRET_KEY=[your-generated-key]
   DATABASE_URL=[from PostgreSQL service]
   API_HOST=0.0.0.0
   CORS_ORIGINS=["https://your-frontend.com"]
   # ... (all other vars)
   ```

#### D. Deploy Frontend
1. Create new → Static Site
2. Connect same GitHub repository
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`

#### E. Connect Services
Frontend environment variables:
```
VITE_API_BASE_URL=https://teacherflow-backend.render.com
```

**URL Format:**
- Backend: `https://teacherflow-backend.render.com`
- Frontend: `https://teacherflow-frontend.render.com`

**Expected Result:**
```bash
$ curl https://teacherflow-backend.render.com/api/v1/health
{"status": "ok"}
```

---

### Platform 2: Railway.app

**Advantages:** Very simple UI, GitHub integration, PostgreSQL add-on

**Setup Steps:**

#### A. Create Project
1. Go to https://railway.app/dashboard
2. Create new project
3. Connect GitHub repository
4. Select `teacherflow-backend` as root directory

#### B. Add PostgreSQL
1. In project, click "Add" → "Database" → PostgreSQL
2. Automatic connection string created
3. Copy DATABASE_URL from Variables

#### C. Configure Deployment
1. Root directory: `.` (or specify if needed)
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### D. Set Environment Variables
Click Variables tab → Add from Raw Editor:
```
DEBUG=false
SECRET_KEY=your-secret-key
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=["https://your-frontend.com"]
API_HOST=0.0.0.0
API_PORT=$PORT
```

#### E. Deploy Frontend
Create separate project for frontend:
1. Root directory: `frontend`
2. Build command: `npm install && npm run build`
3. Start command: `npm run preview` (or use Railway's static hosting)

**Result:**
- Backend URL automatically assigned (e.g., `teacherflow-.up.railway.app`)
- Update frontend `VITE_API_BASE_URL` with this URL

---

### Platform 3: AWS Deployment (Advanced)

**Components:**
- EC2 (backend) or ECS (containerized)
- RDS PostgreSQL (managed database)
- CloudFront (frontend CDN)
- Route 53 (DNS)

#### A. Prepare Docker Image

**Dockerfile for backend:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml (for local testing):**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - DATABASE_URL=postgresql://user:password@postgres:5432/teacherflow
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=teacherflow_user
      - POSTGRES_PASSWORD=SecurePass123!
      - POSTGRES_DB=teacherflow_db
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

#### B. Deploy to ECS

```bash
# Build and push to ECR
aws ecr create-repository --repository-name teacherflow-backend --region us-east-1
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker build -t teacherflow-backend .
docker tag teacherflow-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/teacherflow-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/teacherflow-backend:latest

# Create ECS task definition, service, etc. (via AWS Console or CDK)
```

---

## Post-Deployment Verification

### Step 1: Health Checks

```bash
# Backend health
curl -s https://teacherflow-backend.example.com/health | jq .
# Expected: {"status": "ok"}

# Full API check
curl -s https://teacherflow-backend.example.com/api/v1/health | jq .

# Frontend accessibility
curl -s https://teacherflow.example.com | grep -q "Teaching Management" && echo "✓ Frontend loaded"
```

### Step 2: Authentication Test

```bash
# Register new user
curl -X POST https://teacherflow-backend.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "password": "TestPass123!",
    "name": "Test Teacher"
  }' | jq .

# Expected: JWT token returned
```

### Step 3: Database Connectivity

```bash
# From backend server (via SSH), test database
python << 'EOF'
from app.core.database import SessionLocal
from app.models import Tenant

db = SessionLocal()
tenants = db.query(Tenant).all()
print(f"✓ Database connected: {len(tenants)} tenants found")
db.close()
EOF
```

### Step 4: Security Headers Check

```bash
curl -I https://teacherflow-backend.example.com/api/v1/health

# Should include:
# - Strict-Transport-Security: max-age=31536000
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
```

### Step 5: CORS Validation

```bash
# Test CORS from frontend domain
curl -H "Origin: https://teacherflow.example.com" \
  https://teacherflow-backend.example.com/api/v1/health

# Should include Access-Control-Allow-Origin header
```

---

## Monitoring & Maintenance

### Set Up Error Tracking (Sentry)

```python
# backend/app/main.py - Add before app creation
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,
        environment="production"
    )
```

### Database Backups

**Automated (Cloud Platforms):**
- Render: Automatic daily backups (7-day retention)
- Railway: Manual backups (paid tier)
- AWS RDS: Set backup window + retention period

**Manual Backup Script:**
```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="teacherflow_backup_${TIMESTAMP}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp ${BACKUP_FILE}.gz s3://teacherflow-backups/
echo "✓ Backup created: ${BACKUP_FILE}.gz"
```

### Log Aggregation

**CloudWatch (AWS):**
```python
import logging
import watchtower

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()
logger.addHandler(watchtower.CloudWatchLogHandler())
```

**ELK Stack (Self-Hosted):**
```bash
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
```

### Uptime Monitoring

**Services:**
- UptimeRobot (free): Monitor /health endpoint every 5 minutes
- Pingdom: Advanced monitoring + alerts
- Datadog: Full-stack monitoring + APM

---

## Rollback Procedures

### Scenario 1: Deploy Breaks Functionality

**Render.com Rollback:**
1. Dashboard → Web Service → Deployments
2. Select previous deployment
3. Click "Redeploy"
4. Site reverts in 2-3 minutes

**Railway.app Rollback:**
1. Project → Deployments tab
2. Select previous version
3. Click "Rollback"

**Manual Rollback:**
```bash
# If git deployment failed, manually revert
git revert HEAD
git push origin main
# Deployment will automatically trigger

# Or manually restart with known-good version
docker pull teacherflow-backend:v1.0-stable
docker run ... (with same env vars)
```

### Scenario 2: Database Issue

**Restore from Backup:**
```bash
# For AWS RDS
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier teacherflow-db-restored \
  --db-snapshot-identifier teacherflow-backup-2024-01-15-03-00

# For manual backup
psql $DATABASE_URL < teacherflow_backup_2024-01-14.sql
```

---

## Troubleshooting

### Issue: Backend won't start
```
Error: "Secret key not found"
Solution: Set SECRET_KEY in environment variables
Verify: echo $SECRET_KEY (should not be empty)
```

### Issue: Database connection fails
```
Error: "unable to connect to database"
Solution: 
1. Verify DATABASE_URL in environment
2. Test connection: psql $DATABASE_URL
3. Check firewall allows outbound 5432 (PostgreSQL)
4. Verify IP whitelisting if using cloud database
```

### Issue: Frontend shows 401 Unauthorized
```
Error: "JWT validation failed"
Cause: Frontend SECRET_KEY differs from backend
Solution:
1. Use identical SECRET_KEY in env vars
2. Clear localStorage, re-login
3. Check token expiry (30 min default)
```

### Issue: CORS errors in browser console
```
Error: "Cross-Origin Request Blocked"
Solution:
1. Update CORS_ORIGINS with frontend domain
2. Verify frontend URL in CORS_ORIGINS list
3. Restart backend (env changes require restart)
```

### Issue: Rate limiting blocks legitimate traffic
```
Error: "429 Too Many Requests"
Solution:
1. Increase RATE_LIMIT_MAX_REQUESTS if needed
2. Use Redis for distributed rate limiting
3. Whitelist health check URLs
```

---

## Success Criteria

Your production deployment is successful when:

✅ Backend health check returns 200
✅ User can register new account
✅ User can login and receive JWT
✅ Frontend can fetch user's data from backend
✅ Student creation works end-to-end
✅ Tenant isolation prevents cross-tenant access
✅ SSL certificate valid (HTTPS works)
✅ All 23 backend tests passing in production
✅ Sentry captures no critical errors (first 24 hours)
✅ Database backups running automatically

---

## Post-Deployment Communication

### Notify Users
- [ ] Send deployment notification to all school admins
- [ ] Provide new production URL
- [ ] Request password reset for security
- [ ] Share security policy document

### Documentation
- [ ] Update README with production URLs
- [ ] Create admin onboarding guide
- [ ] Document incident response procedures
- [ ] Plan security training for team

---

**Deployment Checklist Complete!**

Once all steps complete, your TeacherFlow SaaS is production-ready with:
- ✅ JWT authentication
- ✅ Multi-tenant isolation
- ✅ Rate limiting protection
- ✅ Secure database
- ✅ Automated backups
- ✅ Error tracking
- ✅ Health monitoring

**Next Phase:** Continuous improvement, feature releases, security updates

---

*Last Updated: Phase 4 Completion*
*Version: 1.0*
