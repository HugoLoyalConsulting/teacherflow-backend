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
9. Value: `prj_yeMTwuvFngWD86HMUN4nAjVjrVr7`
10. "Add secret"

---

## Passo 5: Adicione `RENDER_API_KEY` e `RENDER_SERVICE_ID`

**💰 IMPORTANTE:** Estamos usando a **API do Render** (grátis) ao invés de webhooks (pagos).

### Obter RENDER_API_KEY:

1. Vá para https://dashboard.render.com/account/settings
2. Role até a seção **"API Keys"**
3. Clique em **"Create API Key"**
4. Nome: `github-actions`
5. Copie a API Key (começa com `rnd_...`)
6. Volte ao GitHub
7. **"New repository secret"**
8. Nome: `RENDER_API_KEY`
9. Value: `rnd_xxxxxxxxxxxxx` (cole sua API key)
10. "Add secret"

### Adicionar RENDER_SERVICE_ID:

Este já sabemos: `srv-d6h09fhaae7s73bl4v6g`

1. Volte ao GitHub Secrets
2. **"New repository secret"**
3. Nome: `RENDER_SERVICE_ID`
4. Value: `srv-d6h09fhaae7s73bl4v6g`
5. "Add secret"

---

## ✅ Verificar se ficou certo

Vá para:
```
https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions
```

Você deve ver **5 secrets**:
```
✓ VERCEL_TOKEN
✓ VERCEL_ORG_ID
✓ VERCEL_PROJECT_ID
✓ RENDER_API_KEY           ← NOVO (Render API Key)
✓ RENDER_SERVICE_ID         ← NOVO (srv-d6h09fhaae7s73bl4v6g)
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
1. Ler os 5 secrets
2. Testar frontend
3. Deploy em Vercel (usando VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
4. Testar backend
5. Rodar security audit (pip-audit)
6. Deploy em Render via API (usando RENDER_API_KEY, RENDER_SERVICE_ID)

Tudo automático! ✅

**🆓 Por quê API ao invés de webhook?**
- Webhooks do Render são pagos ($7/mês)
- API é gratuita e funciona igualmente bem
- Deploy em ~30 segundos (webhook seria instantâneo, mas API é rápido o suficiente)

---

## ❓ E se algo não funcionar?

1. Vá para **Actions** no seu repo
2. Clique na build que falhou
3. Procure pelo erro (em vermelho)
4. Comum: Secrets com nome errado ou valor vazio

Solução: Verifica se os 5 secrets estão exatamente com esses nomes:
- `VERCEL_TOKEN` ← EXATO
- `VERCEL_ORG_ID` ← EXATO
- `VERCEL_PROJECT_ID` ← EXATO
- `RENDER_API_KEY` ← EXATO (novo!)
- `RENDER_SERVICE_ID` ← EXATO (novo!)

Os nomes têm que ser EXATAMENTE assim (maiúsculas, sem espaço).

---

**Pronto!** ✨ Deploy automático configurado. Agora todo `git push` vai:
1. Rodar testes
2. Fazer deploy em Vercel
3. Fazer deploy em Render
4. ~5 minutos e tudo online!
