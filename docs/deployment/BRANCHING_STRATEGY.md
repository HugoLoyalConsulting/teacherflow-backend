# 🌿 TeacherFlow - Branching Strategy & Ambientes

**Última Atualização:** 7 de Março, 2026  
**Responsável:** Hugo Souza

---

## 📋 Resumo Executivo

**Modelo oficial (Railway-first):** `staging` (QA) -> `main` (Produção)

| Branch | Propósito | Railway Env | Usuários | Status |
|--------|----------|---------|----------|--------|
| **main** | Produção | Production | ✅ SIM (Beta) | ✅ ATIVO |
| **staging** | Testes/QA | Staging | ❌ NÃO | 🚧 EM IMPLANTAÇÃO |
| **master** | Legado | Desativado | ❌ NÃO | ⚠️ OBSOLETO |
| `feature/*` | Desenvolvimento | Local | ❌ NÃO | ✅ FLUXO PADRÃO |

---

## 🟢 BRANCH: `main` (PRODUÇÃO)

### Status Atual
```bash
git branch -a | grep main
* main (current)
  remotes/origin/main

git log --oneline -1 main
81fb4c3 chore: finalize Railway-only stack and remove legacy provider artifacts
```

### Propósito
- **Código em Produção**
- **Usuários Beta acessando agora**
- **Qualidade: HIGH** (code reviews antes de merge)

### Configuração Railway

**Frontend Service**
```
Name:          frontend-production-a7c5
URL:           https://frontend-production-a7c5.up.railway.app
Branch:        main (automatic on push)
Environment:   
  VITE_ENVIRONMENT=production
  VITE_API_URL=https://backend-production-c4f8f.up.railway.app/api/v1
Health Check:  GET / (Nginx)
Auto-deploy:   ✅ Sim (webhook GitHub)
```

**Backend Service**
```
Name:          backend-production-c4f8f
URL:           https://backend-production-c4f8f.up.railway.app
Branch:        main (automatic on push)
Environment:   
  ENVIRONMENT=production
  SECRET_KEY=[configured in Railway Secrets]
  DATABASE_URL=[configured in Railway Secrets]
  ENABLE_AUTOSEED=false (IMPORTANTE!)
Health Check:  GET /health
Auto-deploy:   ✅ Sim (webhook GitHub)
```

**Database Service**
```
Name:          PostgreSQL (Managed)
Shared with:   frontend + backend services
Environment:   DATABASE_URL (connection string)
Auto-backups:  ✅ Sim (daily)
```

### Fluxo de Deploy

```
Developer:
  git checkout main
  git pull origin main
  [make changes]
  git add .
  git commit -m "feat: description"
  git push origin main
       ↓
GitHub:
  Webhook triggered
  GitHub Actions run (security scan, etc.)
       ↓
Railway:
  Auto-detect código novo
  Build Services:
    ├─ backend/Dockerfile built → new image
    ├─ frontend/Dockerfile built → new image
    └─ Migrations run (alembic upgrade head)
  Deploy to Production
       ↓
Live on:
  https://frontend-production-a7c5.up.railway.app
  https://backend-production-c4f8f.up.railway.app
```

**Observação:** Deploy leva ~5-10 minutos (build + push para prod)

### Variáveis de Ambiente (Railway Secrets)

**CRÍTICAS - Estão em Railway Secrets (não em Git)**
```yaml
DATABASE_URL: "postgresql://user:pass@db.railway.internal/teacherflow"
SECRET_KEY: "seu-secret-key-min-32-chars-ALEATORIO"
ENABLE_AUTOSEED: "false"
```

**NÃO-CRÍTICAS - Estão em Railway Config (ou defaults)**
```yaml
ENVIRONMENT: "production"
DEBUG: "false"
ALGORITHM: "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: "30"
SENTRY_ENABLED: "false"
POSTHOG_ENABLED: "false"
```

**Checklist de Segurança**
- [ ] SECRET_KEY tem mínimo 32 caracteres
- [ ] SECRET_KEY é aleatório (não default)
- [ ] DATABASE_URL aponta para PostgreSQL Railway
- [ ] Nenhuma senha em Git (apenas em Railway Secrets)
- [ ] ENABLE_AUTOSEED = "false" (não quer resetar dados em prod)

### Como Mergeou em Main

**Processo Recomendado:**
1. Criar branch de feature: `git checkout -b feature/nova-coisa`
2. Fazer mudanças e testes locais
3. Commit e push: `git push origin feature/nova-coisa`
4. Criar Pull Request (GitHub) → aponta para `main`
5. Code review (se 2+ pessoas) ou just merge if solo
6. Merge com label: "ready for production"
7. Delete branch após merge
8. **Railway auto-deploys** (em ~5 min)

**❌ Evitar:**
- Push direto em `main` (sem review)
- Merge de `master` em `main` (branches legadas)
- Código com hardcoded secrets

---

## 🟡 BRANCH: `staging` (TESTES/QA)

### Status Atual
```bash
git branch -a | grep staging
  staging
  remotes/origin/staging
```

### Propósito
- **Testes de features antes de prod**
- **QA pode validar mudanças**
- **Não conectado a Railway (atualmente)**

### Configuração Recomendada

**Se quiser staging ativo no Railway:**

```
Frontend Service:
  Name:         frontend-staging-xxx
  URL:          https://frontend-staging-xxx.up.railway.app
  Branch:       staging (automatic)
  Environment:  
    VITE_ENVIRONMENT=staging
    VITE_API_URL=https://backend-staging-xxx.up.railway.app/api/v1
  
Backend Service:
  Name:         backend-staging-xxx
  URL:          https://backend-staging-xxx.up.railway.app
  Branch:       staging (automatic)
  Environment:  
    ENVIRONMENT=staging
    ENABLE_AUTOSEED=true (OK para staging, tem dados de demo)
    
Database:
  Opção 1: Mesmo PostgreSQL, tabelas separadas (prefixo staging_)
  Opção 2: PostgreSQL separado (se quiser isolamento total)
```

**Não está implementado porque:**
- Usuários beta não precisam de staging visível
- Desenvolvimento pode test build locally
- Se houver problemas em prod, revert é fácil

**Ativar Staging (se necessário):**
1. Criar novo Railway Project (opcional)
2. Conectar `staging` branch
3. Configurar seus próprios secrets
4. Documentar URL de staging para QA

### Fluxo Se Staging Ativo

```
Developer:
  git checkout staging
  branch feature/teste-novo
  [work & test locally]
  push origin feature/teste-novo
       ↓
GitHub:
  PR para staging
  Code review
       ↓
Merge em staging
       ↓
Railway auto-deploys para staging env
       ↓
QA testa em: https://frontend-staging-xxx.up.railway.app
       ↓
Se tudo OK:
  Merge staging → main (production)
  (ou create new PR)
```

---

## ⚫ BRANCH: `master` (LEGADO - DELETAR FUTURAMENTE)

### Status Atual
```bash
git branch -a | grep master
  master
  remotes/origin/master

git log --oneline -1 master
[7 commits à frente de origin/master]
```

### Problema
- Contém código antigo (Render/Vercel/Neon)
- Desatualizado comparado com `main`
- Confunde novo developers
- Não deve ser usado

### Recomendação
**Opção 1: Sincronizar e depois deletar** (mais seguro)
```bash
# Backup antes
git checkout master
git pull origin master
# Ver o que tem de diferente
git log --oneline main..master
# Se vazio, seguro deletar
git checkout main
git branch -D master
git push origin --delete master
```

**Opção 2: Deixar como arquivo (arquival)**
```bash
# Renomear para historical/render-vercel-stack
git branch -m master historical/render-vercel-backup
git push origin historical/render-vercel-backup
git push origin --delete master
```

**Opção 3: Manter apenas para referência**
```bash
# Add tag antes de deletar
git tag -a "legacy/render-vercel-neon" master -m "Last render/vercel/neon stack commit"
git push origin "legacy/render-vercel-neon"
git push origin --delete master
```

**Recomendação:** Opção 1 (deletar) ou 2 (arquivar historicamente)

---

## 🆕 BRANCH PATTERN: `feature/*`

### Padrão Recomendado
```
feature/nome-da-coisa
feature/add-google-oauth
feature/fix-cors-error
feature/refactor-payment-logic
feature/db-optimize-queries
```

### Fluxo

```bash
# 1. Partir de main com git updated
git checkout main
git pull origin main

# 2. Criar feature branch
git checkout -b feature/add-google-oauth

# 3. Fazer mudanças
[edit files]
git add .
git commit -m "feat: add google oauth signin button"

# 4. Push para origin
git push origin feature/add-google-oauth

# 5. GitHub: abrir Pull Request
# - Compare: main ← feature/add-google-oauth
# - Add title + description
# - Request review (se equipe)

# 6. Depois de aprovado, merge via GitHub
# GitHub UI: Click "Merge Pull Request"
# - Delete branch after merge
# - Railway auto-deploys

# 7. Local: cleanup
git checkout main
git pull origin main
git branch -D feature/add-google-oauth
```

### Branch Naming Conventions
```
✅ feature/user-authentication
✅ feature/add-payment-integration
✅ bugfix/fix-cors-error
✅ hotfix/database-connection-pool
✅ docs/update-deployment-guide
✅ refactor/simplify-api-models

❌ my-new-feature (ambíguo)
❌ feature_add_payments (underscore)
❌ Feature/PaymentPlatform (capital F)
❌ fix123 (não descreve)
```

---

## 🔄 SINCRONIZANDO BRANCHES

### Trazer main em staging
```bash
git checkout staging
git pull origin staging
# Ver commits a frente
git log --oneline remotes/origin/main..staging
# Se quer trazer tudo de main
git merge main
git push origin staging
```

### Trazer remote origin atualizado
```bash
git fetch origin
# Ver branches remotas atualizadas
git branch -a
```

### Antes de começar novo feature
```bash
git checkout main
git pull origin main
git pull --prune  # remove deleted remote branches locally
```

---

## 📊 STATUS DAS AUTOMAÇÕES (GitHub Actions)

Esses workflows rodam automaticamente:

### ✅ Workflows ATIVOS

**Backup Automático** (`automated-backup.yml`)
```
Trigger: Daily 3h UTC + 1st of month
Action:   Backup database + código
Artifacts: Zip + SQL dump enviado para GitHub
```

**Security Scan** (`security-scan.yml`)
```
Trigger: Weekly + on push main
Action:   TruffleHog (secrets) + pip-audit + npm audit
Report:   Publicado em GitHub Actions > Security tab
```

**README Sync Guard** (`readme-sync-guard.yml`)
```
Trigger: Push em main ou master
Action:   Valida se backend/README, frontend/README, scripts/README estão sincronizados
Falha:    Se algum readme está desatualizado
```

### ❌ Workflows DELETADOS (commit 81fb4c3)

Foram removidos com a limpeza Railway-first:
- `deploy-backend.yml` (Render specific)
- `deploy-frontend.yml` (Vercel specific)
- `deploy-dev.yml` (Render + Vercel)
- `deploy-staging.yml` (Render + Vercel)

**Railway agora usa:** Webhook direto + auto-deploy (mais simples)

---

## 🎯 FLUXO RECOMENDADO PARA NOVO FEATURE

```
Cenário: Quero adicionar autenticação Google

1. Trabalhar em feature branch
   git checkout -b feature/google-oauth
   
2. Até ter algo testável localmente
   [editar backend/auth, frontend/Login]
   [testar em http://localhost:5173]
   
3. Commit e push
   git push origin feature/google-oauth
   
4. Criar PR no GitHub
   Título: "feat: Add Google OAuth sign-in"
   Descrição: "Closes #5. Allows users to sign in with Google account"
   
5. GitHub Actions roda security scan
   Se passa: Merge ready
   
6. Merge em main
   Railway auto-detects → auto-builds → auto-deploys
   [5-10 min]
   
7. Live em https://frontend-production-a7c5.up.railway.app
   Users can now use Google Sign In!

8. Monitor logs
   railway logs frontend -f
   [watch for errors]
   
9. If problem: Revert on GitHub (ein-click)
   Or do hotfix in feature/hotfix-oauth-bug
```

---

## 🚨 EMERGENCY: Reverter Produção

Se algo ruim foi para produção:

**Quick Revert via Git:**
```bash
git log --oneline main -20
# Encontrar commit antes do break (ex: abc1234)
git revert abc1234
git push origin main
# Railway deploys revert (5-10 min)
```

**Nuclear Option (reset hard):**
```bash
# ONLY if absolutely necessary and you know what you're doing
git reset --hard HEAD~1
git push origin main --force
# ⚠️ This rewrites history, document why you did this
```

**Safe Option (keep history):**
```bash
# Use git revert (preferred, keeps history clean)
git revert [commit-hash]
git push origin main
# Railway deploys revert, history shows what happened
```

---

## 📚 DOCUMENTAÇÃO DE BRANCHES

Cada branch tem suas convenções:

**main (Produção)**
- Qualidade: Alta
- Code Review: Recomendado
- Deploy: Automático
- Users: Acessando agora
- Política: Sem breaking changes

**staging (QA - se ativar)**
- Qualidade: Média-Alta
- Code Review: Opcional
- Deploy: Automático
- Users: Testers apenas
- Política: Testes estão OK antes

**feature/** (Desenvolvimento)
- Qualidade: Em desenvolvimento
- Code Review: Necessário antes merge main
- Deploy: Local + staging
- Users: Ninguém
- Política: Branch é seu workspace

---

## 🔐 Segurança de Branches

**Proteções Recomendadas para `main`:**
```
Repository Settings > Branches > main

Require pull request reviews: YES (min 1)
Require status checks to pass: YES
  ├─ security-scan.yml
  └─ readme-sync-guard.yml
Require branches to be up to date: YES
Require code owners review: NO (se solo)
Allow auto-merge: NO (manual merge only)
Allow force push: NO
```

---

## 🎓 Exemplo Prático: Seu Primeiro Feature

### Adicionar um botão "Feedback" no dashboard

```bash
# 1. Verificar estou em main e updated
git checkout main
git pull origin main

# 2. Criar branch para feature
git checkout -b feature/add-feedback-button

# 3. Fazer mudanças
# frontend/src/pages/Dashboard.tsx:
#   - Import: import FeedbackButton from '...'
#   - Add: <FeedbackButton />

# 4. Test localmente
npm run dev
# [Testo em http://localhost:5173]
# Button aparece OK? ✅

# 5. Commit
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: add feedback button to dashboard"

# 6. Push
git push origin feature/add-feedback-button

# 7. GitHub: Criar PR
# Title: "feat: Add feedback button to dashboard"
# Description: "Lets users easily click to give feedback"

# 8. Merge via GitHub UI
# [Click green merge button]

# 9. Esperar Railway deploy
# [5-10 min]

# 10. Checar em produção
# https://frontend-production-a7c5.up.railway.app
# [Button visível para todos os users!]

# 11. Local cleanup
git checkout main
git pull origin main
git branch -D feature/add-feedback-button
```

**Total time:** ~15-20 minutos (inclusive deploy)

---

## 📞 Resumo Rápido

| Pergunta | Resposta |
|----------|----------|
| Onde está produção? | `main` branch em Railway |
| Usuários conseguem usar? | ✅ SIM, em https://frontend-production-a7c5.up.railway.app |
| Como fazer deploy? | `git push origin main` → Railway auto-deploys |
| Staging funciona? | Existe mas não está deployado no Railway |
| Como fazer feature? | `feature/nome` → PR → merge main → auto-deploy |
| Se bug em prod? | `git revert [commit]` → push → Railway redeploys |
| Master é obsoleto? | ✅ SIM, deletar ou arquivar futuramente |

---

**Última Atualização:** 7 Mar 2026  
**Próxima Revisão:** Quando houver 5+ developers
