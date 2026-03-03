# 🎓 TEACHERFLOW - MONOREPO CONSOLIDADO

## ✅ Status Atual

- ✅ Frontend (React + Vite) em `teacherflow/frontend/`
- ✅ Backend (FastAPI + Python) em `teacherflow/backend/`
- ✅ GitHub Actions para deploy automático
- ✅ Zero portas abertas no seu PC

**Tudo em uma pasta. Deploy automático. Pronto para usar.**

---

## 🚀 5 MINUTOS PARA FUNCIONAR

### Passo 1: Verificar que tudo está lá
```bash
cd c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow

# Você vai ver:
dir
```

Espera ver:
```
frontend/     ← seu React
backend/      ← seu FastAPI
.github/      ← automação
START.md      ← guia
QUICKSTART.md
README.md
```

### Passo 2: Configurar Git (primeira vez)
```bash
cd c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow

# Configurar seu nome/email
git config user.email "seu.email@gmail.com"
git config user.name "Hugo Souza"

# Conectar ao repositório GitHub
git remote add origin https://github.com/HugoLoyalConsulting/teacherflow-backend.git
```

**Nota:** Crie o repositório em https://github.com/new antes se não tiver criado.

### Passo 3: Fazer primeiro push
```bash
cd c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow

git add .
git commit -m "Initial monorepo consolidation"
git branch -M main
git push -u origin main
```

### Passo 4: Configurar Secrets no GitHub (crítico!)
Vá para: `https://github.com/HugoLoyalConsulting/teacherflow-backend/settings/secrets/actions`

Clique em "New repository secret" e adicione:

#### 4a. VERCEL_TOKEN
- Valor: Token do Vercel (https://vercel.com/account/tokens)
- Nome: `VERCEL_TOKEN`

#### 4b. VERCEL_ORG_ID  
- Valor: Seu org ID (no Vercel, Settings → General)
- Nome: `VERCEL_ORG_ID`

#### 4c. VERCEL_PROJECT_ID
- Valor: ID do projeto Frontend (Vercel)
- Nome: `VERCEL_PROJECT_ID`

#### 4d. RENDER_DEPLOY_HOOK
- Valor: Webhook URL do serviço no Render
- Nome: `RENDER_DEPLOY_HOOK`

### Passo 5: Aguardar deploy
GitHub Actions vai:
1. ✅ Testar código (2 min)
2. ✅ Compilar React para produção
3. ✅ Deploy em Vercel
4. ✅ Testar API
5. ✅ Deploy em Render

**Total: ~5 minutos**

---

## 🌐 Após Deploy

Seu app estará em:

```
Frontend:  https://teacherflow.vercel.app
Backend:   https://teacherflow-api.onrender.com
API Docs:  https://teacherflow-api.onrender.com/api/v1/docs
GitHub:    https://github.com/HugoLoyalConsulting/teacherflow-backend
```

---

## 🔄 Daqui em Diante (Fluxo Padrão)

Sempre que quiser fazer uma mudança:

### 1. Edite arquivo
```bash
# Abra em VS Code ou seu editor favorito
code .

# Edite o arquivo que quiser
# Exemplos:
# - frontend/src/App.tsx
# - backend/app/models.py
# - frontend/index.html
```

### 2. Commit e Push
```bash
git add .
git commit -m "Descrição da mudança"
git push
```

### 3. Deploy automático acontece
- GitHub Actions começa automaticamente
- Deploy em Vercel (~2 min)
- Deploy em Render (~2 min)

### 4. Acesse online
```
https://teacherflow.vercel.app
```

**Pronto! Mudança em produção!**

---

## ❌ O que NÃO fazer

```bash
# ❌ NUNCA faça isso:
python main.py              # Não roda localmente
npm run dev                 # Não dev localmente  
npm run build               # Não compila localmente

# ✅ Só faça isso:
git push                    # Tudo que precisa!
```

**Por quê?** Porque:
- Nenhuma porta abre no seu PC ✅
- GitHub Actions faz tudo automaticamente ✅
- 100% seguro ✅

---

## 🧪 Exemplos de Mudanças

### Exemplo 1: Corrigir typo no frontend
```bash
# 1. Edite
code frontend/src/components/Header.tsx

# 2. Mude algo (ex: "Bem vindo" → "Bem-vindo")

# 3. Push
git add .
git commit -m "Fix typo in header"
git push

# 4. Espere 4 minutos
# 5. Acesse https://teacherflow.vercel.app
# 6. Vê a mudança ao vivo! ✅
```

### Exemplo 2: Corrigir bug no backend
```bash
# 1. Edite
code backend/app/routers/lessons.py

# 2. Corrija a função create_lesson()

# 3. Push  
git add .
git commit -m "Fix lesson creation logic"
git push

# 4. Espere 4 minutos
# 5. Acesse https://teacherflow-api.onrender.com/api/v1/docs
# 6. Mudança em produção! ✅
```

### Exemplo 3: Adicionar um novo campo ao banco
```bash
# 1. Elite
code backend/app/models.py

# 2. Adicione um novo campo à classe Student

# 3. Push
git add .
git commit -m "Add new field to Student model"
git push

# 4. Render vai aplicar migrations automaticamente

# 5. Pronto!
```

---

## 📊 Estrutura Explicada

```
teacherflow/
│
├── frontend/               ← React (Vercel)
│   ├── src/
│   │   ├── components/     ← Componentes React
│   │   ├── pages/          ← Páginas
│   │   ├── App.tsx         ← App principal
│   │   └── main.tsx        ← Entry point
│   ├── package.json        ← Deps do Next
│   ├── vite.config.ts      ← Config Vite
│   └── tsconfig.json       ← TypeScript
│
├── backend/                ← FastAPI (Render)
│   ├── app/
│   │   ├── models.py       ← Banco de dados
│   │   ├── routers/        ← Endpoints API
│   │   ├── services/       ← Lógica
│   │   ├── schemas.py      ← Validação
│   │   └── main.py         ← App principal
│   ├── alembic/            ← Migrations
│   ├── tests/              ← Testes
│   ├── requirements.txt    ← Deps Python
│   └── main.py             ← Entrypoint
│
├── .github/
│   └── workflows/          ← Automação
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── .gitignore              ← Ignora node_modules, __pycache__, etc
├── package.json            ← Scripts root 
├── README.md               ← Documentação
├── START.md                ← Este arquivo
└── QUICKSTART.md
```

---

## 🔐 Segurança

| Componente | Segurança |
|-----------|-----------|
| Seu PC | Nenhuma porta aberta ✅ |
| GitHub | Seu código privado (se repo privado) ✅ |
| Vercel | Hospedagem segura HTTPS ✅ |
| Render | Hospedagem segura HTTPS ✅ |
| API | JWT auth + CORS ✅ |

**Sempre seguro. Sempre atualizado.**

---

## 📞 Troubleshooting

### GitHub Actions falha
1. Vá para `Actions` no seu repo
2. Veja qual workflow falhou
3. Clique nele para ver logs
4. Procure pelo erro em vermelho
5. Corrija localmente e faça novo push

### Deploy não aparece
- Vercel: https://vercel.com/your-projects
- Render: https://dashboard.render.com
- Veja os logs de deploy

### Preciso reverter uma mudança
```bash
git revert HEAD~1  # Volta para commit anterior
git push
```

### E se eu fiz push errado?
```bash
git reset --soft HEAD~1   # Desfaz commit mas mantém arquivos
git commit -m "Novo commit"
git push --force
```

---

## ✨ Resultado Final

**O que você tem agora:**

```
✅ Um repositório unificado (frontend + backend)
✅ Deploy automático ao fazer git push
✅ Tudo online (Vercel + Render)
✅ Zero portas locais abertas
✅ CI/CD completo (testes automáticos)
✅ Padrão de indústria
✅ Pronto para produção
✅ Fácil de manter
```

---

## 🎯 Checklist Final

- [ ] Clone/navegue para `c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow\`
- [ ] Confirme que tem `frontend/`, `backend/`, `.github/`
- [ ] Configure user.email e user.name em git
- [ ] Crie repositório no GitHub (se ainda não tiver)
- [ ] Adicione remote: `git remote add origin https://...`
- [ ] Faça primeiro push: `git push -u origin main`
- [ ] Configure 4 secrets no GitHub
- [ ] Espere deployment completar
- [ ] Acesse seu app em produção
- [ ] Celebre! 🎉

---

## 🚀 Você está pronto!

```bash
cd c:\Users\Hugo Souza\OneDrive\Documentos\Python Scripts\teacherflow
git push
```

Pronto. Seu app funciona. Automático. Online. Seguro.

---

**Data:** Março 3, 2026  
**Status:** 🟢 Monorepo criado e pronto  
**Próxima ação:** `git push`
