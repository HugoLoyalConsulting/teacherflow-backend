# 🎯 TeacherFlow - Estrutura Monorepo

**Data:** 3 de Março de 2026  
**Status:** ✅ Consolidado em uma única pasta

---

## 📁 Estrutura do Projeto

```
teacherflow/  (Raiz única)
│
├── frontend/              ← React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── backend/               ← FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── .gitignore
├── package.json           ← Root package (workspaces)
├── README.md              ← Documentação principal
├── MONOREPO_STRUCTURE.md  ← Este arquivo
└── SETUP_LOCAL_DEV.md     ← Como rodar localmente
```

---

## 🚀 Como Começar (Desenvolvimento Local)

### Setup Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/HugoLoyalConsulting/teacherflow-backend.git
cd teacherflow-backend

# 2. Instale dependências (ambos)
npm install
cd backend && pip install -r requirements.txt && cd ..
```

### Rodar em Desenvolvimento

```bash
# Opção A: Rodar ambos simultaneamente
npm run dev

# Opção B: Rodar separadamente (em terminais diferentes)
npm run dev:frontend   # Terminal 1 - http://localhost:5173
npm run dev:backend    # Terminal 2 - http://localhost:8000
```

### Build para Produção

```bash
npm run build
```

### Rodar Testes

```bash
# Tudo
npm run test

# Só frontend
npm run test:frontend

# Só backend
npm run test:backend
```

---

## 📦 Organização de Pastas

### Frontend (`/frontend`)
- **src/** - Código fonte React
- **package.json** - Dependências Node.js
- **vite.config.ts** - Config Vite
- **tsconfig.json** - Config TypeScript

### Backend (`/backend`)
- **app/** - Código FastAPI
  - `main.py` - Entry point
  - `models.py` - Modelos SQLAlchemy
  - `routers/` - Endpoints API
  - `schemas/` - Validação Pydantic
  - `services/` - Lógica de negócio
- **requirements.txt** - Dependências Python
- **Dockerfile** - Para containerização
- **alembic/** - Migrations SQL

### Root
- **package.json** - Workspace root (coordena ambos)
- **.github/workflows/** - GitHub Actions CI/CD
- **.gitignore** - Arquivos ignorados pelo Git

---

## 🔄 Fluxo CI/CD Automático

```
[Edit frontend ou backend] → [git push]
                    ↓
          [GitHub Actions]
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
    [Frontend]             [Backend]
    └─→ Lint              └─→ Lint
    └─→ Test              └─→ Test
    └─→ Build             └─→ Build
    └─→ Deploy/Vercel     └─→ Deploy/Render
                    ↓
            [Online! 🎉]
```

---

## 🔑 Configuração de Variáveis

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_id_here
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost/teacherflow
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
```

---

## 📚 Documentação Adicional

- [Setup Local Dev](./SETUP_LOCAL_DEV.md) - Como rodar na sua máquina
- [Deploy Guide](./DEPLOY_GUIDE.md) - Como fazer deploy
- [API Documentation](./README.md) - Docs da API
- [Frontend Guidelines](../frontend/README.md) - Guia frontend

---

## 🎯 Vantagens desta Estrutura

✅ **Monorepo único** - Código frontend + backend no mesmo repositório  
✅ **CI/CD unificado** - Um workflow para testar/deployer ambos  
✅ **Sincronização automática** - Push a ambos quando um muda  
✅ **Escalabilidade** - Fácil adicionar serviços futuros  
✅ **Single source of truth** - Uma verdade única para o projeto  

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/HugoLoyalConsulting/teacherflow-backend
- **Frontend (Vercel):** https://teacherflow-app.vercel.app
- **Backend (Render):** https://teacherflow-api.render.com
- **GitHub Actions:** https://github.com/HugoLoyalConsulting/teacherflow-backend/actions

---

## 📞 Troubleshooting

### Problema: "Módulos não encontrados"
```bash
# Limpe e reinstale
npm run clean
npm install
cd backend && pip install -r requirements.txt
```

### Problema: Porta 5173 (frontend) ou 8000 (backend) em uso
```bash
# Frontend - trocar porta
npm run dev:frontend -- --port 3000

# Backend - trocar porta
cd backend && python main.py --port 8001
```

### Problema: Database não conecta
```bash
# Verifique .env
cat backend/.env

# Rode migrations
cd backend && alembic upgrade head
```

---

## ✅ Estrutura Verificada

- [x] Frontend em `/frontend`
- [x] Backend em `/backend`
- [x] Workflows em `/.github/workflows`
- [x] Package.json root com workspaces
- [x] Todos em um único repositório Git
- [x] CI/CD automático para ambos

**Status:** 🟢 **Tudo em uma pasta!**

---

*Última atualização: 3 de Março de 2026*
