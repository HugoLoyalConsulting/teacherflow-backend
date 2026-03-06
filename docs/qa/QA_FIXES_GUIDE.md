# Guia Correciões QA - Próximos Passos

**Objetivo:** Corrigir todos os issues encontrados e deixar o sistema pronto para deploy

**Tempo Estimado:** 30-45 minutos

---

## STEP 1: Corrigir Database Schema (5 min)

### 1.1 Resetar Banco de Dados

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\backend'

# Comando 1: Delete todas as tabelas
python -c "from app.core.database import Base, engine; Base.metadata.drop_all(bind=engine); print('Database resetado com sucesso')"

# Comando 2: Verificar conexão
python -c "from app.core.database import SessionLocal; db = SessionLocal(); print('Conexao OK'); db.close()"
```

**Resultado esperado:**
```
Database resetado com sucesso
Conexao OK
```

---

## STEP 2: Iniciar Servidor (10 min)

### 2.1 Startup com Logs

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\backend'

python main.py
```

**Resultado esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
✓ Database already seeded (ou AUTO-SEED COMPLETED se primeira vez)
```

**Deixe o servidor rodando em background.**

---

## STEP 3: Executar QA Manual Test (15 min)

### 3.1 Em outro terminal:

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\backend'

python qa_manual_test.py
```

### 3.2 Resultado esperado:

```
======================================================================
TeacherFlow - Complete QA Test Suite
======================================================================
Target: http://localhost:8000
Time: 2026-03-03T...

[SECTION] Health & Connectivity
[TEST] Health Check
[PASS] Health Check

[TEST] Root Endpoint
[PASS] Root Endpoint

[SECTION] Authentication
[TEST] Register User
[PASS] Register User
Token obtained: eyJhbGciOiJIUzI1N...

[TEST] Get Current User
[PASS] Get Current User

[SECTION] Student Management
[TEST] Create Location
[PASS] Create Location

...

FINAL TEST REPORT
======================================================================
PASSED:  15
FAILED:  0
SKIPPED: 0

SUCCESS RATE: 100.0% (15/15)
```

**Se falhar em algum ponto, veja a seção TROUBLESHOOTING abaixo.**

---

## STEP 4: Verificar Frontend (10 min ADICIONAL)

### 4.1 Instalar dependências

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\frontend'

npm install
```

### 4.2 Iniciar Dev Server

```powershell
npm run dev
```

**Resultado esperado:**
```
VITE v5.0.8  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 4.3 Testar no Browser

1. Abra http://localhost:5173
2. Clique em "Login" ou "Registrar"
3. Preencha formulário com:
   - Email: `test@test.local`
   - Senha: `AnyPassword123!`
4. Clique registrar
5. Verificar que redirecionou para dashboard

---

## TROUBLESHOOTING

### Problema: "404 Not Found" em endpoints

**Causa:** Possível problema com API prefix

**Debug Comando:**
```powershell
cd backend
python -c "
from app.main import app
print('Routes registradas:')
for route in app.routes:
    if 'auth' in route.path.lower():
        print(f'{route.path:50} -> {route.name}')
"
```

**Esperado:**
```
Routes registradas:
/api/v1/auth/register                             -> register
/api/v1/auth/login                                -> login
/api/v1/auth/me                                   -> get_current_user
```

**Se não aparecer:** Verificar `app.routers.auth` se tem `router.prefix`

---

### Problema: "Database column does not exist"

**Comando para Resolver:**
```powershell
# Reset completo
python -c "
from app.core.database import Base, engine
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print('Database recriado')
"

# Restart server
python main.py
```

---

### Problema: "Auto-seed failed"

**Se auto-seed falhar, mas server inicia:**
- Não é crítico (acontece em primeira execução)
- Dados podem ser inseridos manualmente
- Ou roddar `python app/seeds/seed_realistic.py` direto

---

## STEP 5: Validação Final

### 5.1 Checklist Pré-Deploy

```
[ ] Backend rodando em localhost:8000
[ ] GET /health retorna 200
[ ] Auth endpoints funcionam (register/login)
[ ] CRUD estudantes funciona
[ ] Pagamentos funcionam
[ ] Dashboard mostra dados
[ ] Frontend rodando em localhost:5173
[ ] Login/Logout funciona no frontend
[ ] Consegue criar aluno pelo frontend
```

### 5.2 Comando Final de Validação

```powershell
# Terminal 1: Servidor rodando
cd backend; python main.py

# Terminal 2: Testes
cd backend; python qa_manual_test.py

# Terminal 3: Frontend
cd frontend; npm run dev
```

Se todos passarem: **SISTEMA PRONTO PARA DEPLOY** ✅

---

## STEP 6: Deploy para Produção

Quando tudo passar localmente:

### 6.1 Git Push

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow'

git add .
git commit -m "feat: QA complete - Sistema pronto para produção"
git push -u origin main
```

### 6.2 Verificar Deploy Automático

Vá para: https://github.com/HugoLoyalConsulting/teacherflow-backend/actions

- GitHub Actions deve iniciar deploys automaticamente
- Frontend deploy → Vercel
- Backend deploy → Render

### 6.3 Verificar Produção

```
Frontend: https://teacherflow.vercel.app
Backend:  https://teacherflow-backend.onrender.com/api/v1/health
```

---

## RESUMO DOS FIXES APLICADOS

| Issue | Fix | Status |
|-------|-----|--------|
| StudentLesson import | Adicionado ao import | ✅ DONE |
| Pasta app/app duplicada | Deletada | ✅ DONE |
| Database schema | Reset com script | ⏳ MANUAL |
| API 404 endpoints | Verificar routers | ⏳ VALIDATE |

---

## PRÓXIMAS AÇÕES

1. **IMEDIATO:** Rodar STEP 1-3 acima
2. **DEPOIS:** Se passarem, rodar STEP 4 (Frontend)
3. **FINAL:** Se tudo passar, STEP 5 + 6 (Deploy)

---

**Status Geral:** ⚠️ Sistema COM ISSUES, mas CORREÇÕES IDENTIFICADAS.

**Tempo até Deploy:** ~1-2 horas após completar steps acima.
