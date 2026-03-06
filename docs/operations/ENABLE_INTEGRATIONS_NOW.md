# 🚀 Quick Start: Enable All Integrations

**Time required:** 45 minutes  
**Difficulty:** Easy (copy-paste configuration)

---

## ⚡ Overview

This guide gets all integrations running **right now**. Follow these steps in order.

---

## 1️⃣ PostHog (Product Analytics) - 15 min

### A. Create Account
```
1. Go to: https://app.posthog.com/signup
2. Sign up (use GitHub for faster setup)
3. Create project: "TeacherFlow Production"
4. Copy API key (starts with phc_...)
```

### B. Configure Backend (Render)
```
1. Go to: https://dashboard.render.com
2. Select: teacherflow-backend
3. Click: Environment
4. Add variables:
   POSTHOG_ENABLED=true
   POSTHOG_API_KEY=phc_your_actual_key_here
   POSTHOG_HOST=https://app.posthog.com
5. Click: Save Changes (auto-deploys)
```

### C. Configure Frontend (Vercel)
```
1. Go to: https://vercel.com/dashboard
2. Select: teacherflow-frontend
3. Settings → Environment Variables
4. Add variables:
   VITE_POSTHOG_ENABLED=true
   VITE_POSTHOG_KEY=phc_your_actual_key_here
   VITE_POSTHOG_HOST=https://app.posthog.com
5. Save → Redeploy latest
```

### D. Verify
```
1. Open: https://teacherflow-app.vercel.app
2. Login to app
3. Open PostHog dashboard → Events → Live Events
4. You should see events coming in!
```

---

## 2️⃣ Sentry (Error Monitoring) - 15 min

### A. Create Account
```
1. Go to: https://sentry.io/signup/
2. Sign up
3. Create project:
   - Platform: Python
   - Name: teacherflow-backend
   - Copy DSN
4. Create another project:
   - Platform: React
   - Name: teacherflow-frontend
   - Copy DSN
```

### B. Configure Backend (Render)
```
1. Go to: https://dashboard.render.com
2. Select: teacherflow-backend
3. Environment → Add:
   SENTRY_ENABLED=true
   SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
4. Save (auto-deploys)
```

### C. Configure Frontend (Vercel)
```
1. Go to: https://vercel.com/dashboard
2. Select: teacherflow-frontend
3. Settings → Environment Variables → Add:
   VITE_SENTRY_ENABLED=true
   VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
4. Save → Redeploy
```

### D. Test
```
1. Open Sentry dashboard
2. Go to Issues
3. Should see test events (or wait for real errors)
```

---

## 3️⃣ Metabase (Dashboards) - 30 min

### Option A: Quick (Self-hosted on Render - Free)

```
1. Go to: https://dashboard.render.com
2. New → Web Service
3. Docker Image: metabase/metabase:latest
4. Name: teacherflow-metabase
5. Plan: Free
6. Environment variables:
   MB_DB_TYPE=postgres
   MB_DB_DBNAME=metabase
   MB_DB_PORT=5432
   MB_DB_USER=neondb_owner
   MB_DB_PASS=npg_jZGViq4QOTA7
   MB_DB_HOST=ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech
7. Create service (wait 5-10 min)
8. Open URL, complete setup
9. Add database:
   - Type: PostgreSQL
   - Host: ep-shy-paper-acltw1zj-pooler.sa-east-1.aws.neon.tech
   - Port: 5432
   - Database: neondb
   - User: neondb_owner
   - Password: npg_jZGViq4QOTA7
   - SSL: Required
```

### Option B: Cloud (Paid - $85/month)
```
1. Go to: https://www.metabase.com/pricing
2. Sign up for Starter
3. Follow setup wizard
4. Connect to Neon (same credentials as above)
```

---

## ✅ Verification Checklist

After completing all steps:

### PostHog
- [ ] Events appearing in Live Events
- [ ] Users being identified on login
- [ ] Page views tracked

### Sentry
- [ ] Backend project showing data
- [ ] Frontend project showing data
- [ ] Alerts configured

### Metabase
- [ ] Connected to Neon database
- [ ] Can run queries
- [ ] First dashboard created

---

## 🧪 End-to-End Test

**Test the full stack:**

```bash
# 1. Make a change
git checkout -b test/integrations
echo "test" >> README.md
git add .
git commit -m "test: verify integrations"
git push origin test/integrations

# 2. Merge to main (or push directly)
git checkout main
git merge test/integrations
git push origin main

# 3. Watch deployments
# GitHub → Actions (both workflows should pass)
# Render → teacherflow-backend (should deploy)
# Vercel → teacherflow-frontend (should deploy)

# 4. Use the app
# Open: https://teacherflow-app.vercel.app
# Login
# Create a student
# View dashboard

# 5. Check telemetry
# PostHog: Should see events
# Sentry: Should have no errors (good!)
# Metabase: Data should update
```

---

## 🎯 What Each Tool Does

**PostHog:**
- Tracks user behavior
- Answers: "How do users use the app?"
- Examples: signup rate, feature usage, user journeys

**Sentry:**
- Captures errors and exceptions
- Answers: "What's breaking in production?"
- Examples: API errors, frontend crashes, performance issues

**Metabase:**
- Business intelligence dashboards
- Answers: "How's the business doing?"
- Examples: revenue, student count, growth metrics

---

## 📊 First Dashboards to Create

### PostHog
1. **Insights → New Insight**
2. Create:
   - Daily Active Users
   - Signup conversion rate
   - Most used features

### Metabase
1. **New → Question**
2. Copy these queries:

**Active Students:**
```sql
SELECT COUNT(*) as active_students
FROM students
WHERE payment_status = 'active'
AND deleted_at IS NULL
```

**Monthly Revenue:**
```sql
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  SUM(amount) as revenue
FROM payments
WHERE status = 'PAID'
  AND payment_date >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC
```

**New Signups (Last 30 Days):**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date
```

---

## 🆘 Troubleshooting

**PostHog not working?**
- Check: API key is correct (starts with `phc_`)
- Check: Both services redeployed after adding variables
- Check: Browser console for errors

**Sentry not working?**
- Check: DSN is correct (has `@sentry.io` in it)
- Check: `SENTRY_ENABLED=true` is set
- Test: Manually trigger an error

**Metabase can't connect?**
- Check: Neon database is not paused (auto-pauses after inactivity)
- Check: SSL mode is "require"
- Test: Connection with psql command

---

## 📚 Detailed Guides

For more information, see:
- **Complete Setup:** [docs/STACK_INTEGRATION_SETUP.md](../STACK_INTEGRATION_SETUP.md)
- **Architecture:** [ARCHITECTURE_STACK_INTEGRATION.md](../architecture/ARCHITECTURE_STACK_INTEGRATION.md)
- **Metabase:** [METABASE_SETUP.md](./deployment/METABASE_SETUP.md)
- **All Docs:** [docs/DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)

---

## 🎉 You're Done!

Your observability stack is now fully operational:

- 📊 **Analytics** - Track user behavior
- 🐛 **Error Monitoring** - Catch bugs in production
- 📈 **Business Intelligence** - Monitor growth

**Next steps:**
1. Monitor dashboards daily
2. Set up alerts for critical errors
3. Create weekly reports
4. Iterate based on data

---

**Need help?** Check [ARCHITECTURE_STACK_INTEGRATION.md#troubleshooting](../architecture/ARCHITECTURE_STACK_INTEGRATION.md#troubleshooting)
