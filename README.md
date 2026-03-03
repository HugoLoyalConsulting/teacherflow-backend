# 🎓 TeacherFlow - Monorepo

**Gerenciador de aulas, pagamentos e inadimplência para professores**

> Tudo em uma pasta. Deploy automático. 100% online. Seguro.

---

## ⚡ O que é isto?

Frontend (React) + Backend (FastAPI) em um repositório.  
Cada `git push` faz deploy automático.

```
Seu PC
  ↓ edita arquivo
git push
  ↓
GitHub Actions (automático)
  ↓
Frontend → Vercel ✅
Backend → Render ✅
  ↓
https://teacherflow.vercel.app (online!)
```

**Nenhuma porta local aberta. Tudo online.**

---

## 🚀 3 passos para começar

### 1️⃣ Configure secrets (5 min)
👉 [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)

### 2️⃣ Primeiro push
```bash
git add .
git commit -m "Initial setup"
git push -u origin main
```

### 3️⃣ Aguarde deployment (~5 min)
GitHub Actions vai testar, compilar e fazer deploy automaticamente.

---

## 📁 Estrutura

```
teacherflow/
├── frontend/          React (Vercel)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/           FastAPI (Render)
│   ├── app/
│   ├── main.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/     Automação (GitHub Actions)
│
└── Documentação
    ├── SETUP_INSTRUCTIONS.md    ← LEIA ISTO PRIMEIRO!
    ├── GITHUB_SECRETS_SETUP.md  ← Configurar secrets
    ├── QUICKSTART.md            ← Guia rápido
    └── START.md                 ← 3 passos
```

---

## 🔄 Como usar (fluxo diário)

### Editar e fazer deploy

```bash
# 1. Edite arquivo
code frontend/src/App.tsx    # ou qualquer arquivo

# 2. Commit
git add .
git commit -m "Sua mudança"

# 3. Push (isto inicia deploy automático!)
git push

# 4. Espere ~5 minutos
# 5. Veja sua mudança em: https://teacherflow.vercel.app ✅
```

Simples assim. Nada de rodar servidor local.

---

## 🌐 URLs em Produção

| Recurso | URL |
|---------|-----|
| **Frontend** | https://teacherflow.vercel.app |
| **API** | https://teacherflow-api.onrender.com |
| **API Docs** | https://teacherflow-api.onrender.com/api/v1/docs |
| **GitHub** | https://github.com/seu-usuario/teacherflow |

---

## ⚠️ Segurança: ZERO Portas Abertas

**SUA PREOCUPAÇÃO É VÁLIDA:**

Você **NUNCA** vai rodar nada localmente.
- ❌ Nenhum `python main.py`
- ❌ Nenhum `npm run dev`
- ❌ Nenhum servidor local
- ✅ Nenhuma porta aberta no seu PC

**Fluxo 100% Online:**
1. Edita arquivo no VS Code (sem rodar nada)
2. `git push`
3. GitHub Actions testa e faz deploy
4. Seu app fica online em Vercel + Render
5. Seu PC nunca abre porta

**Zero risco de segurança.** ✅

---

## 📚 Documentação Rápida

| Arquivo | O que é |
|---------|---------|
| [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) | **LEIA ISSO PRIMEIRO** - instruções passo-a-passo |
| [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) | Como configurar os 4 secrets no GitHub |
| [QUICKSTART.md](./QUICKSTART.md) | Método online-only (sem rodar localmente) |
| [START.md](./START.md) | 3 passos simples |

---

## 🔐 Segurança

| Item | Status |
|------|--------|
| Seu PC | Nenhuma porta aberta ✅ |
| GitHub | Código privado (se repo privado) ✅ |
| Vercel | HTTPS, certificados ✅ |
| Render | HTTPS, certificados ✅ |
| API | JWT auth, CORS ✅ |

---

## ✨ Funcionalidades

- ✅ Dashboard de professor
- ✅ Gerenciar turmas e alunos
- ✅ Monitorar pagamentos
- ✅ Status "Pausado" para inadimplentes (60+ dias)
- ✅ Validação: bloqueia aulas se aluno pausado
- ✅ Relatórios de receita
- ✅ Tudo online e em tempo real

---

## 🛠️ Stack

**Frontend:**
- React 18
- TypeScript
- Vite (build rápido)
- Tailwind CSS

**Backend:**
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Pydantic (validação)

**Deployment:**
- GitHub Actions (CI/CD)
- Vercel (frontend)
- Render (backend)

---

## 📞 Próximas ações

1. **👉 [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - leia isto  
2. **👉 [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)** - configure secrets
3. **git push** - deploy automático!

---

**Status:** 🟢 Monorepo criado e pronto para usar

Última atualização: Março 2026
