# 🚀 Render Setup Checklist - TeacherFlow Backend

**Service ID:** srv-d6h09fhaae7s73bl4v6g  
**URL:** https://teacherflow-backend.onrender.com  
**Status Atual:** ✅ Online mas **rodando versão antiga** (commit a20001d)  
**Última atualização local:** commit 5aa4398 (69 arquivos, +14,618 linhas)

---

## 🔴 PROBLEMA IDENTIFICADO

O backend está online mas **não tem os novos endpoints**:
- ❌ `/api/v1/subscriptions/tiers` → 404
- ❌ `/api/v1/tour/steps` → 404  
- ❌ `/api/v1/lgpd/privacy-policy` → 404

**Causa:** Render não fez auto-deploy do commit 5aa4398

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### 1️⃣ **Verificar Conexão GitHub → Render**

Acesse: [Render Dashboard](https://dashboard.render.com/web/srv-d6h09fhaae7s73bl4v6g)

**Verificar:**
```
✓ Repositório conectado: HugoLoyalConsulting/teacherflow-backend  
✓ Branch: main (ou master se for o caso)
✓ Auto-Deploy: ENABLED (crucial!)
```

**Se Auto-Deploy estiver OFF:**
1. Settings → Build & Deploy
2. Ativar "Auto-Deploy: Yes"
3. Salvar

---

### 2️⃣ **Forçar Manual Deploy do Último Commit**

**No Render Dashboard:**
1. Clique **"Manual Deploy"** → **"Clear build cache & deploy"**
2. Aguardar build (~3-5 min)
3. Verificar logs em tempo real

**O que esperar nos logs:**
```bash
==> Installing dependencies from requirements.txt
==> Installing stripe==8.0.0  ✅ (nova dependência)
==> Starting service with: uvicorn app.main:app
==> Service listening on port 10000
```

**⚠️ Se houver erro:**
- Copiar log completo
- Procurar por: `ModuleNotFoundError`, `ImportError`, `SyntaxError`
- Erros comuns: sentry-sdk, posthog (são opcionais)

---

### 3️⃣ **Verificar Variáveis de Ambiente (CRÍTICAS)**

**No Render Dashboard → Environment:**

| Variável | Valor Exemplo | Status | Obrigatório |
|----------|---------------|--------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | 🔴 **CRÍTICO** | SIM |
| `SECRET_KEY` | `sua-chave-secreta-longa` | 🔴 **CRÍTICO** | SIM |
| `ALGORITHM` | `HS256` | ✅ Padrão | SIM |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | ✅ Padrão | SIM |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | ✅ Padrão | SIM |
| `DEBUG` | `false` | ✅ Padrão | SIM |
| `API_V1_STR` | `/api/v1` | ✅ Padrão | SIM |
| `ENVIRONMENT` | `production` | ✅ Padrão | SIM |
| `CORS_ORIGINS` | `["https://teacherflow-app.vercel.app","http://localhost:5173"]` | 🟡 Verificar | SIM |
| `PYTHON_VERSION` | `3.11.11` | ✅ Padrão | SIM |
| `POSTHOG_ENABLED` | `false` | 🟡 Opcional | NÃO |
| `SENTRY_ENABLED` | `false` | 🟡 Opcional | NÃO |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` | 🟡 Futuro | NÃO* |

*Necessário para processar pagamentos, mas sistema funciona sem (para teste)

**🚨 ATENÇÃO - DATABASE_URL:**
```
Formato correto (Neon/PostgreSQL):
postgresql://user:password@ep-xxxxx-pooler.us-east-1.aws.neon.tech/teacherflow?sslmode=require

Erros comuns:
❌ postgres:// (deve ser postgresql://)
❌ Sem ?sslmode=require no final
❌ Senha com caracteres especiais não encodados
```

---

### 4️⃣ **Verificar/Obter DATABASE_URL (Neon)**

**Acesse:** [Neon Console](https://console.neon.tech)

1. Selecione o projeto **teacherflow**
2. Dashboard → **Connection Details**
3. Copiar **Pooled Connection** (com sslmode=require)
4. Colar no Render → Environment → `DATABASE_URL`

**Exemplo válido:**
```
postgresql://teacherflow_owner:npg_xxx@ep-polished-meadow-a5yw4r7o-pooler.us-east-1.aws.neon.tech/teacherflow?sslmode=require
```

---

### 5️⃣ **Rodar Migrações do Alembic**

**Após deploy bem-sucedido, via Render Shell:**

```bash
# 1. Conectar ao Shell do Render
# Dashboard → Shell (botão no canto superior)

# 2. Navegar até backend
cd /opt/render/project/src/backend

# 3. Verificar versão atual do banco
alembic current

# 4. Rodar migrações pendentes
alembic upgrade head

# 5. Verificar se migrações aplicadas
alembic current
# Esperado: "004_add_subscription_system (head)"
```

**Migrações esperadas:**
- ✅ `003_add_lgpd_compliance` → Tabelas de consent LGPD
- ✅ `004_add_subscription_system` → Tabelas subscription_tiers, subscriptions, subscription_payments

**Se der erro:**
```bash
# Ver histórico de migrações
alembic history

# Ver SQL que será executado (sem executar)
alembic upgrade head --sql

# Forçar migração específica
alembic upgrade 004
```

---

### 6️⃣ **Seed dos Planos de Assinatura**

**Via Render Shell (após migração 004):**

```python
# Abrir Python interativo
python

# Executar seed
from app.core.database import SessionLocal
from app.services.subscription_service import SubscriptionService

db = SessionLocal()
service = SubscriptionService(db)
service.seed_subscription_tiers()
db.close()

print("✅ 3 planos criados: Free (R$0), Pro (R$49), Premium (R$99)")
exit()
```

**Verificar seed funcionou:**
```bash
# No Shell do Render
python -c "from app.core.database import SessionLocal; from app.models import SubscriptionTier; db = SessionLocal(); tiers = db.query(SubscriptionTier).all(); print(f'Planos cadastrados: {len(tiers)}'); db.close()"

# Esperado: "Planos cadastrados: 3"
```

---

### 7️⃣ **Testes de Verificação Final**

**Após deploy + migração + seed:**

#### A. Health Check
```bash
curl https://teacherflow-backend.onrender.com/health
# Esperado: {"status":"ok"}
```

#### B. Subscription Tiers (NOVO!)
```bash
curl https://teacherflow-backend.onrender.com/api/v1/subscriptions/tiers
# Esperado: Array com 3 planos
[
  {
    "id": 1,
    "name": "Free",
    "tier_key": "free",
    "price_monthly_brl": "0.00",
    "limits": {"max_students": 10, "max_locations": 1, ...}
  },
  {
    "id": 2,
    "name": "Pro",
    "tier_key": "pro",
    "price_monthly_brl": "49.00",
    "limits": {"max_students": 50, "max_locations": 3, ...}
  },
  {
    "id": 3,
    "name": "Premium",
    "tier_key": "premium",
    "price_monthly_brl": "99.00",
    "limits": {"max_students": -1, "max_locations": -1, ...}
  }
]
```

#### C. Tour Steps (NOVO!)
```bash
curl https://teacherflow-backend.onrender.com/api/v1/tour/steps
# Esperado: Array de steps do onboarding tour
```

#### D. LGPD Privacy Policy (NOVO!)
```bash
curl https://teacherflow-backend.onrender.com/api/v1/lgpd/privacy-policy
# Esperado: {"content": "...", "version": "1.0", ...}
```

#### E. Login do Professor Demo
```bash
curl -X POST https://teacherflow-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor.demo@teacherflow.com","password":"demo123"}'

# Esperado: {"access_token":"...", "refresh_token":"...", "user":{...}}
```

---

## 🔧 TROUBLESHOOTING

### ❌ Problema: Build Falha com "ModuleNotFoundError: stripe"
**Solução:**
```bash
# Verificar se stripe está no requirements.txt
grep stripe backend/requirements.txt
# Deve mostrar: stripe==8.0.0

# Se não estiver, adicionar e fazer commit
echo "stripe==8.0.0" >> backend/requirements.txt
git add backend/requirements.txt
git commit -m "fix: add stripe to requirements"
git push
```

### ❌ Problema: "relation subscription_tiers does not exist"
**Solução:** Migração 004 não foi rodada
```bash
# Conectar Shell do Render
cd /opt/render/project/src/backend
alembic upgrade head
```

### ❌ Problema: Endpoints retornam 404
**Causas possíveis:**
1. **Deploy não atualizou** → Forçar manual deploy
2. **Import error no main.py** → Verificar logs do build
3. **Router não registrado** → Verificar main.py local vs deployed

### ❌ Problema: "could not connect to server: Connection refused"
**Solução:** DATABASE_URL incorreto
```bash
# Verificar no Render Environment
# Deve começar com: postgresql:// (não postgres://)
# Deve ter: ?sslmode=require no final
# Obter URL correto do Neon Console
```

### ❌ Problema: CORS Error no Frontend
**Solução:**
```bash
# Verificar CORS_ORIGINS no Render Environment
# Deve incluir: https://teacherflow-app.vercel.app

# Formato correto (JSON array string):
["https://teacherflow-app.vercel.app","http://localhost:5173"]

# ⚠️ NÃO usar aspas simples no JSON interno!
```

---

## ✅ CHECKLIST FINAL

Antes de testar no frontend, confirme:

- [ ] ✅ Backend responde `/health` com 200
- [ ] ✅ `/api/v1/subscriptions/tiers` retorna 3 planos
- [ ] ✅ `/api/v1/tour/steps` retorna array de steps
- [ ] ✅ `/api/v1/lgpd/privacy-policy` retorna política
- [ ] ✅ Login funciona: POST `/api/v1/auth/login`
- [ ] ✅ DATABASE_URL configurado corretamente
- [ ] ✅ CORS_ORIGINS inclui URL do Vercel
- [ ] ✅ Migrações rodadas: `alembic current` mostra `004`
- [ ] ✅ 3 planos seedados no banco
- [ ] ✅ Auto-Deploy habilitado no Render

---

## 🎯 PRÓXIMOS PASSOS (Após Backend 100%)

### Frontend Vercel

**Variáveis de Ambiente a configurar:**
```bash
VITE_API_URL=https://teacherflow-backend.onrender.com/api/v1
VITE_ENVIRONMENT=production
VITE_POSTHOG_KEY=(opcional)
VITE_SENTRY_DSN=(opcional)
VITE_STRIPE_PUBLISHABLE_KEY=(futuro, para pagamentos)
```

### Integração Stripe (Futuro)

1. Criar conta Stripe → Obter API keys
2. Adicionar no Render: `STRIPE_SECRET_KEY=sk_test_xxx`
3. Adicionar no Vercel: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`
4. Configurar webhook: `https://teacherflow-backend.onrender.com/api/v1/subscriptions/webhook`
5. Testar pagamento sandbox

---

## 📞 SUPORTE

**Logs em Tempo Real:**
- Render Dashboard → Logs (botão superior)
- Ver últimas 1000 linhas de log
- Filtrar por erro: `grep -i error`

**Comandos Úteis no Shell:**
```bash
# Ver versão Python
python --version

# Ver pacotes instalados
pip list | grep -E "(fastapi|stripe|alembic)"

# Testar import manual
python -c "from app.routers import subscriptions; print('✅ Import OK')"

# Ver tabelas do banco
python -c "from app.models import Base; print([t.name for t in Base.metadata.sorted_tables])"
```

---

**Última atualização:** 6 de março de 2026  
**Commit atual:** 5aa4398 (69 arquivos, +14,618 linhas)  
**Branch:** master
