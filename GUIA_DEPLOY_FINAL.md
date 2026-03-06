# 🎯 PASSO A PASSO FINAL - Configuração Render + Vercel

**Status Atual:** ✅ Código atualizado no GitHub | ⏳ Render aguardando deploy manual

---

## 🔴 AÇÃO IMEDIATA: Deploy Manual no Render

### **Passo 1: Acessar Dashboard do Render**

1. Abra seu navegador
2. Acesse: **https://dashboard.render.com/web/srv-d6h09fhaae7s73bl4v6g**
3. Faça login se necessário

---

### **Passo 2: Verificar Branch Conectada**

No Dashboard, procure por **"Branch"** e confirme:
```
✅ Deve mostrar: main
```

Se estiver em outra branch (ex: master), clique em **Settings** e mude para `main`.

---

### **Passo 3: Forçar Manual Deploy**

Na página do serviço:

1. **Clique no botão azul** no topo direito: **"Manual Deploy"**
2. Selecione: **"Clear build cache & deploy"** 
   - ⚠️ Importante! Use "clear cache" para garantir que instale stripe==8.0.0
3. Clique novamente em **"Deploy"** para confirmar

**O que vai acontecer:**
```
⏳ Build iniciado (~3-5 minutos)
📦 Installing dependencies from requirements.txt
   -> Installing stripe==8.0.0 (NOVO!)
   -> Installing fastapi, sqlalchemy, alembic, etc.
🚀 Starting service with uvicorn
✅ Live (se tudo der certo)
```

---

### **Passo 4: Monitorar Logs em Tempo Real**

Enquanto o deploy acontece:

1. Clique na aba **"Logs"** (menu superior)
2. Acompanhe o build em tempo real
3. **Procure por erros** (linhas vermelhas)

**✅ Sinais de sucesso:**
```bash
==> Installing stripe==8.0.0
Successfully installed stripe-8.0.0

==> Starting service...
INFO:     Uvicorn running on http://0.0.0.0:10000

INFO:     Application startup complete
```

**❌ Sinais de erro (se aparecer):**
```bash
ModuleNotFoundError: No module named 'stripe'
  → Limpar cache e deploy novamente

ImportError: cannot import name 'subscriptions'
  → Verificar se branch main está correta
  → Git log deve mostrar commit 5aa4398

SyntaxError: invalid syntax
  → Copiar erro completo e pedir ajuda
```

---

### **Passo 5: Verificar Deploy Succeeded**

Após ~3-5 minutos, a interface deve mostrar:

```
✅ Live
   Last Updated: Há poucos segundos
   Commit: 5aa4398
```

**Teste imediato:**
```bash
# No PowerShell local:
curl https://teacherflow-backend.onrender.com/health
# Esperado: {"status":"ok"}
```

---

## 🗄️ CONFIGURAR BANCO DE DADOS

### **Passo 6: Verificar DATABASE_URL no Render**

1. No Dashboard do Render, clique em **"Environment"** (menu lateral esquerdo)
2. Procure por **`DATABASE_URL`**

**Se estiver vazio ou incorreto:**

1. Acesse [Neon Console](https://console.neon.tech)
2. Selecione projeto **teacherflow**
3. Vá em **Dashboard → Connection Details**
4. Copie a **"Pooled Connection"** (tem ?sslmode=require no final)
5. Cole no Render Environment → `DATABASE_URL`
6. Clique **"Save Changes"**
7. Serviço vai reiniciar automaticamente

**Formato correto da URL:**
```
postgresql://user:password@ep-xxxxx-pooler.us-east-1.aws.neon.tech/teacherflow?sslmode=require
```

---

### **Passo 7: Rodar Migrações do Banco**

**Via Render Shell:**

1. No Dashboard, clique no botão **"Shell"** (canto superior direito, ícone de terminal)
2. Aguarde terminal abrir (~10 segundos)
3. Execute os comandos:

```bash
# 1. Navegar até backend
cd /opt/render/project/src/backend

# 2. Ver migração atual
alembic current

# 3. Rodar TODAS as migrações pendentes
alembic upgrade head

# 4. Confirmar que rodou tudo
alembic current
# Deve mostrar: 004_add_subscription_system (head)
```

**✅ Output esperado:**
```
INFO  [alembic.runtime.migration] Running upgrade 002 -> 003, add lgpd compliance
INFO  [alembic.runtime.migration] Running upgrade 003 -> 004, add subscription system
```

**❌ Se der erro "relation already exists":**
```bash
# Marcar migração como já aplicada (se tabelas já existem)
alembic stamp 004
```

---

### **Passo 8: Seed dos Planos de Assinatura**

**Ainda no Shell do Render:**

```bash
# Abrir Python interativo
python

# Colar e executar linha por linha:
from app.core.database import SessionLocal
from app.services.subscription_service import SubscriptionService

db = SessionLocal()
service = SubscriptionService(db)
service.seed_subscription_tiers()
db.commit()
db.close()

# Verificar que criou
from app.core.database import SessionLocal
from app.models import SubscriptionTier
db = SessionLocal()
tiers = db.query(SubscriptionTier).all()
print(f"✅ Planos criados: {len(tiers)}")
for tier in tiers:
    print(f"   - {tier.name}: R${tier.price_monthly_brl}/mês")
db.close()
exit()
```

**✅ Output esperado:**
```
✅ Planos criados: 3
   - Free: R$0.00/mês
   - Pro: R$49.00/mês
   - Premium: R$99.00/mês
```

---

## ✅ TESTAR BACKEND COMPLETAMENTE

### **Passo 9: Executar Script de Verificação**

**No PowerShell local:**

```powershell
cd "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow"
.\test-backend.ps1
```

**Todos os testes devem passar:**
```
✅ Health checks: OK
✅ Subscription Tiers: OK (retorna 3 planos)
✅ Tour Steps: OK
✅ LGPD Privacy Policy: OK
✅ OpenAPI Docs: OK
✅ Login Professor Demo: OK
```

**Se algum ainda der 404:**
```bash
# Verificar commit deployed
curl https://teacherflow-backend.onrender.com/ | ConvertFrom-Json
# Deve mencionar TeacherFlow API

# Se login der 401, seed dados demo:
# (via Shell do Render)
python backend/app/seeds/seed_realistic.py
```

---

## 🌐 CONFIGURAR FRONTEND (VERCEL)

### **Passo 10: Verificar Variáveis de Ambiente Vercel**

1. Acesse: **https://vercel.com/hugoloyalconsulting/teacherflow-app**
2. Clique em **Settings** → **Environment Variables**
3. Verificar/adicionar:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `VITE_API_URL` | `https://teacherflow-backend.onrender.com/api/v1` | Production |
| `VITE_ENVIRONMENT` | `production` | Production |

**Se precisar adicionar:**
1. Clique **"Add New"**
2. Name: `VITE_API_URL`
3. Value: `https://teacherflow-backend.onrender.com/api/v1`
4. Environment: Selecione **Production**
5. Clique **"Save"**

**Repetir para VITE_ENVIRONMENT**

---

### **Passo 11: Forçar Redeploy do Frontend**

Após adicionar variáveis:

1. Vá em **Deployments**
2. Na última deployment, clique nos **3 pontinhos** (⋮)
3. Selecione **"Redeploy"**
4. Marcar: ✅ **"Use existing Build Cache"**
5. Clique **"Redeploy"**

Aguarde ~1-2 minutos.

---

## 🎉 TESTE FINAL - APLICAÇÃO COMPLETA

### **Passo 12: Acessar Frontend em Produção**

1. Abra: **https://teacherflow-app.vercel.app/**

**O que deve acontecer:**

✅ **App carrega sem erros de console**
```javascript
// Abrir DevTools (F12) → Console
// Não deve ter erros de CORS ou API
```

✅ **Pode fazer login:**
- Email: `professor.demo@teacherflow.com`
- Senha: `demo123`

✅ **Dashboard carrega com dados demo**
- Total de alunos: ~20
- Próximas aulas mostradas
- Gráficos renderizados

✅ **Novos endpoints funcionando:**
- Tour interativo pode iniciar
- Modal LGPD de consentimento (se aplicável)
- (Assinaturas ainda não estão no frontend, só backend)

---

## 🎯 CHECKLIST FINAL DE PRODUÇÃO

Marque cada item:

### **Backend (Render)**
- [ ] ✅ Deploy em Live (não "Build failed")
- [ ] ✅ Commit 5aa4398 deployed
- [ ] ✅ Endpoint `/health` retorna 200
- [ ] ✅ Endpoint `/api/v1/subscriptions/tiers` retorna 3 planos
- [ ] ✅ Endpoint `/api/v1/tour/steps` retorna array
- [ ] ✅ Endpoint `/api/v1/lgpd/privacy-policy` retorna JSON
- [ ] ✅ DATABASE_URL configurado com Neon
- [ ] ✅ Migração 004 rodada (`alembic current` mostra 004)
- [ ] ✅ 3 planos seedados no banco

### **Frontend (Vercel)**
- [ ] ✅ Deploy succeeded
- [ ] ✅ `VITE_API_URL` configurado
- [ ] ✅ `VITE_ENVIRONMENT` = production
- [ ] ✅ App abre sem erro 404
- [ ] ✅ Sem erros de CORS no console
- [ ] ✅ Login funciona

### **Integração**
- [ ] ✅ Login retorna token JWT
- [ ] ✅ Dashboard carrega dados do backend
- [ ] ✅ Alunos listados corretamente
- [ ] ✅ Aulas aparecem no calendário
- [ ] ✅ Pagamentos são consultáveis

---

## 🚨 TROUBLESHOOTING RÁPIDO

| Problema | Solução |
|----------|---------|
| **Backend 404 em /subscriptions** | Deploy não atualizou. Force "Clear build cache & deploy" |
| **Backend 500 Internal Error** | Ver Logs do Render. Provavelmente DATABASE_URL incorreto |
| **Frontend CORS Error** | Verificar `CORS_ORIGINS` no Render inclui URL do Vercel |
| **Login 401 Unauthorized** | Dados demo não seedados. Rodar `seed_realistic.py` |
| **"relation does not exist"** | Migração não rodada. Executar `alembic upgrade head` |
| **Render diz "Build failed"** | Ver Logs completos. Copiar erro e buscar solução |
| **Frontend carrega mas vazio** | `VITE_API_URL` incorreto ou backend offline |

---

## 📞 SUPORTE ADICIONAL

**Arquivos de referência criados:**
- ✅ `RENDER_SETUP_CHECKLIST.md` - Checklist técnico detalhado
- ✅ `test-backend.ps1` - Script de teste automatizado
- ✅ Este arquivo - Guia visual passo a passo

**Comandos úteis:**
```bash
# Ver logs do Render (últimas 100 linhas)
# Dashboard → Logs

# Testar endpoint específico
curl https://teacherflow-backend.onrender.com/api/v1/subscriptions/tiers

# Verificar qual commit está deployed
curl https://teacherflow-backend.onrender.com/ | ConvertFrom-Json

# Rodar script de teste completo
.\test-backend.ps1
```

---

**Última atualização:** 6 de março de 2026  
**Commit atual:** 5aa4398  
**Status:** ⏳ Aguardando manual deploy no Render  

**Próximo passo:** Ir para Passo 1 acima! 🚀
