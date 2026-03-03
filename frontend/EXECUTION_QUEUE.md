# 🎯 TeacherFlow - Execution Queue (Fila de Execução)

**Status Geral:** 🔴 Frontend DONE | 🟡 Backend QUEUED | 🟡 Cloud QUEUED

---

## 📋 Todos os Steers (Requisitos) Coletados + Status

| # | Steer (Requisito) | Status | Prioridade | Detalhes |
|---|---|---|---|---|
| 1 | Frontend React + Vite funcional | ✅ DONE | P0 | 6 páginas, Zustand state, TailwindCSS, 16 testes QA |
| 2 | Backend seguro + escalável (RLS, JWT, rate limit) | 🟡 QUEUED | P1 | FastAPI, PostgreSQL Neon, Docker, Render/Fly |
| 4 | Mock data realista + toggleável | ✅ DONE | P1 | Empty/Demo profiles, effective-date pricing |
| 5 | QA completa (business scenarios) | ✅ DONE | P1 | 16 testes vitest, "a partir de tal data" validated |
| 6 | Responsivo mobile + Dark Mode | ✅ DONE | P1 | Breakpoints sm/md/lg, light/dark automático + toggle |
| 7 | **Prepare para Cloud escalável** | 🟡 IN PROGRESS | P0 | THIS REQUEST - env vars, API client, Docker ready |

---

## 🏗️ Stack Técnico Definido

### **Frontend (LIVE ✅)**
- **Framework:** React 18.2.0 + TypeScript 5.2.2
- **Build Tool:** Vite 5.4.21
- **Styling:** TailwindCSS 3.3.6 + dark mode
- **State:** Zustand 4.4.1
- **Testing:** Vitest 2.1.8
- **Server:** http://localhost:5175

### **Backend (SCAFFOLD NEEDED 🔲)**
- **Framework:** FastAPI (async)
- **Database:** PostgreSQL 15+ (Neon.tech free tier)
- **ORM:** SQLAlchemy 2.0 (async)
- **Auth:** JWT (Python-jose) + bcrypt
- **Rate Limiting:** Slowapi ou Redis-based
- **Containerization:** Docker + docker-compose
- **Hosting:** Render.com ou Fly.io (free tier)

### **Cloud Infrastructure (QUEUED 🔲)**
- **Frontend Hosting:** Cloudflare Pages or Vercel
- **Backend Hosting:** Render.com (PostgreSQL addon) or Fly.io
- **Database:** Neon.tech (PostgreSQL managed, free tier)
- **Cache/Sessions:** Upstash Redis (free tier)
- **Monitoring:** Sentry (error tracking)
- **CDN:** Cloudflare (free)
- **DNS:** Cloudflare (free)

### **Security (QUEUED 🔲)**
- **Authentication:** JWT (access + refresh tokens)
- **Password Hashing:** Argon2 via passlib
- **Database Security:** Row-Level Security (RLS) on PostgreSQL
- **API Security:** CORS, CSP headers, rate limiting
- **Secrets Management:** Environment variables (.env.local)
- **HTTPS:** Auto-configured by Render/Fly

---

## 🚀 Execution Queue (Fila Ordenada)

### **Phase 1: Frontend Cloud-Ready (TODAY - 1h)**
- [x] Responsiveness + Dark Mode
- [ ] Environment variables setup (.env.example, .env.local pattern)
- [ ] API client scaffold (Axios + TanStack Query ready)
- [ ] Error boundary component
- [ ] Loading + Error states in UI
- [ ] Configuration for production URLs
- **Deliverable:** Frontend ready for backend API calls

### **Phase 2: Backend Scaffold (TOMORROW - 2h)**
- [ ] FastAPI project initialization
- [ ] SQLAlchemy models mirroring frontend types
- [ ] Authentication routes (login, refresh token)
- [ ] CRUD endpoints for Student/Location/Group/Payment
- [ ] Docker + docker-compose
- [ ] Environment variables + secrets management
- [ ] CORS + rate limiting middleware
- **Deliverable:** Backend running locally + in Docker

### **Phase 3: Database Setup (DAY 3 - 1h)**
- [ ] PostgreSQL schema design + migrations (Alembic)
- [ ] Row-Level Security (RLS) policies
- [ ] Indexes for performance
- [ ] Seed data for development
- [ ] Neon.tech account + connection
- **Deliverable:** Database schema ready for migration

### **Phase 4: API Integration (DAY 4 - 2h)**
- [ ] Replace Zustand mock data with TanStack Query
- [ ] Update all CRUD operations to API calls
- [ ] JWT token refresh logic
- [ ] Error handling + retry logic
- [ ] Loading states in UI
- **Deliverable:** Frontend fully connected to backend

### **Phase 5: Cloud Deployment (DAY 5 - 2h)**
- [ ] Render.com backend deployment
- [ ] Cloudflare Pages frontend deployment
- [ ] Neon.tech database migration
- [ ] Environment variables on cloud platforms
- [ ] Monitoring (Sentry) setup
- [ ] Health checks + auto-scaling config
- **Deliverable:** Full-stack app live on cloud

### **Phase 6: Security Hardening (DAY 6 - 1h)**
- [ ] JWT token expiration + rotation
- [ ] Rate limit testing
- [ ] SQL injection prevention (SQLAlchemy parameterized)
- [ ] CORS whitelist validation
- [ ] CSP headers configuration
- [ ] HTTPS enforcement
- **Deliverable:** Production-grade security

### **Phase 7: Monitoring + Docs (DAY 7 - 1h)**
- [ ] Sentry integration for error tracking
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment runbook
- [ ] Scaling guide
- [ ] Cost analysis
- **Deliverable:** Observable + documented system

---

## 📊 Current State Inventory

### **What's Ready (✅)**
| Component | Files | Status | Notes |
|---|---|---|---|
| Frontend Build | src/ (6 pages) | ✅ Production-ready | Zero TypeScript errors, 254kB JS gzipped |
| Unit Tests | tests/businessRules.test.ts | ✅ 16/16 passing | Business rules validated |
| Mock Data | src/data/mockData.ts | ✅ Realistic | Empty + demo profiles toggleable |
| Styling | src/index.css | ✅ Dark mode working | Light/dark + auto-detect + toggle |
| State Mgmt | src/store/appStore.ts | ✅ Zustand | Ready for API integration |
| UI Components | src/components/ | ✅ Responsive | Works on mobile/tablet/desktop |
| Login Page | src/pages/LoginPage.tsx | ✅ Ready | Placeholder auth, ready for JWT |

### **What Needs Building (🔲)**
| Layer | Scope | Effort | Est. Time |
|---|---|---|---|
| Backend API | FastAPI + SQLAlchemy models, 50+ endpoints | Medium | 2-3h |
| Database | PostgreSQL schema + RLS + migrations | Medium | 1-2h |
| Integration | TanStack Query + API client refactor | Light | 2h |
| Deployment | Docker + Render/Fly + CI/CD | Light | 2-3h |
| Security | JWT + rate limit + CORS + CSP | Medium | 2h |

---

## 🎯 Phase 1: Frontend Cloud-Ready (TODAY)

### Task 1.1: Environment Variables Setup
**What:** Create `.env.example` and setup pattern for API configuration
**File:** `.env.example` + `src/config/env.ts`
**Deliverable:**
```
VITE_API_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

### Task 1.2: API Client Infrastructure
**What:** Create Axios instance + TanStack Query ready hooks
**Files:** 
- `src/services/api.ts` - Axios client
- `src/hooks/useApi.ts` - TanStack Query wrapper
**Features:**
- Automatic JWT token injection
- Retry logic (exponential backoff)
- Error handling + logging
- Request/response interceptors

### Task 1.3: Error Boundary + Loading States
**What:** Global error handling + fallback UI
**Files:**
- `src/components/ErrorBoundary.tsx`
- Loading spinners in UI components
**Features:**
- Catches errors in React tree
- Shows user-friendly messages
- Logs to Sentry (when available)

### Task 1.4: Production Configuration
**What:** Build-time environment switching
**Deliverable:**
- Development: Mock data (Zustand)
- Production: Real API calls (TanStack Query)

---

## 🔧 Phase 2: Backend Scaffold Structure

```
teacherflow-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Environment config
│   ├── database.py             # SQLAlchemy setup
│   ├── security.py             # JWT + auth
│   ├── models/
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── location.py
│   │   ├── group.py
│   │   ├── schedule.py
│   │   ├── lesson.py
│   │   └── payment.py
│   ├── schemas/                # Pydantic models (request/response)
│   ├── routes/
│   │   ├── auth.py
│   │   ├── students.py
│   │   ├── locations.py
│   │   ├── groups.py
│   │   ├── schedules.py
│   │   ├── lessons.py
│   │   └── payments.py
│   └── middleware/
│       ├── cors.py
│       ├── ratelimit.py
│       └── errors.py
├── migrations/                 # Alembic
├── tests/
├── Dockerfile
├── docker-compose.yml
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

## 📋 Success Criteria

### **Frontend Phase 1 (TODAY)**
- [ ] `.env` configuration working
- [ ] API client skeleton with interceptors
- [ ] Error boundary catching errors
- [ ] Loading states in dashboard
- [ ] All tests still passing
- [ ] Build succeeds with new setup

### **Backend Phase 2 (READY TO START)**
- [ ] FastAPI server starts locally
- [ ] Health check endpoint: `GET /health`
- [ ] Docker image builds + runs
- [ ] Database migrations work
- [ ] JWT tokens generate
- [ ] CORS enabled for frontend origin

### **Full Integration**
- [ ] Frontend can call backend API
- [ ] Auth flow: login → JWT token → API calls
- [ ] All CRUD operations work end-to-end
- [ ] Error responses handled gracefully
- [ ] Rate limiting working
- [ ] Logging centralized

---

## 🌍 Cloud Deployment Flow

```
┌─────────────────────────────────────────────┐
│   GitHub Repo (Source)                      │
│   ├─ frontend/ (Cloudflare Pages)          │
│   └─ backend/  (Render or Fly)             │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│   CI/CD Pipeline (GitHub Actions)           │
│   ├─ Tests (vitest + pytest)               │
│   ├─ Build (Vite + FastAPI)                │
│   └─ Deploy (auto push to cloud)           │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│   Cloud Platforms                           │
│   ├─ Frontend: https://teacherflow.pages   │
│   ├─ Backend:  https://teacherflow-api.com │
│   ├─ Database: Neon PostgreSQL             │
│   └─ CDN:      Cloudflare                  │
└─────────────────────────────────────────────┘
```

---

## 💰 Cost Analysis (Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Cloudflare Pages | Unlimited | Frontend hosting |
| Render.com | 750 hours/month | Backend hosting (1 free dyno) |
| Neon PostgreSQL | 5GB database | Managed PostgreSQL |
| Upstash Redis | 10K commands/day | Rate limiting + sessions |
| Sentry | 5K events/month | Error monitoring |
| GitHub | Unlimited | Code + CI/CD |
| **Total Cost:** | **$0/month** | All free tier 🎉 |

---

## 📅 Next Steps (Starting NOW)

1. **✅ Phase 1 (30 min):** Setup env vars + API client skeleton
2. **⏭️ Phase 2 (2-3h):** FastAPI backend scaffold
3. **⏭️ Phase 3 (1-2h):** Database schema + migrations
4. **⏭️ Phase 4 (2h):** Connect frontend to backend API
5. **⏭️ Phase 5 (2-3h):** Deploy to cloud
6. **⏭️ Phase 6 (1-2h):** Security + rate limiting
7. **⏭️ Phase 7 (1h):** Monitoring + documentation

---

## ✨ Key Principles

- **Cloud-First:** All setup assumes cloud deployment from start
- **Secure by Default:** JWT, RLS, rate limiting from day 1
- **Scalable:** Stateless backend, managed database
- **Observable:** Logs, metrics, error tracking
- **Cost-Effective:** Free tier with zero vendor lock-in
- **Automated:** Docker, GitHub Actions, blue-green deployments

---

**Generated:** 2026-02-27  
**Status:** Queued & Ready to Execute  
**Lead Time to Production:** 7 days (part-time effort)
