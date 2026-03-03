# 🚀 Guia de Deploy - TeacherFlow (Completo)

**Data:** 27 de fevereiro, 2026  
**Status:** Frontend ✅ Online | Backend ⏳ Pronto para Deploy

---

## 📊 Status Atual

### ✅ COMPLETO: Frontend (Vercel)
- **URL Produção:** https://teacherflow-app.vercel.app
- **Painel:** https://vercel.com/hugoloyalconsulting-8127s-projects/teacherflow-app
- **Build:** ✅ Sucesso
- **Deploy:** ✅ Automático a cada push

### ✅ COMPLETO: Database (Neon PostgreSQL)

**Production Branch:**
```
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-mute-glade-actrhygq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**Staging Branch:**
```
postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-royal-lab-ac3axf9o-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**Development Branch:** (aguardando criação)

### ⏳ PRONTO: Backend (FastAPI)
- **Localização:** `C:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow-backend`
- **Git:** ✅ Inicializado e commitado
- **Configuração:** ✅ .env atualizado com Neon
- **SECRET_KEY:** ✅ Gerada (segura)
- **Render.yaml:** ✅ Criado

---

## 🎯 Próximos Passos (5 minutos)

### PASSO 1: Criar Repositório no GitHub

1. **Acesse:** https://github.com/new
2. **Configure:**
   - Repository name: `teacherflow-backend`
   - Description: `FastAPI backend for TeacherFlow SaaS`
   - Visibility: **Private** (recomendado) ou Public
   - ❌ **NÃO** marque "Initialize with README"
   - ❌ **NÃO** adicione .gitignore ou license (já temos)
3. **Clique:** "Create repository"

### PASSO 2: Push do Backend para GitHub

**Execute no terminal (PowerShell):**

```powershell
cd "C:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow-backend"

# Adicionar remote (SUBSTITUA 'SEU-USUARIO' pelo seu username do GitHub)
git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend-backend.git

# Renomear branch para main (se necessário)
git branch -M main

# Push para GitHub
git push -u origin main
```

**Autenticação:** Se pedir senha, use **Personal Access Token** do GitHub:
- Settings → Developer Settings → Personal Access Tokens → Generate New Token
- Permissões: `repo` (full control)

### PASSO 3: Deploy no Render

1. **Acesse:** https://render.com
2. **Login/Signup** (pode usar conta GitHub)
3. **Clique:** "New +" → "Web Service"
4. **Connect GitHub:** Autorize acesso ao repositório `teacherflow-backend`
5. **Configurações:**
   - **Name:** `teacherflow-api`
   - **Region:** Oregon (US West) - *mais próximo de São Paulo*
   - **Branch:** `main`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

6. **Environment Variables** (Adicionar cada uma):

```env
DATABASE_URL=postgresql://neondb_owner:npg_jZGViq4QOTA7@ep-mute-glade-actrhygq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require

SECRET_KEY=tQ8ktik6_VDustnAjoKET9xFMO8Oy2ea8BhzVqhQWXY

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7

DEBUG=false

API_V1_STR=/api

CORS_ORIGINS=["https://teacherflow-app.vercel.app"]
```

7. **Clique:** "Create Web Service"
8. **Aguarde:** ~5-10 minutos para primeiro deploy

### PASSO 4: Conectar Frontend ao Backend

Quando o Render terminar o deploy, você receberá uma URL tipo:
```
https://teacherflow-api.onrender.com
```

**Atualize o frontend:**

1. **Acesse:** https://vercel.com/hugoloyalconsulting-8127s-projects/teacherflow-app
2. **Settings → Environment Variables**
3. **Adicione:**
   - Key: `VITE_API_URL`
   - Value: `https://teacherflow-api.onrender.com` (sua URL do Render)
   - Environment: Production
4. **Salve e Redeploy**

### PASSO 5: Criar Primeiro Usuário

1. **Acesse:** `https://teacherflow-api.onrender.com/docs` (Swagger UI)
2. **Endpoint:** `POST /api/auth/register`
3. **Request Body:**
```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "SuaSenhaSegura123!"
}
```
4. **Execute** → Copie o `access_token` recebido
5. **Teste login** em: https://teacherflow-app.vercel.app

---

## 🔍 Verificações Finais

### ✅ Checklist de Produção

- [ ] Frontend acessível em https://teacherflow-app.vercel.app
- [ ] Backend retorna `{"status":"ok"}` em `/health`
- [ ] Swagger acessível em `/docs`
- [ ] Registro de usuário funciona
- [ ] Login retorna JWT válido
- [ ] CORS permite requests do frontend
- [ ] Database Neon conectado (sem erros)

### 🐛 Troubleshooting

**Erro: CORS blocked**
- Verifique `CORS_ORIGINS` no Render incluí a URL do Vercel

**Erro: Database connection failed**
- Verifique `DATABASE_URL` no Render está correta
- Confirme SSL está ativado (`?sslmode=require`)

**Erro: Module not found**
- Revise `requirements.txt` está completo
- Build Command correto: `pip install -r requirements.txt`

**Render ficando offline após 15 min**
- Normal no plano Free (cold starts)
- Primeira request demora ~30s para "acordar"

---

## 📈 Próximas Melhorias (Opcional)

### Fase 1: CI/CD Automático
- GitHub Actions para testes automáticos
- Deploy automático no Render após push

### Fase 2: Monitoring
- Sentry para error tracking
- LogTail/Datadog para logs
- Uptime monitoring (UptimeRobot)

### Fase 3: Staging Environment
- Branch `staging` no GitHub
- Deploy separado no Render
- Database branch Staging no Neon
- Frontend preview no Vercel

### Fase 4: Custom Domain
- Adicionar domínio próprio no Vercel
- SSL/TLS automático (Let's Encrypt)
- API em subdomínio (api.seudominio.com)

---

## 📞 Suporte

**Documentação:**
- FastAPI: https://fastapi.tiangolo.com
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs

**Problemas Comuns:**
- Ver logs no Render: Dashboard → Logs
- Ver logs no Vercel: Deployment → Function Logs
- Query logs no Neon: Dashboard → Monitoring

---

**✅ Tudo pronto! Siga os 5 passos acima para colocar o backend online.**
