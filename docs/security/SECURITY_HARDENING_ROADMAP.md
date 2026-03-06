# 🔐 SECURITY HARDENING ROADMAP - TeacherFlow

**Status**: 🚧 In Progress  
**Started**: March 6, 2026  
**Priority**: P0 - Critical  
**Owner**: Security Team

---

## 📊 Executive Summary

### Vulnerability Assessment
- **P0 (Critical)**: 3 issues 🔴 - REQUIRES IMMEDIATE ACTION
- **P1 (High)**: 8 issues 🟠 - This Week
- **P2 (Medium)**: 8 issues 🟡 - This Month
- **P3 (Low)**: 4 issues 🟢 - Backlog

### Primary Risk
🚨 **Exposed secrets in git history** (database credentials, JWT secret key)

### Implementation Timeline
- **Phase 1 (Critical)**: 1-2 days
- **Phase 2 (High)**: 1 week
- **Phase 3 (Medium)**: 2-3 weeks
- **Total Duration**: ~6 weeks (with parallelization)

### Quick Win Strategy
**Day 1**: Phase 1 + Security Headers + Dependency Scanning = **80% risk reduction**

---

## 🎯 PHASE 1: CRITICAL REMEDIATION (P0)
**Timeline**: IMMEDIATE (1-2 days)  
**Status**: 🚧 In Progress

### ✅ CHECKLIST

#### 1.1 Rotate All Exposed Secrets
- [ ] **Generate new JWT SECRET_KEY**
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] **Rotate Neon database password**
  - Login to Neon dashboard
  - Reset password for database
  - Copy new connection string
- [ ] **Update GitHub Secrets**
  - Navigate to: Settings → Secrets and variables → Actions
  - Update: `SECRET_KEY`
  - Update: `DATABASE_URL`
  - Update: `RENDER_API_KEY` (if compromised)
- [ ] **Update Render environment variables**
  - Dashboard → Service → Environment
  - Update `SECRET_KEY`
  - Update `DATABASE_URL`
  - Trigger manual deploy
- [ ] **Update Vercel environment variables**
  - Dashboard → Project → Settings → Environment Variables
  - Update `VITE_API_URL` (if changed)
  - Redeploy affected environments

#### 1.2 Purge Secrets from Git History
- [ ] **Backup repository** (create full clone)
- [ ] **Install BFG Repo-Cleaner**
  ```bash
  # Mac/Linux
  brew install bfg
  
  # Windows (download jar)
  # https://rtyley.github.io/bfg-repo-cleaner/
  ```
- [ ] **Clone mirror and run BFG**
  ```bash
  git clone --mirror git@github.com:username/teacherflow.git
  cd teacherflow.git
  
  # Remove all .env files from history
  bfg --delete-files .env
  
  # Alternative: redact secret patterns
  echo "SECRET_KEY=.*" > secrets.txt
  echo "DATABASE_URL=.*" >> secrets.txt
  bfg --replace-text secrets.txt
  
  # Cleanup and force push
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  git push --force
  ```
- [ ] **Team notification**: Re-clone repository required

#### 1.3 Enforce Password Complexity
- [x] **Update User model** (already has password fields)
- [ ] **Add Pydantic validator** to `backend/app/schemas/auth.py`
- [ ] **Add frontend validation** to Register component
- [ ] **Update API error messages** for password requirements

#### 1.4 Remove Default Secret Keys
- [ ] **Remove fallback values** in `backend/app/core/config.py`
- [ ] **Add startup validation** in `backend/app/main.py`
- [ ] **Document required env vars** in `.env.example`

#### 1.5 Emergency Monitoring
- [ ] **Configure Sentry alerts** for auth failures
- [ ] **Set up email notifications** for suspicious activity
- [ ] **Create security dashboard** in monitoring tool

---

## 🛡️ PHASE 2: HIGH-PRIORITY HARDENING (P1)
**Timeline**: This Week (7 days)  
**Status**: ⏳ Not Started

### ✅ CHECKLIST

#### 2.1 Security Headers
- [ ] **Create `frontend/vercel.json`** with headers
- [ ] **Add FastAPI middleware** for backend headers
- [ ] **Test with securityheaders.com**
- [ ] **Verify CSP doesn't break functionality**

#### 2.2 Redis-Based Rate Limiting
- [ ] **Provision Redis** (Upstash/Render free tier)
- [ ] **Install dependencies**: `slowapi`, `redis`
- [ ] **Replace in-memory limiter** in `backend/app/security.py`
- [ ] **Configure limits**: 5 login/min, 100 API/min
- [ ] **Add rate limit headers** to responses
- [ ] **Test rate limiting** with load testing tool

#### 2.3 CSRF Protection
- [ ] **Install `fastapi-csrf-protect`**
- [ ] **Generate CSRF tokens** on page render
- [ ] **Validate tokens** on mutations (POST/PUT/DELETE)
- [ ] **Update frontend forms** with CSRF token header
- [ ] **Test CSRF protection** with manual attack

#### 2.4 Dependency Scanning in CI/CD
- [ ] **Add `pip-audit`** to backend workflow
- [ ] **Add `npm audit`** to frontend workflow
- [ ] **Configure failure thresholds** (high/critical only)
- [ ] **Set up Dependabot** for automated updates

#### 2.5 Secret Scanning Automation
- [ ] **Add TruffleHog** GitHub Action
- [ ] **Create `.trufflehog.yaml`** config
- [ ] **Test with committed test secret**
- [ ] **Configure PR blocking** on secret detection

#### 2.6 SAST (Static Analysis)
- [ ] **Add Semgrep** to CI/CD
- [ ] **Configure OWASP rules**
- [ ] **Set quality gates** (block on high severity)
- [ ] **Schedule weekly scans**

#### 2.7 Bcrypt Configuration
- [ ] **Set bcrypt rounds=13** explicitly
- [ ] **Add performance monitoring**
- [ ] **Consider async hashing** for scale

#### 2.8 CORS Hardening
- [ ] **Whitelist specific methods**
- [ ] **Whitelist specific headers**
- [ ] **Remove wildcard origins**
- [ ] **Configure per-environment**

---

## 🎨 PHASE 3: MEDIUM-PRIORITY IMPROVEMENTS (P2)
**Timeline**: This Month (2-3 weeks)  
**Status**: ⏳ Not Started

### ✅ CHECKLIST

#### 3.1 JWT Security Enhancement
- [ ] **Move tokens to httpOnly cookies**
- [ ] **Add sameSite=strict, secure=true**
- [ ] **Implement token refresh**
- [ ] **Add token revocation list** in Redis
- [ ] **Set appropriate expiration** (15min access, 7d refresh)

#### 3.2 Account Lockout
- [ ] **Lock after 5 failed attempts**
- [ ] **Auto-unlock after 30 minutes**
- [ ] **Add email unlock link**
- [ ] **Log lockout events** to AuditLog
- [ ] **Add admin override** capability

#### 3.3 Audit Logging to Database
- [ ] **Run Alembic migration** (audit_logs table exists)
- [ ] **Log critical events**: login, logout, password change
- [ ] **Add admin dashboard** for log viewing
- [ ] **Implement log rotation** (30-day retention)
- [ ] **Export to cold storage** (S3/GCS)

#### 3.4 LGPD Compliance
- [ ] **Create data retention policy**
- [ ] **Automated deletion** (2-year inactive accounts)
- [ ] **Add account deletion endpoint** `DELETE /api/users/me`
- [ ] **Add data export endpoint** `GET /api/users/me/export`
- [ ] **Privacy policy & terms** acceptance
- [ ] **Consent management UI**

#### 3.5 Request Size Limits
- [ ] **Create middleware** for size limiting
- [ ] **Set 10MB default limit**
- [ ] **Configure per-endpoint** if needed
- [ ] **Return 413 error** on violation

#### 3.6 Error Message Sanitization
- [ ] **Audit all HTTPException messages**
- [ ] **Remove technical details** from public errors
- [ ] **Log detailed errors** to Sentry only
- [ ] **Custom exception handler**

#### 3.7 Complete or Remove Partial Features
- [ ] **Decide on Google OAuth**: implement or remove
- [ ] **Decide on 2FA**: implement or remove UI
- [ ] **Clean up unused code**

#### 3.8 WAF (Web Application Firewall)
- [ ] **Enable Cloudflare** (free plan)
- [ ] **Configure OWASP rules**
- [ ] **Block malicious IPs**
- [ ] **Rate limit at edge**

---

## 🤖 PHASE 4: CI/CD SECURITY PIPELINE (Automated)
**Timeline**: 1 week (parallel with Phase 2-3)  
**Status**: ⏳ Not Started

### ✅ CHECKLIST

#### 4.1 Comprehensive Security Workflow
- [ ] **Create `.github/workflows/security-scan.yml`**
- [ ] **Run on**: PR, push to main, weekly schedule
- [ ] **Include**: TruffleHog, pip-audit, npm audit, Semgrep
- [ ] **Generate security report**
- [ ] **Slack/email notifications**

#### 4.2 Pre-commit Hooks
- [ ] **Install `pre-commit` framework**
- [ ] **Add detect-secrets hook**
- [ ] **Add black formatter**
- [ ] **Add eslint/prettier**
- [ ] **Share `.pre-commit-config.yaml`**

#### 4.3 Dependabot Configuration
- [ ] **Enable Dependabot** in GitHub
- [ ] **Create `.github/dependabot.yml`**
- [ ] **Configure auto-merge** for minor updates
- [ ] **Manual review** for major updates

---

## 📈 PHASE 5: MONITORING & INCIDENT RESPONSE
**Timeline**: 1 week (parallel)  
**Status**: ⏳ Not Started

### ✅ CHECKLIST

#### 5.1 Security Monitoring Dashboard
- [ ] **Configure Sentry alerts**
- [ ] **Create Grafana dashboard**
- [ ] **Set up PagerDuty/Opsgenie**
- [ ] **Define alert thresholds**

#### 5.2 Incident Response Plan
- [ ] **Document IR procedures**
- [ ] **Define roles**: Commander, Comms, Tech Lead
- [ ] **Create runbooks**:
  - Exposed secrets
  - DDoS attack
  - Database breach
  - Account takeover
- [ ] **Practice tabletop exercises** (quarterly)

#### 5.3 Security Documentation
- [ ] **Create `SECURITY.md`** for disclosure
- [ ] **Add `.well-known/security.txt`**
- [ ] **Document architecture** in `SECURITY_ARCHITECTURE.md`
- [ ] **Create team training materials**

---

## 🧪 VERIFICATION & TESTING

### Automated Tests
```bash
# Run security tests
pytest tests/security/

# Test rate limiting
python scripts/test_rate_limit.py

# Test CSRF protection
curl -X POST http://localhost:8000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' \
  # Should fail without CSRF token
```

### Manual Verification
- [ ] Test password complexity on registration
- [ ] Verify rate limiting: 6 rapid logins
- [ ] Check security headers: `curl -I https://teacherflow.vercel.app`
- [ ] Test CSRF: attempt POST without token
- [ ] Verify secrets not in git: `git log --all -- .env`
- [ ] Test account lockout: fail login 5 times
- [ ] Verify audit logs in database
- [ ] Test LGPD endpoints: export, deletion

### CI/CD Verification
- [ ] All security checks pass in GitHub Actions
- [ ] No critical/high vulnerabilities
- [ ] No secrets in last 100 commits
- [ ] Scheduled scans run successfully

---

## 🎯 IMPLEMENTATION PRIORITY

### Day 1 (Today) - 80% Risk Reduction
1. ✅ Rotate secrets (1.1)
2. ✅ Purge git history (1.2)
3. ✅ Password policy (1.3)
4. ✅ Security headers (2.1)
5. ✅ Dependency scanning (2.4)

### Week 1
- Complete Phase 1 (all P0 issues)
- Complete Phase 2 (all P1 issues)
- Start Phase 4 (CI/CD pipeline)

### Week 2-3
- Complete Phase 3 (all P2 issues)
- Complete Phase 4 (CI/CD automation)

### Week 4
- Complete Phase 5 (monitoring & IR)
- Security assessment & penetration testing
- Document lessons learned

---

## 📚 KEY DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Secret Rotation** | Quarterly + zero-downtime | NIST 800-57 recommendation |
| **Rate Limiting** | Redis-based | Multi-instance scalability |
| **CSRF Protection** | Double-submit cookie | Stateless, scales horizontally |
| **Password Policy** | 12+ chars + complexity | NIST 800-63B standard |
| **Audit Retention** | 1 year + cold storage | LGPD compliance requirement |
| **Vulnerability Blocking** | Critical only | Balance security vs. velocity |
| **JWT Storage** | httpOnly cookies | XSS protection |
| **2FA Method** | Email-based (immediate) | Quick implementation |

---

## 📖 RELATED DOCUMENTATION

- [ONBOARDING_SETUP.md](../operations/ONBOARDING_SETUP.md) - Onboarding wizard
- [GITHUB_SECRETS_SETUP.md](../deployment/GITHUB_SECRETS_SETUP.md) - CI/CD secrets
- [RENDER_BACKEND_SETUP.md](../RENDER_BACKEND_SETUP.md) - Deployment guide
- [.env.example](../../backend/.env.example) - Environment variables template

**To be created:**
- `SECURITY_ARCHITECTURE.md` - Complete security design
- `INCIDENT_RESPONSE.md` - IR procedures
- `LGPD_COMPLIANCE.md` - Data protection compliance
- `SECURITY.md` - Responsible disclosure policy

---

## 🚀 GETTING STARTED

### Phase 1 Implementation (NOW)

```bash
# 1. Generate new secrets
cd backend
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# 2. Rotate database password
# → Go to Neon dashboard

# 3. Update GitHub Secrets
# → Go to repo Settings → Secrets

# 4. Update Render env vars
# → Go to Render dashboard → Environment

# 5. Update Vercel env vars
# → Go to Vercel dashboard → Settings

# 6. Test application
curl http://localhost:8000/health
curl https://teacherflow.vercel.app/

# 7. Purge git history (CAREFUL!)
# → Follow BFG instructions in section 1.2
```

---

## 📊 PROGRESS TRACKING

**Overall Progress**: 0/56 tasks complete (0%)

- **Phase 1**: 0/15 ✅ (0%)
- **Phase 2**: 0/16 ✅ (0%)
- **Phase 3**: 0/16 ✅ (0%)
- **Phase 4**: 0/6 ✅ (0%)
- **Phase 5**: 0/9 ✅ (0%)

**Last Updated**: March 6, 2026  
**Next Review**: Daily until Phase 1 complete, then weekly

---

## 🆘 EMERGENCY CONTACTS

**Security Incidents**: security@teacherflow.app  
**DPO (LGPD)**: dpo@teacherflow.app  
**On-Call Engineer**: [PagerDuty rotation]

---

**Ready to implement? Start with Phase 1.1 (Rotate Secrets) immediately.**
