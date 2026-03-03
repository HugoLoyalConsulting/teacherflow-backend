# 🔍 TeacherFlow - QA & Segurança Review

**Data:** 27 de fevereiro, 2026  
**Status:** ✅ Aplicação funcional | ⚠️ Pronta para produção com ajustes

---

## 📊 1. ANÁLISE DE FLUXOS ENTRE TELAS

### 1.1 Fluxo de Autenticação

```
Login → Onboarding → Dashboard

1. LoginPage
   - Email/Senha: Qualquer combinação aceita (MOCK)
   - LocalStorage: User salvo em JSON plano
   - Redirect: `/onboarding` se onboardingComplete === false
   
2. OnboardingPage (3 steps)
   - Step 1: Welcome → mostra features
   - Step 2: Select-types → escolhe tipos de aula
   - Step 3: Name → insere nome completo
   - Ação: setUser() → localStorage + Zustand
   - Redirect: `/` (Dashboard)
   
3. DashboardPage
   - Acesso: ✅ Protegido por isAuthenticated
   - Dados: Lê 6 tabelas do appStore (students, locations, groups, payments, lessons, schedules)
   - Features: Mock data mode toggle (empty/demo/populated)
```

**Problemas Identificados:**
- ⚠️ Login aceita qualquer email/senha (OK para demo, perigoso em produção)
- ⚠️ Credentials armazenadas em localStorage sem encriptação
- ⚠️ Sem refresh token ou session management
- ⚠️ Sem logout de segurança (apenas limpa localStorage)

---

### 1.2 Fluxo de Cadastros (CRUD)

```
Locations → Groups → Students → Schedules → Lessons → Payments

┌─────────────────────────────────────────┐
│ LocationsPage (Cria Locais)            │
│ - Remove: location                      │
│ - Impacto: ❌ Groups órfãos             │
└─────────────────────────────────────────┘
                    ↓ (locationId FK)
┌─────────────────────────────────────────┐
│ GroupsPage (Cria Turmas)               │
│ - Precisa: locationId válido            │
│ - Remove: group                         │
│ - Impacto: ❌ Lessons órfãs              │
└─────────────────────────────────────────┘
                    ↓ (não vinculado)
┌─────────────────────────────────────────┐
│ StudentsPage (Cria Alunos)             │
│ - Remove: student                       │
│ - Impacto: ❌ Payments órfãs             │
│ - Impacto: ❌ WeeklySchedules órfãs      │
└─────────────────────────────────────────┘
         ↓ (studentId FK)              
┌─────────────────────────────────────────┐
│ CalendarPage / SchedulesManagement      │
│ - Create: WeeklySchedule (studentId)    │
│ - Create: LessonInstances (scheduleId)  │
│ - Remove: Schedule → Orphans lessons    │
└─────────────────────────────────────────┘
         ↓ (studentId FK)              
┌─────────────────────────────────────────┐
│ PaymentsPage (Recebimentos)            │
│ - Create: Payment (studentId)           │
│ - Remove: Payment (OK - sem deps)       │
└─────────────────────────────────────────┘
```

**Problemas Críticos:**

| Ação | Problema | Status | Severidade |
|------|----------|--------|-----------|
| Delete Student | Payments órfãos (studentId ainda referenciado) | ❌ NÃO TRATADO | 🔴 CRÍTICO |
| Delete Student | Schedules órfãos (studentId ainda referenciado) | ❌ NÃO TRATADO | 🔴 CRÍTICO |
| Delete Location | Groups órfãos (locationId inválido) | ❌ NÃO TRATADO | 🔴 CRÍTICO |
| Delete Group | Lessons/Schedules órfãs | ❌ NÃO TRATADO | 🔴 CRÍTICO |
| Delete Schedule | Lessons órfãos (scheduleId inválido) | ❌ NÃO TRATADO | 🔴 CRÍTICO |

---

### 1.3 Fluxo de Dados no Dashboard

```typescript
DashboardPage
  ├─ Lê: lessons, schedules (calcula receita)
  ├─ Lê: payments (calcula pendências)
  ├─ Lê: locations, students, groups (onboarding steps)
  └─ Estado: mockMode (empty/demo/populated)
  
❌ PROBLEMA: Não há cache/synchronization checks
- Se Student é deletado, seus Payments ainda referem
- Se Schedule é deletado, seus Lessons ainda referem
```

---

## 🔐 2. ANÁLISE DE SEGURANÇA

### 2.1 Autenticação & Autorização

| Item | Current | Status | Risco |
|------|---------|--------|-------|
| Password Hash | Nenhum (accept all) | ❌ Não implementado | 🔴 CRÍTICO |
| JWT Token | Não usa | ❌ Ausente | 🔴 CRÍTICO |
| Refresh Token | Não usa | ❌ Ausente | 🔴 CRÍTICO |
| Session Timeout | Não existe | ❌ Ausente | 🟡 ALTO |
| HTTPS | Não requer | ❌ Dev-only | 🔴 CRÍTICO |
| CORS | Não restringido | ❌ Qualquer origem | 🟡 ALTO |

### 2.2 Armazenamento de Dados Sensíveis

```typescript
// ❌ PROBLEMA: AuthStore
const savedUser = localStorage.getItem('user')
const initialUser = savedUser ? JSON.parse(savedUser) : null

// Stored: {"id":"1","name":"...","email":"...","role":"OWNER","tenantId":"tenant-1"}
// Sem encriptação, acessível por:
// - DevTools (localStorage)
// - XSS attacks
// - Browser history
```

**Risco:** XSS attack pode ler todas as credenciais

### 2.3 Autorização por Tenant

```typescript
// ⚠️ PROBLEMA: Tenantid está hardcoded
const mockUser: User = {
  tenantId: 'tenant-1',  // ← Sempre 'tenant-1'
}

// Risco: Sem validação de tenantId
// Se um usuário conseguir modificar localStorage:
// - Poderia mudar para outro tenantId fictício
// - Teria acesso a dados de outro tenant
```

### 2.4 Validação de Entrada

| Campo | Validation | Status |
|-------|-----------|--------|
| Email | Basic type="email" | ⚠️ Frontend only |
| Password | Nenhum | ❌ Aceita tudo |
| Name | Trim apenas | ⚠️ Sem regex/length |
| Phone | Nenhum | ❌ Aceita qualquer formato |
| URL/Address | Nenhum | ❌ Aceita qualquer texto |

### 2.5 SQL Injection & Attacks

**Status:** ✅ Seguro (não usa SQL direto)
- Usa TypeScript types
- Não tem query builder exposto
- Dados em memória Zustand

---

## 💾 3. CONSISTÊNCIA DE DADOS

### 3.1 Problemas de Referential Integrity

```typescript
// Scenario 1: Delete Student
const deleteStudent = (id: string) => {
  set((state) => ({
    students: state.students.filter((s) => s.id !== id),
  }))
  // ❌ ESTADO INCONSISTENTE:
  // - Payments ainda em payments[] com studentId inválido
  // - Schedules ainda em schedules[] com studentId inválido
}

// Scenario 2: Delete Location
const deleteLocation = (id: string) => {
  set((state) => ({
    locations: state.locations.filter((l) => l.id !== id),
  }))
  // ❌ ESTADO INCONSISTENTE:
  // - Groups ainda em groups[] com locationId inválido
  // - Tela de Turmas vai quebrar ao renderizar
}

// Scenario 3: Missing Schedule
// Se WeeklySchedule.id = "schedule-123" for deletado
// Mas LessonInstance stil references "schedule-123"
const getScheduleName = (scheduleId: string) => {
  return schedules.find((s) => s.id === scheduleId)?.id || 'Unknown'
  // ← Renderiza "Unknown" ao invés de erro
}
```

### 3.2 Sincronização Entre Stores

```typescript
// ⚠️ AuthStore e AppStore são independentes
// Não há sincronização automática

// Exemplo problema:
// 1. AppStore carrega dados
// 2. AuthStore faz logout
// 3. AppStore continua com dados visíveis?
// ← Não testado completamente
```

### 3.3 Mock Data Mode

```typescript
// ✅ BOM: mockMode é controlado centralmente
loadMockMode: (mode) => {
  const dataset = getMockDataset(mode)
  set({
    students: dataset.students,
    locations: dataset.locations,
    // ...
  })
}

// ⚠️ MAS: Sem aviso de que vai resetar dados
// Usuário clica "Demo" → todos os dados editados são perdidos
```

---

## 📋 4. CASOS DE TESTE QA

### 4.1 Happy Path Tests

```gherkin
# Feature: Student CRUD
Scenario: Create new student
  Given: User on StudentsPage
  When: Click "Novo Aluno"
  And: Fill all required fields
  And: Click "Criar"
  Then: Student appears in list
  And: Data persists in localStorage
  ✅ PASSING

Scenario: Edit existing student
  Given: Student exists
  When: Click edit icon
  And: Change name
  And: Click "Salvar"
  Then: Student updated in list
  ✅ PASSING

Scenario: Delete student
  Given: Student exists
  When: Click delete
  And: Confirm deletion
  Then: Student removed from list
  ❌ ISSUE: Orphaned payments/schedules still exist
```

### 4.2 Edge Cases

```gherkin
# Feature: Data Integrity
Scenario: Delete location with active groups
  Given: Location "Escola A" with Group "Turma 1"
  When: Delete location from LocationsPage
  Then: Group still exists but locationId is invalid ❌
  
Scenario: Delete student with active payments
  Given: Student "João" with Payment pending
  When: Delete student from StudentsPage
  Then: Payment still exists with orphaned studentId ❌
  
Scenario: Delete schedule with active lessons
  Given: Schedule with 5 lessons
  When: Delete schedule
  Then: Lessons still exist but scheduleId is invalid ❌

Scenario: Switch mock mode with unsaved data
  Given: User created new student in Empty mode
  When: Click "Demo" button (loads demo data)
  Then: User data is lost without warning ⚠️
```

### 4.3 Security Tests

```gherkin
# Feature: Authentication Security
Scenario: Bypass login
  Given: Fresh app load
  When: Manually set localStorage['user'] = "{...}"
  Then: User is authenticated without login ❌
  
Scenario: XSS Attack attempt
  Given: Student form
  When: Enter "<script>alert('xss')</script>" in name
  And: Save
  Then: Script is executed in dashboard ⚠️ (Need sanitization)
  
Scenario: Tenant isolation
  Given: Logged in as tenant-1
  When: Modify tenantId in localStorage to tenant-2
  Then: Access other tenant's data? ❌ (Need validation)
```

---

## 🔧 5. PROPOSTAS PARA BACKEND (FastAPI/PostgreSQL)

### 5.1 Arquitetura Recomendada

```
FastAPI Backend
├── auth/
│   ├── POST /auth/login → JWT Token
│   ├── POST /auth/refresh → New JWT
│   ├── POST /auth/logout → Invalidate token
│   └── jwt_middleware → Validates all endpoints
├── students/
│   ├── GET /students → List with tenant filter
│   ├── POST /students → Create
│   ├── PUT /students/{id} → Update
│   ├── DELETE /students/{id} → Cascade delete
│   └── middleware → Validate tenantId
├── locations/
│   ├── GET /locations
│   ├── POST /locations
│   ├── DELETE /locations/{id} → Cascade to groups
├── groups/
│   ├── DELETE /groups/{id} → Cascade to schedules, lessons
├── schedules/
│   ├── DELETE /schedules/{id} → Cascade to lessons
├── lessons/
│   ├── PUT /lessons/{id}/status
└── payments/
    └── Standard CRUD
```

### 5.2 Database Schema

```sql
-- Recomendação: PostgreSQL com Constraints

CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('OWNER', 'ADMIN', 'USER') NOT NULL,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type ENUM('PARTICULAR', 'SCHOOL', 'ACADEMY', 'CONDOMINIUM', 'ONLINE'),
  address TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE groups (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  price_per_student DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status ENUM('ACTIVE', 'PAUSED', 'CLOSED') DEFAULT 'ACTIVE',
  billing_model ENUM('PER_LESSON', 'MONTHLY_FIXED', 'PACKAGE'),
  hourly_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE weekly_schedules (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  weekday INT NOT NULL (0-6),
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (student_id IS NOT NULL OR group_id IS NOT NULL)
);

CREATE TABLE lesson_instances (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status ENUM('PLANNED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'PLANNED',
  price_snapshot DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  paid_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_locations_tenant ON locations(tenant_id);
CREATE INDEX idx_groups_tenant ON groups(tenant_id);
CREATE INDEX idx_groups_location ON groups(location_id);
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_schedules_tenant ON weekly_schedules(tenant_id);
CREATE INDEX idx_lessons_tenant ON lesson_instances(tenant_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
```

### 5.3 API Endpoints Recomendados

```yaml
Authentication:
  POST /api/auth/login
    Request: { email, password }
    Response: { access_token, refresh_token, user }
    
  POST /api/auth/refresh
    Headers: Authorization: Bearer {token}
    Response: { access_token }
    
  POST /api/auth/logout
    Headers: Authorization: Bearer {token}
    Response: { success: true }

Students:
  GET /api/students
    Query: ?status=ACTIVE&limit=50&offset=0
    Response: { data: Student[], total: number }
    
  POST /api/students
    Body: { name, email, phone, status, billingModel, hourlyPrice }
    Response: { id, ...student }
    
  PUT /api/students/{id}
    Body: Partial<Student>
    Response: Updated student
    
  DELETE /api/students/{id}
    Response: { success: true }
    Logic: CASCADE → delete payments, schedules

Locations:
  GET /api/locations
  POST /api/locations
  PUT /api/locations/{id}
  DELETE /api/locations/{id}
    Logic: RESTRICT if groups exist
    Response: 409 Conflict if has groups

Groups:
  DELETE /api/groups/{id}
    Logic: CASCADE → delete schedules, lessons
    
Schedules:
  DELETE /api/schedules/{id}
    Logic: CASCADE → delete lessons
    
Lessons:
  PUT /api/lessons/{id}/status
    Body: { status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' }
    Response: Updated lesson
    
Payments:
  PUT /api/payments/{id}/mark-as-paid
    Body: { paidDate: string }
    Response: Updated payment
```

### 5.4 Autenticação & Autorização

```python
# FastAPI JWT Strategy
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        if not user_id or not tenant_id:
            raise HTTPException(status_code=401)
        return {"user_id": user_id, "tenant_id": tenant_id}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401)

# Middleware: Validate tenantId
async def validate_tenant(user = Depends(get_current_user)):
    # Verifica se tenantId do token matches request
    return user

# Uso em endpoints
@router.get("/students")
async def list_students(user = Depends(validate_tenant)):
    # Sempre filtra por user["tenant_id"]
    return db.students.filter(tenant_id=user["tenant_id"])
```

### 5.5 Validação & Sanitização

```python
from pydantic import BaseModel, EmailStr, validator

class StudentCreate(BaseModel):
    name: str
    email: EmailStr  # Valida email automaticamente
    phone: str
    status: StudentStatus
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        if len(v) > 100:
            raise ValueError('Name too long')
        return v.strip()
    
    @validator('phone')
    def phone_valid(cls, v):
        if not v.replace('+','').replace('-','').isdigit():
            raise ValueError('Invalid phone format')
        return v

# XSS Prevention: Escape HTML in responses
from html import escape
def sanitize_string(s: str) -> str:
    return escape(s)
```

---

## ⚠️ 6. VULNERABILIDADES ENCONTRADAS

| # | Vulnerabilidade | Severity | Fix |
|---|-----------------|----------|-----|
| 1 | Sem autenticação real | 🔴 CRÍTICO | JWT + Password Hash |
| 2 | Credentials em plaintext | 🔴 CRÍTICO | Usar sessionStorage + HttpOnly cookies |
| 3. | Sem validação server-side | 🔴 CRÍTICO | Validar em FastAPI com Pydantic |
| 4 | SQL Injection risk (futuro) | 🔴 CRÍTICO | Use ORM (SQLAlchemy), never raw queries |
| 5 | XSS risk em renderização | 🟡 ALTO | Sanitize HTML, use DOMPurify |
| 6 | CSRF sem proteção | 🟡 ALTO | Implementar CSRF tokens |
| 7 | Órfãos de referential integrity | 🟡 ALTO | Cascade delete + constraints DB |
| 8 | Sem rate limiting | 🟡 ALTO | Implementar em middleware |
| 9 | Sem HTTPS | 🔴 CRÍTICO | Forçar HTTPS em produção |
| 10 | Sem logout seguro | 🟡 ALTO | Invalidar tokens no backend |

---

## ✅ 7. O QUE ESTÁ BOM

| Item | Status | Feedback |
|------|--------|----------|
| UI/UX | ✅ Excelente | Dark mode funciona, responsive, limpo |
| State Management | ✅ Bom | Zustand é eficiente, simples |
| TypeScript | ✅ Excelente | Types bem definidos |
| Dark Mode | ✅ Perfeito | Integrado em todos componentes |
| Form Validation | ✅ Adequado | Dropdowns melhorados |
| Onboarding Flow | ✅ Ótimo | 3-step wizard, UX clara |
| Calendar Views | ✅ Excelente | 3 visões (dia/semana/mês) funcionam |
| Mock Data | ✅ Bom | Facilita testes |
| Pagination/Search | ✅ Implementado | Filtros funcionam |

---

## 🚀 8. PRIORIDADE DE CORREÇÕES

### Imediato (Para próximo build)
- [ ] Implementar cascata delete em todas as entidades
- [ ] Adicionar validação de referential integrity
- [ ] Avisar antes de mudar mock mode
- [ ] Sanitizar inputs com DOMPurify

### Curtíssimo Prazo (Backend)
- [ ] Implementar JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] PostgreSQL database
- [ ] API endpoints com validation
- [ ] Tenant isolation no servidor

### Médio Prazo
- [ ] Unit tests
- [ ] E2E tests com Playwright
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Logging & monitoring

### Longo Prazo
- [ ] OAuth2 (Google, GitHub)
- [ ] Audit logs
- [ ] Data encryption at rest
- [ ] Backup automation
- [ ] API versioning

---

## 📝 9. CHECKLIST PRÉ-PRODUÇÃO

- [ ] Todas as senhas removidas de código
- [ ] Secrets em .env (não versionado)
- [ ] HTTPS forçado
- [ ] CORS restringido
- [ ] Rate limiting ativado
- [ ] Logging centralizador
- [ ] Database backups automáticos
- [ ] Health checks implementados
- [ ] Error tracking (Sentry/similar)
- [ ] Performance monitoring
- [ ] Load testing realizado
- [ ] Penetration testing realizado
- [ ] Security headers configurados (CSP, HSTS, X-Frame-Options)
- [ ] Testes de segurança automáticos (OWASP)

---

## 📞 10. RECOMENDAÇÕES FINAIS

### Para MVP (Próximos 2 sprints)
1. **Backend básico**: FastAPI + PostgreSQL com JWT
2. **Integridade de dados**: Cascade delete + constraints
3. **Validação**: Pydantic models no backend
4. **Segurança mínima**: HTTPS + Password hashing + CORS

### Para Release 1.0
1. **Testes**: 80%+ coverage
2. **Monitoring**: Sentry + logs centralizados
3. **Operacional**: CI/CD pipeline, backups automáticos
4. **Compliance**: LGPD (para Brasil)

### Custo de Correção
- Agora (MVP): 🟢 Baixo (2-3 semanas)
- Production (depois): 🔴 Muito alto (refactor completo)

**Recomendação:** Pausar novas features, focar em backend/segurança antes de qualquer usuário real usar.

---

**Próximos Passos Recomendados:**
1. ✅ Ler este documento com equipe
2. ✅ Priorizar backend FastAPI + DB
3. ✅ Implementar validação cascata no appStore temporariamente
4. ✅ Adicionar aviso ao trocar mock mode
5. ✅ Integrar com backend assim que pronto
