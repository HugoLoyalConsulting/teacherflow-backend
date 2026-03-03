# External Infrastructure Required

This document outlines what needs to be set up OUTSIDE of VSCode (external services/infrastructure) to run TeacherFlow in production.

## Summary

You need **3 external services** (all free tier available):

1. **PostgreSQL Database** (Neon or Supabase)
2. **Backend Hosting** (Render)
3. **Frontend Hosting** (Vercel)

**Total Cost:** $0/month (all free tiers)

---

## 1. Database: PostgreSQL (Required)

### Option A: Neon.tech (Recommended)

**Why Neon?** Serverless PostgreSQL, free tier includes 5 projects, 3GB storage

**Setup:**

1. Go to https://neon.tech
2. Sign up (email or GitHub)
3. Create new project:
   - Project name: `teacherflow`
   - Region: Choose nearest to users
   - Postgres version: 15
4. Copy connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require
   ```
5. Use this as `DATABASE_URL` in backend `.env`

**Connection String Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Monitoring:**
- Neon dashboard shows storage used, connections, query logs
- Connection pooling included (max 10 connections)

### Option B: Supabase.com (Alternative)

**Why Supabase?** PostgreSQL + Auth + Realtime, free tier includes 500MB storage

**Setup:**

1. Go to https://supabase.com
2. Sign up (email/GitHub/Google)
3. Create new project:
   - Project name: `teacherflow`
   - Region: Geographically closest
4. Go to Settings > Database > Connection string
5. Copy "URI" format
6. Add to backend `.env` as `DATABASE_URL`

### Option C: AWS RDS (For Scale)

**Why AWS?** More control, better for production at scale

**Note:** Free tier includes 12 months of micro instance, then ~$12/month

**Setup:**

1. Create AWS account (https://aws.amazon.com)
2. RDS Dashboard → Create database
3. Engine: PostgreSQL (latest)
4. Instance class: `db.t3.micro` (free tier)
5. Storage: 20GB (free tier)
6. Publicly accessible: Yes
7. Security group: Allow inbound on port 5432
8. Get connection string from "Database endpoints"

---

## 2. Backend Hosting: Render.com

**Why Render?**
- Free tier: 750 compute hours/month (≈1 month continuous)
- Auto-deploys from GitHub
- Environment variables built-in
- Easy database integration

**Setup:**

1. Go to https://render.com
2. Sign up (email/GitHub)
3. Create new Web Service:
   - Connect your GitHub repo
   - Name: `teacherflow-api`
   - Environment: Docker
   - Auto-deploy: On push to main
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://...from Neon/Supabase...
   SECRET_KEY=<generate 32+ char random string>
   DEBUG=false
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```
5. Deploy

**Your Backend URL:** `https://teacherflow-api.onrender.com`

**Add to Frontend:** Update API client to use this URL

### Generate SECRET_KEY

```bash
# In terminal (Python):
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use online generator (must be 32+ chars)
```

### Monitor Backend

- Render dashboard shows logs, metrics, restart history
- Free tier: Deploy from git on every push
- Can scale up to paid ($7+/month) for more compute

---

## 3. Frontend Hosting: Vercel

**Why Vercel?**
- Optimized for React/Vite
- Free tier: Unlimited deployments
- Auto-deploys from GitHub
- Global CDN

**Setup:**

1. Go to https://vercel.com
2. Sign up (email/GitHub recommended)
3. Import project:
   - Connect GitHub repository
   - Select `TeacherFlow App` folder
4. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Environment variables:
   ```
   VITE_API_URL=https://teacherflow-api.onrender.com
   ```
6. Deploy

**Your Frontend URL:** `https://teacherflow.vercel.app` (custom domain possible)

**Update Backend CORS:**

1. Go to Render backend settings
2. Add Vercel URL to `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=["https://teacherflow.vercel.app", "https://your-custom-domain.com"]
   ```
3. Redeploy

---

## Infrastructure Checklist

- [ ] **Database:** Create Neon/Supabase account
  - [ ] Create project
  - [ ] Copy connection string
  - [ ] Save as DATABASE_URL
- [ ] **Backend:** Create Render account
  - [ ] Connect GitHub
  - [ ] Create Web Service
  - [ ] Set environment variables (DATABASE_URL, SECRET_KEY)
  - [ ] Deploy
  - [ ] Save API URL
- [ ] **Frontend:** Create Vercel account
  - [ ] Connect GitHub
  - [ ] Select TeacherFlow App folder
  - [ ] Set VITE_API_URL to Render URL
  - [ ] Deploy
  - [ ] Update backend CORS with Vercel URL
- [ ] **Test:** Make API call from frontend to backend

---

## Connection Diagram

```
┌─────────────────────────────────────────────────┐
│                    INTERNET                     │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────┴───────┐
        │              │
    ┌───▼───┐      ┌───▼────┐
    │Vercel │      │ Render │
    │ React │      │FastAPI │
    │  App  │      │Backend │
    └───────┘      └───┬────┘
        │              │
        │         ┌────▼────┐
        └────────▶│   Neon   │
                  │PostgreSQL│
                  └──────────┘
```

---

## Environment Variables Quick Reference

### Backend (.env on Render)

```env
# REQUIRED - Change these!
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SECRET_KEY=<32+ char random string>

# CORS - Add your Vercel frontend URL
CORS_ORIGINS=["https://teacherflow.vercel.app"]

# Optional
DEBUG=false
API_V1_STR=/api/v1
```

### Frontend (.env at Vercel)

```env
VITE_API_URL=https://teacherflow-api.onrender.com
```

---

## Deployment Workflow

### First Time Deploy

1. **Database:**
   ```bash
   # Create account at Neon/Supabase
   # Create project
   # Copy connection string
   ```

2. **Backend:**
   ```bash
   # Push to GitHub
   git push origin main
   
   # Create Render Web Service
   # Add DATABASE_URL env var
   # Add SECRET_KEY env var
   # Auto-deploys
   ```

3. **Frontend:**
   ```bash
   # Create Vercel project
   # Add VITE_API_URL env var
   # Auto-deploys
   ```

### Update Deployment

```bash
# Frontend or Backend changes
git push origin main

# Automatic redeploy happens
# - Vercel redeploys React app
# - Render redeploys FastAPI
```

---

## Monitoring & Maintenance

### Database (Neon Dashboard)

- Storage usage
- Connection count
- Transaction logs
- Query performance

### Backend (Render Dashboard)

- Request logs
- Error tracking
- CPU/memory usage
- Deployment history

### Frontend (Vercel Dashboard)

- Build logs
- Request metrics
- Analytics
- Error reporting

---

## Scaling (When Needed)

### Free → Paid Progression

| Tier | Cost | Use Case |
|------|------|----------|
| Free | $0 | Development, testing |
| Render Starter | $7/mo | Basic production |
| Neon Pro | $0.30/GB | Larger database |
| Supabase Pro | $25/mo | Auth + real-time |

Start free, upgrade components individually as needed.

---

## Common Issues

### "Can't connect to database"
- Check DATABASE_URL format in Render
- Verify Neon/Supabase project exists
- Check if connection pooling is enabled
- In Neon: Enable "Connection pooling" in dashboard

### "CORS error from frontend"
- Add Vercel URL to backend CORS_ORIGINS
- Redeploy backend on Render
- Check `https://` not `http://`

### "Render free tier spinning down"
- Expected behavior (after 15 min inactivity)
- First request after idle takes 30 seconds
- Upgrade to Starter plan for always-on ($7/mo)

### "Database connection limit"
- Free tier: Max 5-10 connections
- Use connection pooling (Neon has this)
- With TanStack Query on frontend, reuse connections

---

## What You've Built

✅ **In VSCode (Phase 2 Complete):**
- FastAPI backend with 7 resource endpoints
- SQLAlchemy ORM models
- JWT authentication
- Docker ready

🔲 **Now Setup Externally:**
- PostgreSQL database (Neon/Supabase/AWS)
- Backend hosting (Render)
- Frontend hosting (Vercel)

**Total Setup Time:** 30-45 minutes for all three services

---

**Next Step:** Follow setup instructions for each service above, then update API URLs and CORS settings.
