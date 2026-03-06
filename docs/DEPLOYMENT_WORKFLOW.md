# Multi-Environment Deployment Workflow

**Last Updated:** March 6, 2026

---

## 🌍 Environment Overview

TeacherFlow uses a three-tier deployment strategy:

| Environment | Branch | URL | Purpose | Auto-Deploy | Monitoring |
|-------------|--------|-----|---------|-------------|------------|
| **Development** | `dev` | https://dev.teacherflow-app.vercel.app | Active development | ✅ Yes | ❌ Disabled |
| **Staging** | `staging` | https://staging.teacherflow-app.vercel.app | QA testing | ✅ Yes | ✅ Enabled |
| **Production** | `main` | https://teacherflow-app.vercel.app | Live users | ⚠️ Manual | ✅ Enabled |

---

## 🚀 Deployment Flow

```
Developer commits → dev branch
         ↓
   Auto-deploy to Development
         ↓
   Test & verify locally
         ↓
   Merge dev → staging
         ↓
   Auto-deploy to Staging
         ↓
   QA team tests extensively
         ↓
   Approve & merge staging → main
         ↓
   Manual deploy to Production
         ↓
   Monitor metrics & errors
```

---

## 📝 Step-by-Step Workflow

### Step 1: Development

**Goal:** Implement and test features locally

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# 2. Develop & commit
# ... make changes ...
git add .
git commit -m "feat: description of feature"

# 3. Push to dev
git checkout dev
git merge feature/your-feature-name
git push origin dev
```

**What happens:**
- GitHub Actions triggers `deploy-dev.yml`
- Builds with development environment variables
- Deploys to https://dev.teacherflow-app.vercel.app
- No monitoring enabled (faster iteration)
- All features enabled for testing

**Verify:**
```bash
# Check deployment
curl https://dev.teacherflow-app.vercel.app/health

# Or open in browser
open https://dev.teacherflow-app.vercel.app
```

---

### Step 2: Staging (Pre-Production QA)

**Goal:** Extensive QA testing before production

```bash
# 1. Merge dev → staging
git checkout staging
git pull origin staging
git merge dev

# 2. Push to staging
git push origin staging
```

**What happens:**
- GitHub Actions triggers `deploy-staging.yml`
- Runs tests before deployment
- Builds with staging environment variables
- Deploys to https://staging.teacherflow-app.vercel.app
- Full monitoring enabled (PostHog + Sentry)
- Uses staging backend and database

**QA Checklist:**
- [ ] All new features working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Authentication flows working
- [ ] API calls successful
- [ ] Performance acceptable
- [ ] No Sentry errors
- [ ] PostHog events tracking

**QA Duration:** Minimum 24-48 hours

---

### Step 3: Production Deployment

**Goal:** Deploy to live environment for real users

⚠️ **IMPORTANT:** Production deploys require careful consideration

#### Pre-Deployment Checklist

- [ ] Staging QA passed (24+ hours)
- [ ] No critical Sentry errors in staging
- [ ] Performance metrics acceptable
- [ ] Database migrations tested (if any)
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Off-peak hours selected (if possible)

#### Deployment Process

```bash
# 1. Merge staging → main
git checkout main
git pull origin main
git merge staging --no-ff -m "Release: version X.Y.Z"

# 2. Tag release
git tag -a v1.2.3 -m "Release 1.2.3: Feature description"

# 3. Push to main
git push origin main
git push origin --tags
```

**What happens:**
- GitHub Actions triggers `deploy-frontend.yml`
- Runs full test suite
- Builds with production environment variables
- Deploys to https://teacherflow-app.vercel.app
- Full monitoring enabled
- Uses production backend and database

#### Post-Deployment Verification

**Immediate (0-5 minutes):**
```bash
# 1. Check health
curl https://teacherflow-app.vercel.app/health

# 2. Test critical paths
- Open app
- Login with demo account
- Create a student
- View dashboard
- Check API calls in Network tab
```

**Short-term (5-30 minutes):**
- [ ] Monitor Sentry for new errors
- [ ] Check PostHog for event flow
- [ ] Test Google OAuth login
- [ ] Verify mobile experience
- [ ] Check all major features

**Medium-term (1-24 hours):**
- [ ] Monitor error rates
- [ ] Check user engagement metrics
- [ ] Review performance metrics
- [ ] Collect user feedback

---

## 🔧 Backend Environment Setup

Each frontend environment connects to a corresponding backend:

| Frontend | Backend | Database |
|----------|---------|----------|
| Development | http://localhost:8000 | Local PostgreSQL |
| Staging | https://teacherflow-backend-staging.onrender.com | Neon (staging) |
| Production | https://teacherflow-backend.onrender.com | Neon (production) |

**Backend deployment workflow:**

```bash
# Development backend runs locally
cd backend
uvicorn app.main:app --reload

# Staging backend (separate Render service)
# Create separate Render service: teacherflow-backend-staging
# Connect to staging database

# Production backend (existing service)
# Uses production database
```

---

## 🎯 Promotion Strategies

### Strategy 1: Continuous Deployment (Current)

```
dev (auto) → staging (auto) → main (manual)
```

**Pros:**
- Fast iteration in dev
- QA has stable staging
- Production is controlled

**Cons:**
- Multiple merges needed

### Strategy 2: Feature Flags

Use feature flags to enable/disable features per environment:

```typescript
// frontend/src/config/features.ts
export const features = {
  emailVerification: import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === 'true',
  subscriptions: import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true',
  demo: import.meta.env.VITE_DEMO_ENABLED === 'true',
}

// Usage
if (features.subscriptions) {
  // Show subscription UI
}
```

---

## 🆘 Rollback Procedures

### If deployment fails:

**Option 1: Instant rollback (Vercel)**

```bash
# In Vercel dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
```

**Option 2: Git revert**

```bash
# Revert the merge
git revert HEAD
git push origin main

# Wait for auto-deploy
```

**Option 3: Force previous deployment**

```bash
# Redeploy specific commit
git checkout <previous-commit-hash>
git push origin main --force
```

### If production has critical bugs:

1. **Immediate:** Rollback to previous deployment (Option 1)
2. **Fix:** Create hotfix branch from main
3. **Test:** Quick test in staging
4. **Deploy:** Merge hotfix to main

```bash
# Hotfix workflow
git checkout main
git checkout -b hotfix/critical-bug-fix

# Fix the bug
git commit -m "fix: critical bug description"

# Quick staging test
git checkout staging
git merge hotfix/critical-bug-fix
git push origin staging

# After verification, deploy to prod
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

---

## 📊 Monitoring Each Environment

### Development
- **Logs:** Vercel deployment logs
- **Errors:** Browser console only
- **Metrics:** None

### Staging
- **Logs:** Vercel + Sentry
- **Errors:** Sentry dashboard (staging project)
- **Metrics:** PostHog (staging project)
- **Performance:** Vercel Analytics

### Production
- **Logs:** Vercel + Sentry
- **Errors:** Sentry dashboard (production project)
- **Metrics:** PostHog (production project)
- **Performance:** Vercel Analytics
- **Uptime:** Consider adding UptimeRobot

---

## 🔐 Security Considerations

### Secrets Management

Each environment has separate secrets:

**Development:**
- Uses test API keys
- Monitoring disabled
- Debug mode enabled

**Staging:**
- Uses staging API keys (separate PostHog/Sentry projects)
- Monitoring enabled
- Debug mode partially enabled

**Production:**
- Uses production API keys
- Full monitoring enabled
- Debug mode disabled
- Secrets rotated regularly

### Access Control

| Environment | Who Can Deploy | Who Can Access |
|-------------|---------------|----------------|
| Development | All developers | Team only |
| Staging | All developers | Team + QA + Stakeholders |
| Production | Tech Lead only (manual approval) | Everyone |

---

## 📋 Deployment Checklist

### Before Any Deployment

- [ ] Code reviewed and approved
- [ ] Tests passing locally
- [ ] No console errors
- [ ] Breaking changes documented
- [ ] Database migrations planned (if needed)

### Before Staging

- [ ] Feature complete
- [ ] Self-tested in development
- [ ] No known bugs

### Before Production

- [ ] QA passed in staging (24+ hours)
- [ ] No critical Sentry errors
- [ ] Performance acceptable
- [ ] Stakeholder approval
- [ ] Rollback plan ready
- [ ] Team notified

---

## 🎓 Best Practices

### DO ✅

- Deploy to dev frequently (multiple times per day)
- Keep staging stable (deploy daily or less)
- Deploy to production carefully (weekly or bi-weekly)
- Test each environment thoroughly
- Monitor metrics after each deployment
- Document breaking changes
- Use semantic versioning for releases

### DON'T ❌

- Deploy directly to production
- Skip staging QA
- Deploy on Fridays (hard to fix over weekend)
- Deploy large changes without QA
- Ignore Sentry errors
- Forget to tag releases

---

## 📚 Additional Resources

- **Environment Variables:** [docs/VERCEL_ENVIRONMENT_VARIABLES.md](./VERCEL_ENVIRONMENT_VARIABLES.md)
- **Architecture:** [ARCHITECTURE_STACK_INTEGRATION.md](./architecture/ARCHITECTURE_STACK_INTEGRATION.md)
- **CI/CD Workflows:** [.github/workflows/](../.github/workflows/)
- **Vercel Docs:** https://vercel.com/docs

---

## 🔄 Quick Reference

```bash
# Development deployment
git checkout dev
git merge feature/my-feature
git push origin dev
→ Auto-deploys to dev.teacherflow-app.vercel.app

# Staging deployment
git checkout staging
git merge dev
git push origin staging
→ Auto-deploys to staging.teacherflow-app.vercel.app

# Production deployment
git checkout main
git merge staging --no-ff
git tag v1.2.3
git push origin main --tags
→ Auto-deploys to teacherflow-app.vercel.app
```

---

**Questions?** Check [ARCHITECTURE_STACK_INTEGRATION.md#troubleshooting](./architecture/ARCHITECTURE_STACK_INTEGRATION.md#troubleshooting)
