# Render Backend Environment Setup

**Last Updated:** March 6, 2026

---

## 🎯 Overview

TeacherFlow backend uses **Render** for hosting FastAPI services. This guide covers setting up multiple environments on Render.

---

## 🌍 Environment Strategy

### Option 1: Multiple Services (Recommended)

Create separate Render services for each environment:

| Environment | Service Name | Branch | URL |
|-------------|--------------|--------|-----|
| Development | `teacherflow-backend-dev` | `dev` | `teacherflow-backend-dev.onrender.com` |
| Staging | `teacherflow-backend-staging` | `staging` | `teacherflow-backend-staging.onrender.com` |
| Production | `teacherflow-backend` | `main` | `teacherflow-backend.onrender.com` |

**Pros:**
- Complete isolation
- Separate databases
- Independent scaling
- No risk of cross-contamination

**Cons:**
- Higher cost (3 separate services)
- More configuration to maintain

### Option 2: Single Service with Environment Variables

Use one service with environment detection:

**Pros:**
- Lower cost (1 service)
- Simpler management

**Cons:**
- Shared resources
- Risk of misconfiguration
- Harder to test separately

**Recommended:** Option 1 (Multiple Services) for production applications

---

## 📦 Setting Up Multiple Services

### Step 1: Create Development Service

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Name: `teacherflow-backend-dev`
   - Branch: `dev`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Configure Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database_dev

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS (allow dev frontend)
CORS_ORIGINS=https://dev.teacherflow-app.vercel.app,http://localhost:3000

# JWT Secrets (use different secrets per environment!)
SECRET_KEY=your-dev-secret-key-generate-new-one
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth (can use same or separate dev credentials)
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
GOOGLE_REDIRECT_URI=https://dev.teacherflow-app.vercel.app/auth/google/callback

# Monitoring (DISABLED for dev)
ENABLE_MONITORING=false
POSTHOG_API_KEY=
SENTRY_DSN=

# Email (optional for dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=dev@teacherflow.app
```

4. **Configure Settings**
   - Instance Type: Free
   - Region: Oregon (US West) or São Paulo (Brazil)
   - Auto-Deploy: Yes
   - Health Check Path: `/health`

### Step 2: Create Staging Service

1. **Create New Web Service**
   - Name: `teacherflow-backend-staging`
   - Branch: `staging`
   - Same build/start commands as dev

2. **Configure Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database_staging

# Environment
ENVIRONMENT=staging
DEBUG=false

# CORS (allow staging frontend)
CORS_ORIGINS=https://staging.teacherflow-app.vercel.app

# JWT Secrets (DIFFERENT from dev)
SECRET_KEY=your-staging-secret-key-different-from-dev
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth (staging credentials)
GOOGLE_CLIENT_ID=your-staging-google-client-id
GOOGLE_CLIENT_SECRET=your-staging-google-client-secret
GOOGLE_REDIRECT_URI=https://staging.teacherflow-app.vercel.app/auth/google/callback

# Monitoring (ENABLED for staging)
ENABLE_MONITORING=true
POSTHOG_API_KEY=your-staging-posthog-key
SENTRY_DSN=your-staging-sentry-dsn

# Email (real email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=staging@teacherflow.app
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=staging@teacherflow.app
```

3. **Configure Settings**
   - Instance Type: Starter ($7/month recommended for stability)
   - Region: Same as production database
   - Auto-Deploy: Yes
   - Health Check Path: `/health`

### Step 3: Configure Production Service (Existing)

Update existing `teacherflow-backend` service:

1. **Verify Branch**
   - Branch: `main`

2. **Update Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database_production

# Environment
ENVIRONMENT=production
DEBUG=false

# CORS (production frontend only)
CORS_ORIGINS=https://teacherflow-app.vercel.app

# JWT Secrets (DIFFERENT and STRONG)
SECRET_KEY=your-production-secret-key-must-be-different
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth (production credentials)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_REDIRECT_URI=https://teacherflow-app.vercel.app/auth/google/callback

# Monitoring (ENABLED for production)
ENABLE_MONITORING=true
POSTHOG_API_KEY=your-production-posthog-key
SENTRY_DSN=your-production-sentry-dsn

# Email (production email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@teacherflow.app
SMTP_PASSWORD=your-production-smtp-password
EMAIL_FROM=noreply@teacherflow.app
```

3. **Configure Settings**
   - Instance Type: Starter or Standard (depends on usage)
   - Region: Same as database (Brazil)
   - Auto-Deploy: Manual (for safety)
   - Health Check Path: `/health`

---

## 🗄️ Database Setup (Neon)

Create separate databases for each environment:

### Development Database

```bash
# Neon Dashboard → Create Database
Name: teacherflow-dev
Region: São Paulo (sa-east-1)
Branch: dev (or use same branch with different DB)
```

**Connection String:**
```
postgresql://user:password@ep-xxx.sa-east-1.aws.neon.tech/teacherflow_dev?sslmode=require
```

### Staging Database

```bash
# Neon Dashboard → Create Database
Name: teacherflow-staging
Region: São Paulo (sa-east-1)
Branch: staging
```

**Connection String:**
```
postgresql://user:password@ep-xxx.sa-east-1.aws.neon.tech/teacherflow_staging?sslmode=require
```

### Production Database (Existing)

Keep existing production database unchanged.

---

## 🔐 Security Best Practices

### Secret Key Generation

Generate different SECRET_KEY for each environment:

```python
# Generate new secret key
import secrets
print(secrets.token_urlsafe(32))
```

Run this **3 times** and use different keys for dev/staging/prod.

### Database Credentials

- **Never** share production database credentials
- Use read-only credentials for Metabase
- Rotate credentials quarterly
- Use Neon's connection pooling

### Google OAuth

#### Development OAuth App
- **Name:** "TeacherFlow (Development)"
- **Authorized Origins:**
  - `http://localhost:3000`
  - `https://dev.teacherflow-app.vercel.app`
- **Authorized Redirect URIs:**
  - `http://localhost:3000/auth/google/callback`
  - `https://dev.teacherflow-app.vercel.app/auth/google/callback`

#### Staging OAuth App
- **Name:** "TeacherFlow (Staging)"
- **Authorized Origins:**
  - `https://staging.teacherflow-app.vercel.app`
- **Authorized Redirect URIs:**
  - `https://staging.teacherflow-app.vercel.app/auth/google/callback`

#### Production OAuth App
- **Name:** "TeacherFlow"
- **Authorized Origins:**
  - `https://teacherflow-app.vercel.app`
- **Authorized Redirect URIs:**
  - `https://teacherflow-app.vercel.app/auth/google/callback`

---

## 🔄 Deployment Flow

### Automatic Deployments

```bash
# Development
git push origin dev
→ Triggers build on teacherflow-backend-dev
→ Auto-deploys after successful build

# Staging
git push origin staging
→ Triggers build on teacherflow-backend-staging
→ Auto-deploys after successful build

# Production
git push origin main
→ Triggers build on teacherflow-backend
→ MANUAL deploy (requires clicking "Deploy" in dashboard)
```

### Manual Deployments

For production, configure manual deployment:

1. Render Dashboard → teacherflow-backend
2. Settings → Auto-Deploy: **Off**
3. After pushing to `main`, click "Deploy" manually

---

## 📊 Monitoring Each Environment

### Development
```bash
# Health check
curl https://teacherflow-backend-dev.onrender.com/health

# Logs (in Render dashboard)
Render → teacherflow-backend-dev → Logs
```

### Staging
```bash
# Health check
curl https://teacherflow-backend-staging.onrender.com/health

# Errors in Sentry
https://sentry.io → Staging project

# Events in PostHog
https://posthog.com → Staging project
```

### Production
```bash
# Health check
curl https://teacherflow-backend.onrender.com/health

# Errors in Sentry
https://sentry.io → Production project

# Events in PostHog
https://posthog.com → Production project

# Metrics in Render
Dashboard → teacherflow-backend → Metrics
```

---

## 🚨 Troubleshooting

### Service Won't Start

**Check logs:**
```bash
Render Dashboard → Service → Logs tab
```

**Common issues:**
- Missing environment variables
- Database connection failed
- Python dependencies not installed
- Port binding issues

**Fixes:**
```bash
# 1. Verify all required env vars are set
# 2. Test database connection string
# 3. Check requirements.txt is complete
# 4. Verify start command uses $PORT
```

### Database Connection Issues

**Error:** "connection to server failed"

**Fix:**
1. Check DATABASE_URL is correct
2. Verify Neon database is active (not hibernated)
3. Ensure IP allowlist includes Render IPs
4. Test connection with psql

```bash
# Test database connection
psql "$DATABASE_URL"
```

### CORS Errors

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix:**
1. Add frontend URL to CORS_ORIGINS
2. Include protocol (https://)
3. No trailing slash
4. Redeploy backend

```bash
# Correct format
CORS_ORIGINS=https://staging.teacherflow-app.vercel.app

# Wrong formats
CORS_ORIGINS=staging.teacherflow-app.vercel.app  # Missing https://
CORS_ORIGINS=https://staging.teacherflow-app.vercel.app/  # Trailing slash
```

### Slow Cold Starts

**Issue:** Free tier services sleep after 15 minutes

**Solutions:**
1. Upgrade to Starter ($7/month) for staging/production
2. Use cron-job.org to ping health endpoint every 10 minutes
3. Accept cold starts for development

```bash
# Ping service every 10 minutes (cron-job.org)
URL: https://teacherflow-backend-staging.onrender.com/health
Interval: Every 10 minutes
```

---

## 💰 Cost Estimation

| Service | Instance Type | Cost |
|---------|--------------|------|
| Development | Free | $0/month |
| Staging | Starter | $7/month |
| Production | Starter | $7/month |
| **Total** | | **$14/month** |

**Upgrade considerations:**
- Standard ($25/month): Better for high traffic
- Pro ($85/month): Dedicated instances

---

## 📋 Quick Setup Checklist

### Development Backend
- [ ] Create new Render service
- [ ] Set branch to `dev`
- [ ] Add all environment variables
- [ ] Enable auto-deploy
- [ ] Test health endpoint
- [ ] Update frontend VITE_API_BASE_URL

### Staging Backend
- [ ] Create new Render service
- [ ] Set branch to `staging`
- [ ] Add all environment variables
- [ ] Create staging database in Neon
- [ ] Enable monitoring (PostHog + Sentry)
- [ ] Configure Google OAuth
- [ ] Enable auto-deploy
- [ ] Test health endpoint
- [ ] Update frontend VITE_API_BASE_URL

### Production Backend
- [ ] Verify branch is `main`
- [ ] Update all environment variables
- [ ] Verify database connection
- [ ] **Disable** auto-deploy (manual only)
- [ ] Enable monitoring
- [ ] Configure health checks
- [ ] Test all critical endpoints

---

## 🔗 Related Documentation

- [Environment Variables Guide](./VERCEL_ENVIRONMENT_VARIABLES.md)
- [Deployment Workflow](./DEPLOYMENT_WORKFLOW.md)
- [Architecture Overview](./architecture/ARCHITECTURE_STACK_INTEGRATION.md)

---

## 📞 Support

**Render Docs:** https://render.com/docs  
**Neon Docs:** https://neon.tech/docs

**Questions?** Check backend logs first, then review environment variables.
