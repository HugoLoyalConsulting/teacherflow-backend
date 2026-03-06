# Stack Integration Setup Guide

Complete guide to set up all integrations for TeacherFlow's observability and monitoring stack.

---

## 🎯 Overview

This guide walks you through setting up:
1. **PostHog** - Product analytics
2. **Sentry** - Error monitoring
3. **Metabase** - Business intelligence
4. **GitHub Secrets** - CI/CD configuration

**Time Required:** ~45 minutes

---

## 📊 1. PostHog Setup (Product Analytics)

### Step 1.1: Create PostHog Account

1. Go to https://app.posthog.com/signup
2. Sign up with email or GitHub
3. Choose:
   - **Self-hosted:** No (use Cloud)
   - **Company name:** Your organization
   - **Role:** Developer/Founder

### Step 1.2: Create Project

1. Click "Create Project"
2. **Project name:** TeacherFlow Production
3. **Timezone:** Your timezone
4. Click "Create project"

### Step 1.3: Get API Keys

1. Go to **Settings** → **Project** → **API Keys**
2. Copy the **Project API Key** (starts with `phc_`)
   - Example: `phc_ABC123XYZ789...`
3. Note the **Host:** `https://app.posthog.com`

### Step 1.4: Backend Configuration

Add to Render environment variables:

```env
POSTHOG_ENABLED=true
POSTHOG_API_KEY=phc_your_actual_key_here
POSTHOG_HOST=https://app.posthog.com
```

**In Render Dashboard:**
1. Go to https://dashboard.render.com
2. Select "teacherflow-backend"
3. Click "Environment"
4. Add each variable above
5. Click "Save Changes"
6. Service will auto-redeploy

### Step 1.5: Frontend Configuration

Add to Vercel environment variables:

```env
VITE_POSTHOG_ENABLED=true
VITE_POSTHOG_KEY=phc_your_actual_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

**In Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select "teacherflow-frontend"
3. Click "Settings" → "Environment Variables"
4. Add each variable above
5. Click "Save"
6. Redeploy: "Deployments" → "..." → "Redeploy"

### Step 1.6: Verify PostHog

1. Deploy changes
2. Open your app: https://teacherflow-app.vercel.app
3. Perform some actions (login, create student, etc.)
4. Go to PostHog dashboard → **Events** → **Live Events**
5. You should see events appearing in real-time

**Expected events:**
- `user_logged_in`
- `page_viewed`
- `student_created`

### Step 1.7: Create Basic Insights

1. Go to **Insights** → **New Insight**
2. Create:
   - **Daily Active Users:** Filter by `user_logged_in`, group by day
   - **Signups:** Count `user_signed_up` events
   - **Feature Usage:** Count specific feature events

---

## 🐛 2. Sentry Setup (Error Monitoring)

### Step 2.1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up with email or GitHub
3. Verify your email

### Step 2.2: Create Projects

**Backend Project:**
1. Click "Create Project"
2. **Platform:** Python
3. **Project name:** teacherflow-backend
4. **Team:** Default (or create one)
5. Click "Create Project"
6. **Copy the DSN** (looks like: `https://abc123@o123456.ingest.sentry.io/7654321`)

**Frontend Project:**
1. Click "Create Project" again
2. **Platform:** React
3. **Project name:** teacherflow-frontend
4. **Team:** Same as above
5. Click "Create Project"
6. **Copy the DSN**

### Step 2.3: Backend Configuration

Add to Render:

```env
SENTRY_ENABLED=true
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
ENVIRONMENT=production
```

### Step 2.4: Frontend Configuration

Add to Vercel:

```env
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
```

### Step 2.5: Verify Sentry

**Test backend:**
```python
# In Python shell or create a test endpoint
import sentry_sdk
sentry_sdk.capture_message("Backend Sentry test!")
```

**Test frontend:**
```typescript
// In browser console
Sentry.captureMessage("Frontend Sentry test!")
```

Check Sentry dashboard → **Issues** for the test messages.

### Step 2.6: Configure Alerts

1. Go to **Alerts** → **Create Alert**
2. Set up:
   - **New Issue:** Alert when new error types appear
   - **High Volume:** Alert when error count > 10/hour
   - **Performance:** Alert when response time > 2s

3. **Notification channels:**
   - Email
   - Slack (optional)

---

## 📈 3. Metabase Setup (Business Intelligence)

See detailed guide: [METABASE_SETUP.md](./METABASE_SETUP.md)

**Quick Setup:**

### Option A: Metabase Cloud (Paid)

1. Go to https://www.metabase.com/pricing
2. Sign up for Starter plan ($85/month)
3. Follow cloud setup
4. Connect to Neon database (see connection details below)

### Option B: Self-Host on Render (Free)

1. **Create Render Web Service:**
   - Docker Image: `metabase/metabase:latest`
   - Name: teacherflow-metabase
   - Plan: Free

2. **Environment Variables:**
   ```env
   MB_DB_TYPE=postgres
   MB_DB_DBNAME=metabase
   MB_DB_PORT=5432
   MB_DB_USER=neondb_owner
   MB_DB_PASS=npg_jZGViq4QOTA7
   MB_DB_HOST=ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech
   ```

3. **Access:**
   - URL: https://teacherflow-metabase.onrender.com
   - Complete setup wizard
   - Add TeacherFlow database

### Database Connection (Both Options)

```
Database type: PostgreSQL
Host: ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech
Port: 5432
Database name: neondb
Username: neondb_owner
Password: npg_jZGViq4QOTA7

SSL: Enabled
SSL Mode: require
```

---

## 🔐 4. GitHub Secrets Setup

### Step 4.1: Required Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Click "New repository secret" and add:

#### Backend Secrets:
```
RENDER_DEPLOY_HOOK
- Go to Render → teacherflow-backend → Settings → Deploy Hook
- Copy the webhook URL
```

#### Frontend Secrets:
```
VERCEL_TOKEN
- Go to Vercel → Settings → Tokens
- Create new token
- Copy token

VERCEL_ORG_ID
- In Vercel project settings → General
- Copy "Organization ID"

VERCEL_PROJECT_ID
- In Vercel project settings → General
- Copy "Project ID"

VITE_API_URL
- Value: https://teacherflow-backend.onrender.com

VITE_GOOGLE_CLIENT_ID
- Your Google OAuth Client ID

VITE_POSTHOG_KEY
- Your PostHog API key

VITE_POSTHOG_ENABLED
- Value: true

VITE_SENTRY_DSN
- Your frontend Sentry DSN

VITE_SENTRY_ENABLED
- Value: true
```

### Step 4.2: Verify GitHub Actions

1. Make a small change to code
2. Commit and push to `main`
3. Go to GitHub → **Actions** tab
4. Watch workflows run
5. Verify deployments succeed

---

## ✅ 5. Verification Checklist

### PostHog
- [ ] Account created
- [ ] Project created
- [ ] API keys configured in Render & Vercel
- [ ] Live events appearing in dashboard
- [ ] Users being identified on login

### Sentry
- [ ] Account created
- [ ] Backend project created
- [ ] Frontend project created
- [ ] DSNs configured in Render & Vercel
- [ ] Test errors appearing
- [ ] Alerts configured

### Metabase
- [ ] Instance running (cloud or self-hosted)
- [ ] Connected to Neon database
- [ ] First dashboard created
- [ ] Queries returning data

### GitHub Actions
- [ ] All secrets added
- [ ] Backend deploy workflow passing
- [ ] Frontend deploy workflow passing
- [ ] Auto-deploy on push working

---

## 🧪 6. End-to-End Test

### Test Flow:

1. **Make a code change**
   ```bash
   git checkout -b test/observability
   # Make a small change to README
   git commit -m "test: verify observability stack"
   git push origin test/observability
   ```

2. **Verify GitHub Actions**
   - Check Actions tab
   - Workflows should trigger

3. **Verify Deployments**
   - Render should show new deployment
   - Vercel should show new deployment

4. **Test Application**
   - Open https://teacherflow-app.vercel.app
   - Login
   - Create a student
   - View dashboard

5. **Verify Telemetry**
   - **PostHog:** Check for events
   - **Sentry:** Should have no errors (if all working)
   - **Metabase:** Data should update

---

## 🔄 7. Maintenance Tasks

### Weekly:
- [ ] Check Sentry for new error patterns
- [ ] Review PostHog insights
- [ ] Update Metabase dashboards

### Monthly:
- [ ] Review alert thresholds
- [ ] Check integration health
- [ ] Update documentation

### Quarterly:
- [ ] Review subscription usage
- [ ] Optimize event tracking
- [ ] Archive old data

---

## 📊 8. Dashboard Setup

### PostHog Dashboards

Create these dashboards:

**Product Metrics:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- User retention (cohort analysis)

**Feature Usage:**
- Most used features
- Feature adoption rate
- User journeys
- Drop-off points

### Sentry Dashboards

Monitor:
- Error rate trends
- Most common errors
- Performance metrics
- Release health

### Metabase Dashboards

Create:
- Executive Overview
- Student Metrics
- Revenue Dashboard
- Teacher Activity

See [METABASE_SETUP.md](./METABASE_SETUP.md) for SQL queries.

---

## 🆘 Troubleshooting

### PostHog not receiving events

**Check:**
1. API key is correct (starts with `phc_`)
2. Environment variables set correctly
3. Application redeployed after adding variables
4. Browser console for errors
5. Network tab for failed requests to PostHog

**Fix:**
```bash
# Verify environment variables
# Render
curl https://teacherflow-backend.onrender.com/health

# Check logs
# Render → Logs (should see "PostHog telemetry: ENABLED")
```

### Sentry not capturing errors

**Check:**
1. DSN is correct
2. Sentry enabled in environment
3. Error is not in ignore list

**Test manually:**
```python
# Backend
from app.core.monitoring import capture_message
capture_message("Test message", level="info")
```

```typescript
// Frontend
import { captureMessage } from './services/monitoring'
captureMessage("Test message", "info")
```

### Metabase connection failed

**Check:**
1. Neon database not paused
2. Connection string correct
3. SSL mode set to "require"
4. Firewall allows connection

**Test connection:**
```bash
psql "postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT 1;"
```

---

## 📞 Support Resources

- **PostHog:** https://posthog.com/docs
- **Sentry:** https://docs.sentry.io/
- **Metabase:** https://www.metabase.com/docs/
- **Neon:** https://neon.tech/docs
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs

---

## 🎓 Next Steps

After setup is complete:

1. **Monitor for 7 days** - Watch for patterns
2. **Set up alerts** - Get notified of issues
3. **Create reports** - Weekly/monthly summaries
4. **Train team** - Share dashboard access
5. **Iterate** - Improve based on data

---

**Setup Complete! 🎉**

Your observability stack is now fully integrated. Monitor the dashboards and adjust as needed.
