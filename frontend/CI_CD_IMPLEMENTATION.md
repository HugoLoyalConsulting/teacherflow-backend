# 🔄 Auto-Deploy Continuous Sync - Documento de Implementação

## O que foi implementado?

### ✅ GitHub Actions Workflows

#### 1. Frontend: `.github/workflows/deploy-frontend.yml`
- **Quando dispara:** A cada push em `main` ou `develop` com mudanças em `src/`, `package.json`, configs
- **O que faz:**
  1. ✅ Faz checkout do código
  2. ✅ Instala Node.js 18
  3. ✅ Instala dependências (`npm install`)
  4. ✅ Roda linter (aviso, não falha build)
  5. ✅ Roda testes (aviso, não falha build)
  6. ✅ Build do app (`npm run build`)
  7. ✅ **Deploy automático para Vercel** (2-3 minutos)
  8. ✅ Comenta no PR/commit com status

#### 2. Backend: `.github/workflows/deploy-backend.yml`
- **Quando dispara:** A cada push em `main` com mudanças em `app/`, `requirements.txt`, configs
- **O que faz:**
  1. ✅ Faz checkout do código
  2. ✅ Setup Python 3.11
  3. ✅ Instala dependências (`pip install -r requirements.txt`)
  4. ✅ Lint com flake8 (aviso)
  5. ✅ Testes com pytest (se existirem)
  6. ✅ Verifica import da app
  7. ✅ **Envia webhook para Render** para triggar deploy (1-2 minutos)
  8. ✅ Notifica no commit com status

---

## 🔑 Variáveis de Ambiente Necessárias

### GitHub Secrets (Vercel - Frontend)
```
VERCEL_TOKEN         → Token de autenticação Vercel
VERCEL_ORG_ID        → ID da organização/time Vercel  
VERCEL_PROJECT_ID    → ID do projeto TeacherFlow no Vercel
```

### GitHub Secrets (Render - Backend)
```
RENDER_SERVICE_ID    → ID do serviço (srv-xxxxxxxxxx)
RENDER_DEPLOY_KEY    → Chave de deploy do webhook
```

---

## 📍 Arquivos Criados

```
TeacherFlow App/
└── .github/
    └── workflows/
        └── deploy-frontend.yml    ← NOVO

teacherflow-backend/
└── .github/
    └── workflows/
        └── deploy-backend.yml     ← NOVO

Python Scripts/
└── SETUP_DEPLOYMENT.md            ← NOVO (Este arquivo)
```

---

## 🎯 Próximas Etapas para Ativar

### 1. Crie tokens em Vercel e Render
   - Vercel: https://vercel.com/account/tokens
   - Render: https://dashboard.render.com (Deploy Hook)

### 2. Adicione secrets no GitHub
   - Frontend: `https://github.com/YOUR_USERNAME/TeacherFlow-App/settings/secrets/actions`
   - Backend: `https://github.com/YOUR_USERNAME/teacherflow-backend/settings/secrets/actions`

### 3. Teste fazendo um push
   ```bash
   git add .
   git commit -m "test: verificar deploy automático"
   git push origin main
   ```

### 4. Monitore no GitHub Actions
   - Frontend: `https://github.com/YOUR_USERNAME/TeacherFlow-App/actions`
   - Backend: `https://github.com/YOUR_USERNAME/teacherflow-backend/actions`

---

## 🔄 Fluxo de Sincronização

```
[Seu editor local]
       │
       │ git push origin main
       ▼
[GitHub Repository]
       │
       │ Webhook detecta push
       ▼
[GitHub Actions]
       │
       ├─ Build ✓
       ├─ Testes ✓
       └─ Deploy webhook enviado
              │
              ▼
        [Vercel / Render]
              │
              │ Recebe webhook
              ▼
        [Build & Deploy]
              │
              ▼
        [Ambiente Online 🎉]
              │
              ▼
        [Usuários veem mudanças]
```

**Tempo total: 3-5 minutos do push para live**

---

## 🧪 Verificação do Setup

Execute esses comandos para verificar se tudo foi criado:

```bash
# Verificar estrutura frontend
ls -R "TeacherFlow App/.github/workflows"
# Deve mostrar: deploy-frontend.yml

# Verificar estrutura backend  
ls -R "teacherflow-backend/.github/workflows"
# Deve mostrar: deploy-backend.yml

# Verificar síntaxe YAML (se tiver yamllint)
yamllint "TeacherFlow App/.github/workflows/deploy-frontend.yml"
yamllint "teacherflow-backend/.github/workflows/deploy-backend.yml"
```

---

## 🚨 Verificação de Erro

Se os workflows não rodarem:

1. **Verifique estrutura de diretórios:**
   ```bash
   find . -name "*.yml" -path "*/.github/workflows/*"
   ```

2. **Verifique sintaxe YAML:**
   - Arquivo começam com `name:`
   - `on:` define eventos
   - `jobs:` contém as tarefas

3. **Verifique naming:**
   - Arquivo deve estar em `.github/workflows/` (exato)
   - Extensão deve ser `.yml` (não `.yaml`)

4. **Verificar em GitHub:**
   - Actions devem aparecer após push
   - Se não aparecerem, há erro na sintaxe

---

## 📝 Notas Importantes

- ✅ Os workflows só executam se os arquivos estiverem no branch `main` ou `develop`
- ✅ Primeira execução pode levar 5-7 minutos (download dependências)
- ✅ Execuções subsequentes serão mais rápidas (~2-3 min)
- ✅ Erros de build não impedem notifications (informativo)
- ✅ Backend só deploy na branch `main` (segurança)
- ⚠️ Frontend deploy automaticamente em `develop` (staging) e `main` (produção)

---

## 🎉 Sucesso!

Quando você vir verificações verdes no GitHub Actions e o app atualizado no Vercel/Render, tudo está funcionando! ✅

**Resumo:** Toda edição agora sincroniza automaticamente! 🚀
