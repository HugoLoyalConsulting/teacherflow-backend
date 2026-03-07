# 🚂 TeacherFlow no Railway

Deploy completo do TeacherFlow (Frontend + Backend + Database) no Railway.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Configuração Manual](#configuração-manual)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Comandos Úteis](#comandos-úteis)
- [Troubleshooting](#troubleshooting)
- [Custos](#custos)

## 🏗️ Arquitetura

```
┌─────────────────┐
│    FRONTEND     │  ← Nginx + React (Vite)
│   (Container)   │     Port 8080
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│     BACKEND     │  ← FastAPI + Uvicorn
│   (Container)   │     Port 8000
└────────┬────────┘
         │ PostgreSQL Protocol
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← Railway Postgres
│   (Managed DB)  │     Port 5432
└─────────────────┘
```

## ✅ Pré-requisitos

- Node.js 18+ (para Railway CLI)
- Git configurado
- Conta GitHub conectada ao Railway

## 🚀 Instalação Rápida

### **Windows (PowerShell)**

```powershell
# 1. Vá até o projeto
cd "c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow"

# 2. Execute o script de migração
.\scripts\migrate-to-railway.ps1
```

### **Linux/Mac (Bash)**

```bash
# 1. Vá até o projeto
cd ~/teacherflow

# 2. Dê permissão de execução
chmod +x scripts/migrate-to-railway.sh

# 3. Execute o script
./scripts/migrate-to-railway.sh
```

O script irá:
- ✅ Instalar Railway CLI (se necessário)
- ✅ Fazer login no Railway
- ✅ Criar projeto e serviços
- ✅ Adicionar PostgreSQL
- ✅ Configurar variáveis de ambiente
- ✅ Fazer deploy automático

**Tempo estimado**: 5-10 minutos

## ⚙️ Configuração Manual

Se preferir configurar manualmente ou via Dashboard:

### **1. Via Railway CLI**

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init --name teacherflow-prod

# Adicionar PostgreSQL
railway add --database postgresql

# Deploy backend
cd backend
railway up --service backend

# Configurar variáveis (ver seção abaixo)
railway variables set --service backend \
  DATABASE_URL='${{Postgres.DATABASE_URL}}' \
  SECRET_KEY="$(openssl rand -hex 32)" \
  ENVIRONMENT="production"

# Deploy frontend
cd ../frontend
railway up --service frontend

# Configurar variáveis frontend
BACKEND_URL=$(railway status --service backend --json | jq -r '.url')
railway variables set --service frontend \
  VITE_API_URL="$BACKEND_URL/api/v1" \
  VITE_ENVIRONMENT="production"
```

### **2. Via Railway Dashboard** (Mais Fácil)

1. **Acesse**: https://railway.app/new
2. **Conecte GitHub**: Selecione repositório `teacherflow-backend`
3. **Crie 3 Serviços**:

   **PostgreSQL**:
   - Add → Database → PostgreSQL

   **Backend**:
   - New Service → Backend
   - Root Directory: `backend`
   - Builder: Dockerfile
   - Start Command: (auto-detectado)

   **Frontend**:
   - New Service → Frontend
   - Root Directory: `frontend`
   - Builder: Dockerfile
   - Port: 8080

4. **Configure Variáveis** (ver seção abaixo)
5. **Deploy Automático**!

## 🔐 Variáveis de Ambiente

### **Backend Service**

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-injetado pelo Railway |
| `SECRET_KEY` | `<random-32-hex>` | Gerar com `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` | Algoritmo JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Expiração token acesso |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Expiração token refresh |
| `DEBUG` | `false` | Modo debug desativado |
| `API_V1_STR` | `/api/v1` | Prefixo da API |
| `ENVIRONMENT` | `production` | Ambiente de execução |
| `CORS_ORIGINS` | `https://frontend-xxx.up.railway.app` | URLs permitidas (CORS) |

### **Frontend Service**

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_URL` | `https://backend-xxx.up.railway.app/api/v1` | URL da API backend |
| `VITE_ENVIRONMENT` | `production` | Ambiente frontend |
| `VITE_GOOGLE_CLIENT_ID` | `<seu-client-id>` | OAuth Google (opcional) |

### **Como Configurar via CLI**

```bash
# Backend
railway variables set --service backend \
  DATABASE_URL='${{Postgres.DATABASE_URL}}' \
  SECRET_KEY="$(openssl rand -hex 32)" \
  ALGORITHM="HS256" \
  ACCESS_TOKEN_EXPIRE_MINUTES="30" \
  REFRESH_TOKEN_EXPIRE_DAYS="7" \
  DEBUG="false" \
  API_V1_STR="/api/v1" \
  ENVIRONMENT="production" \
  CORS_ORIGINS="https://your-frontend.up.railway.app"

# Frontend
railway variables set --service frontend \
  VITE_API_URL="https://your-backend.up.railway.app/api/v1" \
  VITE_ENVIRONMENT="production"
```

### **Como Configurar via Dashboard**

1. Railway Dashboard → Seu Projeto
2. Selecione Service (backend ou frontend)
3. Variables → Add Variable
4. Cole as variáveis acima

## 📝 Comandos Úteis

### **Logs em Tempo Real**

```bash
# Backend
railway logs --service backend --follow

# Frontend
railway logs --service frontend --follow

# Postgres
railway logs --service Postgres --follow
```

### **Ver Variáveis**

```bash
# Listar todas variáveis de um serviço
railway vars --service backend

# Ver valor específico
railway vars --service backend | grep SECRET_KEY
```

### **Abrir Dashboard**

```bash
railway dashboard
```

### **Conectar ao PostgreSQL**

```bash
# Via CLI (abre psql)
railway connect Postgres

# Comandos úteis no psql:
\l              # Listar databases
\dt             # Listar tabelas
\d+ users       # Descrever tabela users
SELECT COUNT(*) FROM users;
\q              # Sair
```

### **Restart Serviço**

```bash
railway restart --service backend
railway restart --service frontend
```

### **Ver Status**

```bash
railway status

# JSON output (para scripting)
railway status --json
```

### **Deploy Manual**

```bash
railway up --service backend
railway up --service frontend
```

### **Rollback**

```bash
# Listar deployments
railway deployments --service backend

# Rollback para deployment específico
railway rollback --service backend --deployment <deployment-id>
```

## 🌐 Domínio Custom

### **Via CLI**

```bash
# Adicionar domínio ao frontend
railway domain --service frontend

# Railway fornecerá um CNAME para adicionar ao seu DNS
# Exemplo: app.teacherflow.com → teacherflow-prod.up.railway.app
```

### **Via Dashboard**

1. Service Settings → Networking → Custom Domain
2. Add Domain: `app.teacherflow.com`
3. Copie o CNAME target
4. No seu DNS provider, adicione:
   ```
   Type: CNAME
   Name: app
   Target: teacherflow-prod.up.railway.app
   TTL: 3600
   ```
5. SSL automático em ~5 minutos ✅

## 🔍 Troubleshooting

### **Build Falha**

```bash
# Ver logs detalhados do build
railway logs --service backend

# Rebuild forçado (limpa cache)
railway up --service backend --force
```

### **Database Connection Error**

```bash
# Verificar se PostgreSQL está rodando
railway status | grep Postgres

# Testar conexão manualmente
railway connect Postgres
\conninfo  # Ver info da conexão
```

### **Frontend não Carrega Backend (CORS)**

```bash
# Verificar CORS configurado
railway vars --service backend | grep CORS

# Atualizar CORS com URL do frontend
railway variables set --service backend \
  CORS_ORIGINS="https://frontend-prod-xxx.up.railway.app,http://localhost:5173"
```

### **Container Crashando**

```bash
# Ver logs de crash
railway logs --service backend --tail 100

# Verificar health check
railway status --service backend

# Verificar variáveis obrigatórias
railway vars --service backend
```

### **Build Demora Muito**

Railway tem timeout de 10 minutos para build. Se ultrapassar:

1. Otimize Dockerfile (multi-stage builds)
2. Use cache de dependências
3. Reduza tamanho de imagem

## 💰 Custos

### **Planos Railway**

| Plano | Crédito Mensal | Preço |
|-------|----------------|-------|
| **Hobby** | $5 USD | Grátis |
| **Developer** | $20 USD | $20/mês |
| **Team** | $50 USD | $50/mês |

### **Consumo Estimado TeacherFlow**

| Recurso | Uso Médio | Custo/Mês |
|---------|-----------|-----------|
| **Backend** (FastAPI) | 100-150h runtime | $3-4 |
| **Frontend** (Nginx) | 50-80h runtime | $1-2 |
| **PostgreSQL** (500MB) | Dados + backups | $1-1.5 |
| **Network** (bandwidth) | <1GB egress | <$0.50 |
| **Total** | - | **$5.50-8/mês** |

### **Otimização de Custos**

✅ **Cabe no Hobby Plan ($5)** se:
- Baixo tráfego (<1000 req/dia)
- Database <500MB
- Poucos usuários simultâneos

⚠️ **Precisa Developer ($20)** se:
- Médio tráfego (>5000 req/dia)
- Database >500MB
- Uptime crítico

💡 **Dica**: Usa o crédito de $5/mês inicialmente. Railway avisa quando está acabando.

## 📊 Monitoramento

### **Dashboard Built-in**

- **Métricas**: CPU, RAM, Network (tempo real)
- **Logs**: Últimos 7 dias (searchable)
- **Deploys**: Histórico de 10 últimos
- **Usage**: Consumo de crédito

### **Alertas**

Configure webhooks para alertas:

```bash
# Webhook quando deploy completa
railway webhook create --url https://seu-webhook.com/deploy
```

## 🔄 Migração de Dados

Se você já tem dados em outro banco (como Neon):

### **1. Exportar do Neon**

```bash
# Via pg_dump
pg_dump "$NEON_DATABASE_URL" > backup.sql
```

### **2. Importar no Railway**

```bash
# Obter Railway DATABASE_URL
RAILWAY_DB_URL=$(railway vars --service backend | grep DATABASE_URL | cut -d'=' -f2-)

# Importar
psql "$RAILWAY_DB_URL" < backup.sql
```

### **3. Verificar Dados**

```bash
railway connect Postgres

SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM students;
\q
```

## 🚫 Desativar/Pausar Serviços

Para economizar crédito:

```bash
# Pausar serviço (não cobra)
railway down --service backend

# Reativar
railway up --service backend
```

## 📚 Recursos

- **Documentação Railway**: https://docs.railway.app
- **Discord Railway**: https://discord.gg/railway
- **Templates**: https://railway.app/templates
- **Status Page**: https://railway.statuspage.io

## ❓ Suporte

- **Community Discord**: Perguntas gerais, ~15k membros ativos
- **GitHub Issues**: Bugs do Railway CLI
- **Twitter**: @railwayapp (time responde)
- **Email**: team@railway.app (1-2 dias)

---

## ✅ Checklist Pós-Migração

```
□ Backend rodando (https://backend-xxx.up.railway.app/api/v1/docs)
□ Frontend rodando (https://frontend-xxx.up.railway.app)
□ Database conectado (testar login no app)
□ CORS configurado corretamente
□ Variáveis de ambiente validadas
□ SSL ativo (https://)
□ Logs sem erros
□ Domínio custom configurado (opcional)
□ Monitoramento dashboard verificado
□ Backup de dados anteriores (se aplicável)
□ Desativar Vercel/Render antigos (após confirmar)
```

---

**Última atualização**: Março 2026  
**Versão Railway**: 50.x  
**Custo base**: $5-8/mês (baixo tráfego)
