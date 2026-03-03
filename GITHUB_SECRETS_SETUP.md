# 🔐 Configurar Secrets no GitHub

Você precisa adicionar 4 variáveis de ambiente no GitHub para o deploy automático funcionar.

---

## Passo 1: Vá para Settings → Secrets

```
https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions
```

Clique em **"New repository secret"**

---

## Passo 2: Adicione `VERCEL_TOKEN`

1. Vá para https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Dê um nome: `teacherflow-deploy`
4. Copie o token
5. Volte ao GitHub
6. Clique em **"New repository secret"**
7. Nome: `VERCEL_TOKEN`
8. Value: `Cole seu token aqui`
9. Clique em "Add secret"

---

## Passo 3: Adicione `VERCEL_ORG_ID`

Este é seu Organization ID no Vercel.

1. Vá para https://vercel.com/account/settings → General (ou Teams)
2. Procure por "Organization ID" (se tiver com Teams, vá em Teams → Select Team → Settings)
3. Se não tiver org, seu User ID funciona também
4. Copie o ID
5. Volte ao GitHub
6. **"New repository secret"**
7. Nome: `VERCEL_ORG_ID`
8. Value: `Cole seu ID aqui`
9. "Add secret"

---

## Passo 4: Adicione `VERCEL_PROJECT_ID`

Este é o ID do seu projeto Frontend no Vercel.

1. Vá para https://vercel.com/your-projects
2. Selecione o projeto **teacherflow** (front-end)
3. Vá para **Settings** → **General**
4. Procure por "Project ID"
5. Copie
6. Volte ao GitHub
7. **"New repository secret"**
8. Nome: `VERCEL_PROJECT_ID`
9. Value: `Cole aqui`
10. "Add secret"

---

## Passo 5: Adicione `RENDER_DEPLOY_HOOK`

Este é a webhook URL do seu serviço Backend no Render.

### Se você ainda não tem serviço no Render:

1. Vá para https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu GitHub
4. Selecione o repositório `teacherflow`
5. Configure:
   - Name: `teacherflow-api`
   - Root Directory: `backend`
   - Environment: `Python 3.11`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
6. Defina Environment Variables:
   - `ENVIRONMENT`: `production`
   - `DATABASE_URL`: `seu URL PostgreSQL` (pode deixar vazio por enquanto)
   - `SECRET_KEY`: `uma chave aleatória longa`
7. Clique em "Create Web Service"
8. Aguarde deploy completar

### Após serviço criado:

1. No painel do serviço Render, clique em **Settings**
2. Procure por "Deploy Hook"
3. Clique em "Create Deploy Hook"
4. Nome: `github`
5. Copie a URL gerada
6. Volte ao GitHub
7. **"New repository secret"**
8. Nome: `RENDER_DEPLOY_HOOK`
9. Value: `Cole a URL da webhook aqui`
10. "Add secret"

---

## ✅ Verificar se ficou certo

Vá para:
```
https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions
```

Você deve ver:
```
✓ VERCEL_TOKEN
✓ VERCEL_ORG_ID
✓ VERCEL_PROJECT_ID
✓ RENDER_DEPLOY_HOOK
```

---

## 🚀 Agora sim: Fazer push!

```bash
cd c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow

git add .
git commit -m "Initial monorepo consolidation"
git push -u origin main
```

GitHub Actions vai:
1. Ler os 4 secrets
2. Testar frontend
3. Deploy em Vercel (usando VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
4. Testar backend  
5. Deploy em Render (usando RENDER_DEPLOY_HOOK)

Tudo automático! ✅

---

## ❓ E se algo não funcionar?

1. Vá para **Actions** no seu repo
2. Clique na build que falhou
3. Procure pelo erro (em vermelho)
4. Comum: Secrets com nome errado ou valor vazio

Solução: Verifica se os 4 secrets estão exatamente com esses nomes:
- `VERCEL_TOKEN` ← EXATO
- `VERCEL_ORG_ID` ← EXATO
- `VERCEL_PROJECT_ID` ← EXATO
- `RENDER_DEPLOY_HOOK` ← EXATO

Os nomes têm que ser EXATAMENTE assim (maiúsculas, sem espaço).

---

**Pronto!** ✨ Deploy automático configurado. Agora todo `git push` vai:
1. Rodar testes
2. Fazer deploy em Vercel
3. Fazer deploy em Render
4. ~5 minutos e tudo online!
