# ✅ PRÉ-DEPLOY CHECKLIST

**Use este arquivo para garantir que tudo está pronto antes de fazer git push**

---

## 🗂️ Estrutura de Arquivos

### Backend
```
backend/
  app/
    routers/
      ✅ feedback.py               NOVO - Endpoints de feedback
      ✅ auth.py                   Existente - Login/Register
      ✅ students.py               Existente
      ✅ groups.py                 Existente
      ✅ payments.py               Existente
      └─ ...
    ✅ main.py                     MODIFICADO - Adicionado feedback router
    └─ ...
  ✅ read_feedback.py              NOVO - Script admin

frontend/
  src/
    components/
      ✅ FeedbackWidget.tsx        NOVO - Widget flutuante
      ✅ LoginForm.tsx             Existente
      └─ ...
    ✅ App.tsx                     MODIFICADO - Adicionado <FeedbackWidget/>
    └─ ...

Documentação/
  ✅ INDEX.md                      Central de navegação
  ✅ DEPLOY_NOW.md                 30-min action plan
  ✅ SESSION_SUMMARY.md            O que foi feito
  ✅ READY_FOR_BETA.md             Features prontas
  ✅ GOOGLE_OAUTH_SETUP.md         Google login (opcional)
  ✅ GIT_PUSH_GUIDE.md             Como fazer git push
  ✅ QA_COMPLETE_FINDINGS.md       Issues encontrados
  ✅ QA_FIXES_GUIDE.md             Como corrigir
  ✅ PRE_DEPLOY_CHECKLIST.md       Este arquivo
```

---

## 📝 Código Modificado

### 1. backend/app/main.py

**Linha ~6 (Imports):**
```python
from app.routers import auth, students, groups, payments, feedback  # ← feedback adicionado
```

**Linha ~49 (Router registration):**
```python
app.include_router(feedback.router, prefix=settings.API_V1_STR)  # ← linha adicionada
```

✅ **Verificar:** Abra o arquivo e confirme que tem essas 2 linhas
```powershell
grep -n "feedback" backend/app/main.py
# Deve mostrar 2 linhas com "feedback"
```

---

### 2. frontend/src/App.tsx

**Linha ~7 (Imports):**
```tsx
import { FeedbackWidget } from './components/FeedbackWidget'  // ← import adicionado
```

**Linha ~82 (After AppContent):**
```tsx
<FeedbackWidget />  // ← componente adicionado
```

✅ **Verificar:** Abra o arquivo e confirme que tem essas 2 linhas
```powershell
grep -n "FeedbackWidget" frontend/src/App.tsx
# Deve mostrar 2 linhas com "FeedbackWidget"
```

---

## 🆕 Arquivos Novos

### 1. frontend/src/components/FeedbackWidget.tsx
- ✅ Criado com sucesso
- ✅ Exporta `FeedbackWidget`
- ✅ Usa React hooks (useState)
- ✅ POST para `/api/v1/feedback`

**Verificar tamanho:**
```powershell
Get-Item frontend/src/components/FeedbackWidget.tsx | Select-Object Length
# Esperado: ~3-5 KB
```

---

### 2. backend/app/routers/feedback.py
- ✅ Criado com sucesso
- ✅ Define `router` FastAPI
- ✅ 3 endpoints: POST, GET, PUT
- ✅ Salva em `feedback.jsonl`

**Verificar tamanho:**
```powershell
Get-Item backend/app/routers/feedback.py | Select-Object Length
# Esperado: ~3-5 KB
```

---

### 3. backend/read_feedback.py
- ✅ Criado com sucesso
- ✅ Script standalone (não precisa de imports complexos)
- ✅ Lê `feedback.jsonl`
- ✅ Exporta CSV com `--csv`

**Verificar tamanho:**
```powershell
Get-Item backend/read_feedback.py | Select-Object Length
# Esperado: ~2-3 KB
```

---

## 📋 Testes Locais (OPCIONAL antes de git push)

### Teste 1: Verificar Imports Python
```powershell
cd backend

# Testa se feedback.py é importável
python -c "from app.routers import feedback; print('✅ feedback.py OK')"

# Testa se feedback está no main.py
python -c "from app.main import app; print('✅ main.py OK'); print(app.routes)"
# Procure por: /api/v1/feedback nos routes
```

### Teste 2: Verificar Imports React
```powershell
cd frontend

# Testa se FeedbackWidget é importável (tipo check)
# Nota: Requer node_modules, então só se já estava rodando
```

### Teste 3: Simulador Simples
```powershell
# Sem rodar server, só verificar syntax
python -m py_compile backend/app/routers/feedback.py
# Sem erros = ✅
```

---

## 🔐 Database Reset (CRÍTICO)

**ANTES de fazer git push, você deve resetar database local:**

```powershell
cd backend

# Copy-paste este comando inteiro:
python -c "
from app.core.database import Base, engine
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print('✅ Database reset OK')
"
```

**Por quê?**
- Garante que schema local = schema no código
- Quando deploy acontece, schema no Render também fica certo (auto-seed)

✅ **Você deve ver:** `✅ Database reset OK`  
❌ **Se ver erro:** Leia [QA_FIXES_GUIDE.md](./qa/QA_FIXES_GUIDE.md)

---

## 📤 Git Status Pre-Push

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow'

git status
```

**Você DEVE ver:**
- ✅ Cambio modificado en backend/app/main.py
- ✅ Cambio modificado en frontend/src/App.tsx
- ✅ Arquivo novo: backend/app/routers/feedback.py
- ✅ Arquivo novo: frontend/src/components/FeedbackWidget.tsx
- ✅ Arquivo novo: backend/read_feedback.py
- ✅ Vários arquivos markdown (documentação)

**Você NÃO deve ver:**
- ❌ node_modules/ (ignorado por .gitignore)
- ❌ __pycache__/ (ignorado)
- ❌ .env files (ignorado)
- ❌ venv/ (ignorado)

---

## 🚀 Git Push Command

Quando tudo acima estiver ✅:

```powershell
cd 'c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow'

git add .
git commit -m "feat: Feedback system + ready for beta launch"
git push -u origin main
```

**Esperado:**
- Arquivo no GitHub em <10 segundos
- GitHub Actions acionados em <30 segundos
- Frontend deploy em Vercel em ~5 min
- Backend deploy em Render em ~10 min

---

## 🌐 Após Deploy (Test URLs)

Quando GitHub Actions ficar verde (✅):

```
Frontend:
https://teacherflow.vercel.app/login

Backend Health:
https://teacherflow-backend.onrender.com/api/v1/health
# Esperado: {"status":"ok"}

Feedback Endpoint:
https://teacherflow-backend.onrender.com/api/v1/feedback
# Sem teste agora, será usado pelo widget
```

---

## 🎯 Próximas Etapas

1. ✅ Completar este checklist
2. ✅ Fazer git push
3. ⏳ Aguardar deploy (15 min)
4. ✅ Testar URLs acima
5. ✅ Enviar link para beta testers
6. 📊 Coletar feedback por 1-2 semanas
7. 🔧 Implementar fixes baseado em feedback

---

## ❓ Dúvidas?

| Pergunta | Ver Arquivo |
|----------|------------|
| Como fazer git push? | [GIT_PUSH_GUIDE.md](./deployment/GIT_PUSH_GUIDE.md) |
| Tive erro no deploy | [QA_FIXES_GUIDE.md](./qa/QA_FIXES_GUIDE.md) |
| Como funciona feedback? | [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) |
| Steps detalhados deploy | [DEPLOY_NOW.md](./deployment/DEPLOY_NOW.md) |

---

**Quando completar TODOS os ✅ acima, você está ready para fazer git push!** 🚀

*Última atualização: 3 de Março de 2026*
