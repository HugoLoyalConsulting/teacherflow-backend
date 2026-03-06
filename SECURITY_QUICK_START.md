# 🚀 QUICK START: Security Implementation

**Objective**: Implement Phase 1 critical security fixes (80% risk reduction in 1 day)

---

## ⚡ DAY 1 ACTIONS (IMMEDIATE)

### Step 1: Rotate All Secrets (30 minutes)

#### 1.1 Generate New JWT Secret
```bash
cd backend
python -c "import secrets; print('New SECRET_KEY:', secrets.token_urlsafe(32))"
```
**Copy the output** - you'll need it in multiple places.

#### 1.2 Rotate Neon Database Password
1. Login to [Neon Console](https://console.neon.tech)
2. Navigate to your project
3. Go to Settings → Reset Password
4. Copy the new connection string
5. **Format**: `postgresql://user:NEW_PASSWORD@ep-xxx.region.aws.neon.tech/neondb`

#### 1.3 Update GitHub Secrets (REQUIRED)
1. Go to: `https://github.com/YOUR_USERNAME/teacherflow/settings/secrets/actions`
2. Update these secrets:
   - `SECRET_KEY` → Paste new JWT secret from Step 1.1
   - `DATABASE_URL` → Paste new connection string from Step 1.2
   - `GMAIL_APP_PASSWORD` → Keep existing (unless compromised)
   - `RENDER_API_KEY` → Keep existing
   - `RENDER_SERVICE_ID` → Keep existing

#### 1.4 Update Render Environment Variables
1. Go to: [Render Dashboard](https://dashboard.render.com)
2. Select your `teacherflow-backend` service
3. Go to Environment tab
4. Update:
   - `SECRET_KEY` → New JWT secret
   - `DATABASE_URL` → New Neon connection string
   - `SMTP_PASSWORD` → Gmail app password
5. Click **Save** → Service will auto-restart

#### 1.5 Update Vercel Environment Variables
1. Go to: [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `teacherflow` project
3. Go to Settings → Environment Variables
4. Verify `VITE_API_URL` points to Render backend
5. No changes needed unless API URL changed

---

### Step 2: Purge Secrets from Git History (1 hour)

⚠️ **WARNING**: This rewrites git history. Backup first!

```bash
# 1. Create backup
cd ~/backups
git clone --mirror https://github.com/YOUR_USERNAME/teacherflow.git teacherflow-backup

# 2. Install BFG Repo-Cleaner
# Mac/Linux:
brew install bfg

# Windows (download jar):
# https://rtyley.github.io/bfg-repo-cleaner/

# 3. Clone fresh mirror
cd ~/work
git clone --mirror git@github.com:YOUR_USERNAME/teacherflow.git

# 4. Remove .env files from history
cd teacherflow.git
bfg --delete-files .env
bfg --delete-files '.env.*' --delete-files '*.env'

# 5. Alternative: Redact secret patterns
echo "SECRET_KEY=.*" > ~/secrets-to-remove.txt
echo "DATABASE_URL=.*" >> ~/secrets-to-remove.txt
echo "postgresql://.*" >> ~/secrets-to-remove.txt
bfg --replace-text ~/secrets-to-remove.txt

# 6. Cleanup and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# 7. Notify team
echo "⚠️ ALL TEAM MEMBERS: Delete local repo and re-clone!"
```

#### Team Notification Template
```
🚨 SECURITY UPDATE: Git History Cleaned

We've removed exposed secrets from git history.

ACTION REQUIRED:
1. Delete your local teacherflow folder
2. Re-clone: git clone https://github.com/YOUR_USERNAME/teacherflow.git
3. DO NOT push from old clones

Timeline: Complete by EOD today
Questions: Slack #security channel
```

---

### Step 3: Test New Configuration (15 minutes)

```bash
# 1. Pull latest code
cd teacherflow
git pull origin main

# 2. Update backend .env (local dev)
cd backend
cp .env.example .env
# Edit .env and add your NEW secrets:
# SECRET_KEY=<new-jwt-secret>
# DATABASE_URL=<new-neon-url>

# 3. Test backend locally
python -m uvicorn app.main:app --reload
# Should start without errors

# 4. Test API endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 5. Test authentication
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "TestPassword123!@#"
  }'
# Should succeed with password complexity validation

# 6. Test frontend locally
cd ../frontend
npm install
npm run dev
# Should connect to backend successfully
```

---

### Step 4: Verify Deployments (10 minutes)

#### Backend (Render)
```bash
# Check health endpoint
curl https://your-backend.onrender.com/health

# Check Render logs
# Go to: https://dashboard.render.com → Your Service → Logs
# Verify: "Application startup complete"
# Verify: No "SECRET_KEY" warnings
```

#### Frontend (Vercel)
```bash
# Check deployment
curl -I https://your-app.vercel.app

# Verify security headers present:
# Look for:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security: max-age=31536000
# - Content-Security-Policy: default-src 'self'...

# Or use online tool:
# https://securityheaders.com/?q=your-app.vercel.app
```

---

### Step 5: Test Security Features (20 minutes)

#### 5.1 Test Password Complexity
```bash
# Should FAIL (too short)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","full_name":"Test","password":"Short1!"}'

# Should FAIL (no uppercase)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","full_name":"Test","password":"nocapitals123!"}'

# Should SUCCESS
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@example.com","full_name":"Test","password":"StrongPass123!@#"}'
```

#### 5.2 Test Security Headers
```bash
# Check headers
curl -I https://your-app.vercel.app

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'; ...
```

#### 5.3 Test Secret Scanning
```bash
# Trigger security scan workflow
git commit --allow-empty -m "test: trigger security scan"
git push origin main

# Check workflow: https://github.com/YOUR_USERNAME/teacherflow/actions
# Should see "Security Scan" workflow running
# Should complete with ✅ (no secrets found)
```

---

## ✅ SUCCESS CHECKLIST

- [ ] New JWT secret generated
- [ ] Neon database password rotated
- [ ] GitHub Secrets updated (5 secrets)
- [ ] Render environment variables updated
- [ ] Vercel environment variables verified
- [ ] Git history cleaned (BFG ran successfully)
- [ ] Team notified to re-clone
- [ ] Backend deploys successfully to Render
- [ ] Frontend deploys successfully to Vercel
- [ ] Health endpoint returns 200 OK
- [ ] Password complexity validation works
- [ ] Security headers present (verified)
- [ ] No secrets detected in git history
- [ ] Security scan workflow passes

---

## 🎯 RISK REDUCTION ACHIEVED

After completing Day 1:

| Risk | Before | After | Status |
|------|--------|-------|--------|
| Exposed Secrets | 🔴 P0 Critical | ✅ Mitigated | Rotated + purged |
| Weak Passwords | 🔴 P0 Critical | ✅ Mitigated | 12+ chars enforced |
| Default Keys | 🔴 P0 Critical | ✅ Mitigated | Required in env |
| Missing Headers | 🟠 P1 High | ✅ Mitigated | CSP + HSTS added |
| No Dep Scanning | 🟠 P1 High | ✅ Mitigated | pip-audit in CI |

**Overall Risk Reduction**: ~80% of critical vulnerabilities addressed 🎉

---

## 📅 NEXT STEPS (Week 1)

### Tomorrow (Day 2)
- [ ] Implement Redis-based rate limiting
- [ ] Add CSRF protection
- [ ] Complete SAST setup (Semgrep)

### This Week (Days 3-5)
- [ ] Implement JWT in httpOnly cookies
- [ ] Add account lockout (5 failed attempts)
- [ ] Set up audit logging to database
- [ ] Configure pre-commit hooks

See [SECURITY_HARDENING_ROADMAP.md](./SECURITY_HARDENING_ROADMAP.md) for complete plan.

---

## 🆘 TROUBLESHOOTING

### "Application won't start - SECRET_KEY required"
✅ **Solution**: Add SECRET_KEY to .env file (local) or Render environment (production)

### "Database connection failed"
✅ **Solution**: Verify DATABASE_URL is correct in environment variables

### "Render deployment stuck"
✅ **Solution**: Check Render logs, may need to manually trigger redeploy

### "Security scan failing - secrets detected"
✅ **Solution**: Verify git history was cleaned, run BFG again if needed

### "Team member can't push after git history rewrite"
✅ **Solution**: Delete local repo and re-clone from GitHub

---

## 📞 SUPPORT

**Questions?** Open an issue or contact:
- Security Team: security@teacherflow.app
- DevOps: devops@teacherflow.app
- Slack: #security-hardening

---

**Ready? Start with Step 1: Rotate Secrets** 🚀
