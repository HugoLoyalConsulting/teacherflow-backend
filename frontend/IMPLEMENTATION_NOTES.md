# 🏗️ TeacherFlow - Notas de Implementação & Arquitetura Backend

**Versão:** 2.0  
**Data:** 27 de fevereiro, 2026  
**Status:** Pronto para integração com FastAPI backend

---

## 📐 Decisões de Arquitetura Frontend

### 1. State Management: Zustand ✅

**Por quê:**
- Simples, sem boilerplate (vs Redux)
- Fast (sem middleware desnecessário)
- TypeScript first-class

**Estrutura:**
```
/src/store/
├── authStore.ts     # User + Auth state
├── appStore.ts      # All business logic (6 tables)
```

**Como Estender para Backend:**

```typescript
// Atual: Zustand direto em memória
const loginLocal = (email, password) => {
  const user = { id: '1', email, ... }
  localStorage.setItem('user', JSON.stringify(user))
}

// Futuro: Com backend API
const loginWithAPI = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  const { access_token, refresh_token, user } = await response.json()
  
  // Store JWT
  localStorage.setItem('access_token', access_token)
  localStorage.setItem('refresh_token', refresh_token)
  
  // Store user (sem password)
  set({ user, isAuthenticated: true })
}
```

**Importante:** Usar TanStack Query (@tanstack/react-query) para cache/sync:

```typescript
// Implementar:
const { data: students } = useQuery({
  queryKey: ['students'],
  queryFn: () => fetch('/api/students').then(r => r.json())
})

// Mutations para CRUD
const mutation = useMutation({
  mutationFn: (newStudent) => fetch('/api/students', { 
    method: 'POST', 
    body: JSON.stringify(newStudent) 
  }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
})
```

---

### 2. Fluxo de Autenticação Recomendado

```
Frontend Flow:
┌─────────────────────────────────────────────────┐
│ 1. User submits login form                      │
│    (email + password)                           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. POST /api/auth/login                         │
│    Request: { email, password }                 │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Backend validates credentials                   │
│ - Check user exists                             │
│ - Verify password (bcrypt)                      │
│ - Generate JWT tokens                           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Response:                                        │
│ {                                               │
│   "access_token": "eyJhbGc...",                │
│   "refresh_token": "eyJhbGc...",               │
│   "user": {                                     │
│     "id", "name", "email", "role",             │
│     "tenant_id", "onboarding_complete"         │
│   }                                             │
│ }                                               │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Frontend stores tokens                       │
│    - access_token: localStorage                 │
│    - refresh_token: sessionStorage (mais seguro)│
│    - user: Zustand + localStorage               │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. All subsequent requests include:             │
│    Headers: {                                   │
│      "Authorization": "Bearer {access_token}"   │
│    }                                            │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. If token expires:                            │
│    POST /api/auth/refresh                       │
│    Body: { refresh_token }                      │
│    Response: { access_token, refresh_token }   │
└─────────────────────────────────────────────────┘
```

**Código Frontend Recomendado:**

```typescript
// api/client.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: Adicionar token em todos requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: Refresh token se expirar
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
      localStorage.setItem('access_token', response.data.access_token)
      originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
      return apiClient(originalRequest)
    }
    return Promise.reject(error)
  }
)
```

---

## 🔧 Backend FastAPI - Setup Recomendado

### Estrutura de Projeto

```
teacherflow-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── dependencies.py         # JWT, DB session
│   ├── config.py              # Settings
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── location.py
│   │   ├── group.py
│   │   ├── schedule.py
│   │   ├── lesson.py
│   │   └── payment.py
│   ├── schemas/               # Pydantic models
│   │   ├── user.py
│   │   ├── student.py
│   │   └── ...
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── students.py
│   │   ├── locations.py
│   │   ├── groups.py
│   │   ├── schedules.py
│   │   ├── lessons.py
│   │   └── payments.py
│   ├── database.py            # SQLAlchemy setup
│   ├── auth.py               # JWT utils
│   └── crud/                 # Business logic
│       ├── students.py
│       ├── locations.py
│       └── ...
├── tests/
│   ├── test_auth.py
│   ├── test_students.py
│   └── ...
├── requirements.txt
├── .env.example
├── docker-compose.yml
└── create_tables.py
```

### requirements.txt Recomendado

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.4.2
pydantic-settings==2.0.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
cors==1.0.1
pytest==7.4.3
httpx==0.25.2
alembic==1.12.1
```

### main.py Minimal

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_tables
from app.routers import auth, students, locations, groups, schedules, lessons, payments

app = FastAPI(title="TeacherFlow API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(locations.router, prefix="/api/locations", tags=["locations"])
# ... etc

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Exemplo Endpoint: Login

```python
# routers/auth.py
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import User
from app.auth import create_access_token, verify_password
from app.dependencies import get_db

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id)}
    )
    refresh_token = create_access_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )
```

### Exemplo Model: Student

```python
# models/student.py
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class Student(Base):
    __tablename__ = "students"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    status = Column(Enum(StudentStatus), default="ACTIVE")
    billing_model = Column(Enum(BillingModel), nullable=False)
    hourly_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'email', name='uq_student_email_per_tenant'),
    )
```

---

## 🧪 Testing Strategy

### Frontend Tests (Jest + React Testing Library)

```typescript
// __tests__/pages/DashboardPage.test.tsx
import { render, screen } from '@testing-library/react'
import { DashboardPage } from '../src/pages/DashboardPage'
import { useAppStore } from '../src/store/appStore'

describe('DashboardPage', () => {
  it('should display revenue metrics', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/receita prevista/i)).toBeInTheDocument()
  })
  
  it('should show warning when switching mock mode with unsaved data', () => {
    // Setup store with data
    useAppStore.setState({ students: [mockStudent] })
    
    render(<DashboardPage />)
    const demoButton = screen.getByRole('button', { name: /demo/i })
    
    fireEvent.click(demoButton)
    expect(screen.getByText(/cuidado: dados serão perdidos/i)).toBeInTheDocument()
  })
})
```

### Backend Tests (pytest)

```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_student_cascade_delete():
    # Create student
    student = create_student(db, name="João")
    payment = create_payment(db, student_id=student.id)
    
    # Delete student
    delete_student(db, student.id)
    
    # Verify payment is also deleted
    assert db.query(Payment).filter(Payment.id == payment.id).first() is None
```

---

## 📊 Fluxo de Deploy Recomendado

```
Local Development:
  npm run dev        (Frontend: http://localhost:5173)
  python main.py     (Backend: http://localhost:8000)

Staging:
  Frontend: Vercel/Netlify
  Backend: Heroku or Railway
  Database: PostgreSQL managed service
  
Production:
  Frontend: CDN (Cloudflare/AWS CloudFront)
  Backend: Docker on K8s or managed service
  Database: RDS PostgreSQL with backups
  Monitoring: Sentry for errors, Datadog for metrics
```

### 🗄️ Neon Database Branches (✅ Configurados)

**✅ Production** (dados reais)
```
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-mute-glade-actrhygq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**✅ Staging** (cópia de production para testes)
```
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-royal-lab-ac3axf9o-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**🔄 Development** (schema only - para criar quando necessário)
```
Criar no Neon Console: "Schema only" a partir de Production
```

**Uso:**
- **Production:** Deploy final via Render com DATABASE_URL apontando para production branch
- **Staging:** Testes de integração antes de ir para produção
- **Development:** Desenvolvimento local com `uvicorn app.main:app --reload`

---

## 🚀 Status do Deployment (27 FEV 2026)

### ✅ Frontend (Vercel) - ONLINE
- **URL:** https://teacherflow-app.vercel.app
- **Painel:** https://vercel.com/hugoloyalconsulting-8127s-projects/teacherflow-app
- **Status:** ✅ Deployado e funcionando
- **Build:** Automático a cada push no main
- **Environment:** VITE_API_URL precisa ser configurado após backend online

### ⏳ Backend (Render) - PRONTO PARA DEPLOY
- **Repositório Local:** `teacherflow-backend/`
- **Git Status:** ✅ Inicializado e commitado
- **Próximo Passo:** Push para GitHub + Conectar no Render
- **Guia Completo:** Ver `teacherflow-backend/DEPLOY_GUIDE.md`

### ✅ Database (Neon PostgreSQL) - CONFIGURADO
- **Branches Criados:** Production ✅ | Staging ✅
- **Region:** sa-east-1 (São Paulo)
- **SSL:** Enabled
- **Pooling:** Enabled
- **Free Tier:** 3 GB storage, 512 MB RAM

---

## 🔐 Segurança: Checklist Pre-Launch

### Frontend
- [ ] Remove all `console.log` statements
- [ ] Implement Content Security Policy (CSP)
- [ ] Use SRI for external dependencies
- [ ] Implement logout clearing all tokens
- [ ] Add rate limiting to forms
- [ ] Sanitize all user input (DOMPurify)

### Backend
- [ ] All fields validated with Pydantic
- [ ] Use HTTPS only in production
- [ ] Implement rate limiting (FastAPI Limiter)
- [ ] Add request logging/audit trails
- [ ] Implement health checks
- [ ] Use secrets management (.env + environment variables)
- [ ] Database backups automated daily
- [ ] Error logging to Sentry

### Database
- [ ] Enable SSL connections
- [ ] Use connection pooling
- [ ] Regular backups (daily)
- [ ] Monitor slow queries
- [ ] Foreign key constraints enforced
- [ ] Cascade delete policies defined

---

## 📈 Performance Considerations

### Frontend Optimizations
- [ ] Lazy load pages with React.lazy()
- [ ] Implement virtual scrolling for large lists
- [ ] Cache API responses with TanStack Query
- [ ] Code splitting for bundle optimization
- [ ] Image optimization (next/image if migrating to Next.js)

### Backend Optimizations
- [ ] Add database indexes on frequently queried columns
- [ ] Implement pagination (limit/offset)
- [ ] Cache common queries (Redis)
- [ ] Use async endpoints
- [ ] Add query timeouts

### Example Index Strategy

```sql
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_due_date ON payments(due_date, status);
CREATE INDEX idx_lessons_date ON lesson_instances(date);
```

---

## 🚀 Migration Path: Zustand → Backend

### Phase 1: Add API layer (Week 1)
1. Create FastAPI backend skeleton
2. Implement auth endpoints
3. Hook up frontend to login endpoint
4. Keep other data in Zustand (local)

### Phase 2: Migrate CRUD (Week 2-3)
1. Implement all CRUD endpoints
2. Replace Zustand `addStudent` with API calls
3. Add TanStack Query for caching
4. Implement error handling + loading states

### Phase 3: Cleanup (Week 4)
1. Remove localStorage-based data persistence
2. Implement offline detection
3. Add service workers for offline support
4. Performance optimization

---

## 📚 Recursos Recomendados

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **SQLAlchemy ORM:** https://docs.sqlalchemy.org/
- **Pydantic Validation:** https://docs.pydantic.dev/
- **TanStack Query:** https://tanstack.com/query/latest
- **Testing Best Practices:** https://testingpyramid.com/

---

**Próxima Ação:** Clonar repo FastAPI starter e começar com models + auth endpoints.
