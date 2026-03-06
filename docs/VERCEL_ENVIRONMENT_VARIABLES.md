# Vercel Environment Variables - Complete Reference

**Last Updated:** March 6, 2026  
**Project:** TeacherFlow Frontend

---

## 🎯 Overview

This document lists ALL environment variables required for the TeacherFlow frontend deployment on Vercel across all environments (Development, Staging, Production).

---

## 📋 Complete Variable List

| Variable Name | Purpose | Required? | Example Value | Environment |
|---------------|---------|-----------|---------------|-------------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes | `https://teacherflow-backend.onrender.com` | All |
| `VITE_API_TIMEOUT` | API request timeout (ms) | ⚠️ Recommended | `30000` | All |
| `VITE_ENVIRONMENT` | Environment identifier | ✅ Yes | `production`, `staging`, `development` | All |
| **Authentication** |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ Yes | `123456789-abc.apps.googleusercontent.com` | All |
| `VITE_JWT_STORAGE_KEY` | LocalStorage key for JWT | ⚠️ Recommended | `teacherflow_token` | All |
| `VITE_USER_STORAGE_KEY` | LocalStorage key for user data | ⚠️ Recommended | `teacherflow_user` | All |
| **Analytics (PostHog)** |
| `VITE_POSTHOG_ENABLED` | Enable PostHog tracking | ⚠️ Recommended | `true` (prod), `false` (dev) | All |
| `VITE_POSTHOG_KEY` | PostHog project API key | ✅ Yes (if enabled) | `phc_ABC123XYZ789...` | All |
| `VITE_POSTHOG_HOST` | PostHog instance URL | ⚠️ Recommended | `https://app.posthog.com` | All |
| **Error Monitoring (Sentry)** |
| `VITE_SENTRY_ENABLED` | Enable Sentry error tracking | ⚠️ Recommended | `true` (prod), `false` (dev) | All |
| `VITE_SENTRY_DSN` | Sentry project DSN | ✅ Yes (if enabled) | `https://abc@o123.ingest.sentry.io/456` | All |
| `VITE_SENTRY_ENVIRONMENT` | Sentry environment tag | ⚠️ Recommended | `production`, `staging`, `development` | All |
| **Feature Flags** |
| `VITE_DEMO_ENABLED` | Enable demo account | ⚠️ Recommended | `true` | All |
| `VITE_EMAIL_VERIFICATION_ENABLED` | Enable email verification | ⚠️ Recommended | `true` | All |
| `VITE_SUBSCRIPTIONS_ENABLED` | Enable subscription features | ❌ Optional | `false` (not ready yet) | All |

---

## 📝 Environment-Specific Values

### Production (main branch → teacherflow-app.vercel.app)

```env
# API
VITE_API_URL=https://teacherflow-backend.onrender.com
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=production

# Authentication
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_JWT_STORAGE_KEY=teacherflow_token
VITE_USER_STORAGE_KEY=teacherflow_user

# Analytics (PostHog)
VITE_POSTHOG_ENABLED=true
VITE_POSTHOG_KEY=phc_your_production_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com

# Error Monitoring (Sentry)
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your_production_sentry_dsn@sentry.io/project
VITE_SENTRY_ENVIRONMENT=production

# Features
VITE_DEMO_ENABLED=true
VITE_EMAIL_VERIFICATION_ENABLED=true
VITE_SUBSCRIPTIONS_ENABLED=false
```

### Staging (staging branch → staging.teacherflow-app.vercel.app)

```env
# API
VITE_API_URL=https://teacherflow-backend-staging.onrender.com
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=staging

# Authentication
VITE_GOOGLE_CLIENT_ID=your_staging_google_client_id
VITE_JWT_STORAGE_KEY=teacherflow_token_staging
VITE_USER_STORAGE_KEY=teacherflow_user_staging

# Analytics (PostHog)
VITE_POSTHOG_ENABLED=true
VITE_POSTHOG_KEY=phc_your_staging_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com

# Error Monitoring (Sentry)
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your_staging_sentry_dsn@sentry.io/project
VITE_SENTRY_ENVIRONMENT=staging

# Features
VITE_DEMO_ENABLED=true
VITE_EMAIL_VERIFICATION_ENABLED=true
VITE_SUBSCRIPTIONS_ENABLED=false
```

### Development (dev branch → dev.teacherflow-app.vercel.app)

```env
# API
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=development

# Authentication
VITE_GOOGLE_CLIENT_ID=your_dev_google_client_id
VITE_JWT_STORAGE_KEY=teacherflow_token_dev
VITE_USER_STORAGE_KEY=teacherflow_user_dev

# Analytics (PostHog)
VITE_POSTHOG_ENABLED=false
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com

# Error Monitoring (Sentry)
VITE_SENTRY_ENABLED=false
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development

# Features
VITE_DEMO_ENABLED=true
VITE_EMAIL_VERIFICATION_ENABLED=true
VITE_SUBSCRIPTIONS_ENABLED=true
```

---

## 🔧 How to Configure in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select project: `teacherflow-app`
3. Navigate to **Settings** → **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Enter **Name** (e.g., `VITE_API_URL`)
   - Enter **Value**
   - Select **Environments**: Production, Preview, Development
   - Click **Save**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd frontend
vercel link

# Add variables
vercel env add VITE_API_URL production
# Paste value when prompted

# Or import from .env file
vercel env pull .env.production
```

### Method 3: vercel.json (Not Recommended for Secrets)

```json
{
  "env": {
    "VITE_ENVIRONMENT": "production"
  }
}
```

⚠️ **Warning:** Do NOT put secrets in `vercel.json` as it's committed to Git.

---

## 🌍 Environment-Specific Setup

### Per-Branch Configuration

Vercel allows different variables per Git branch:

**Production (main):**
- Auto-deploys to: `teacherflow-app.vercel.app`
- Uses: Production variables

**Preview (staging):**
- Auto-deploys to: `staging-<hash>.vercel.app`
- Custom domain: `staging.teacherflow-app.vercel.app`
- Uses: Staging variables

**Development (dev):**
- Auto-deploys to: `dev-<hash>.vercel.app`
- Custom domain: `dev.teacherflow-app.vercel.app`
- Uses: Development variables

---

## ✅ Verification Checklist

After setting variables:

- [ ] All required variables added
- [ ] Secrets properly masked in dashboard
- [ ] Different values per environment configured
- [ ] Latest deployment successful
- [ ] App loads without console errors
- [ ] API calls reaching correct backend
- [ ] Google OAuth working
- [ ] PostHog events being captured (if enabled)
- [ ] Sentry capturing errors (if enabled)

---

## 🔐 Security Best Practices

### DO ✅
- Store all secrets in Vercel dashboard
- Use different Google Client IDs per environment
- Use different API keys for PostHog/Sentry per environment
- Rotate secrets regularly
- Use environment-specific storage keys

### DON'T ❌
- Commit `.env` files with production secrets to Git
- Share production secrets in Slack/email
- Use same Google OAuth credentials across environments
- Hardcode API URLs in source code
- Expose variables without `VITE_` prefix (they won't be included in build)

---

## 🐛 Troubleshooting

### Issue: Variables not showing in app

**Cause:** Vite only includes variables prefixed with `VITE_`

**Fix:** Ensure all frontend variables start with `VITE_`

### Issue: Changes not reflecting after update

**Cause:** Need to redeploy after changing environment variables

**Fix:**
1. Go to Vercel dashboard
2. **Deployments** tab
3. Click **"Redeploy"** on latest deployment

### Issue: Different values in production vs preview

**Cause:** Variables might be set for wrong environment

**Fix:**
1. Check variable settings in Vercel dashboard
2. Ensure correct environment checkboxes selected
3. Redeploy

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **Vite Docs:** https://vitejs.dev/guide/env-and-mode.html
- **Security Guide:** [backend/AUTH_SECURITY.md](../backend/AUTH_SECURITY.md)
- **Stack Integration:** [ARCHITECTURE_STACK_INTEGRATION.md](../ARCHITECTURE_STACK_INTEGRATION.md)

---

## 🔄 Update History

| Date | Change | Updated By |
|------|--------|------------|
| 2026-03-06 | Initial comprehensive documentation | Architecture Review |
| | Added multi-environment support | |
| | Added new feature flags | |

---

**Next Steps:**
1. Configure all variables in Vercel dashboard
2. Test each environment separately
3. Enable monitoring (PostHog + Sentry)
4. Set up custom domains for staging/dev
