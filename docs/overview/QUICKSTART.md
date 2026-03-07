# QUICKSTART - Railway

## 1) Abrir o projeto

```bash
git clone https://github.com/HugoLoyalConsulting/teacherflow-backend.git
cd teacherflow
```

## 2) Fluxo padrão

```bash
git add .
git commit -m "sua alteração"
git push origin main
```

O Railway executa o deploy automaticamente.

## 3) Endpoints de produção

- Frontend: `https://frontend-production-a7c5.up.railway.app`
- Backend: `https://backend-production-c4f8f.up.railway.app`
- Docs: `https://backend-production-c4f8f.up.railway.app/docs`

## 4) Validação rápida

```powershell
./scripts/quality/validate-stack.ps1
```

## 5) Referências

- `README_RAILWAY.md`
- `docs/overview/FOLDER_STRUCTURE.md`

## 🔄 Workflow típico

### Exemplo 1: Corrigir typo no frontend

```bash
# 1. Abra arquivo
code frontend/src/components/Header.tsx

# 2. Edite normalmente
# 3. Salve (Ctrl+S)

# 4. Commit
git add frontend/src/components/Header.tsx
git commit -m "Fix typo in header"
git push

# 5. Espere 3 minutos
# 6. Acesse https://teacherflow.vercel.app
# 7. Mudança está lá! ✅
```

### Exemplo 2: Corrigir bug no backend

```bash
# 1. Abra arquivo
code backend/app/routers/lessons.py

# 2. Edite a função
# 3. Salve

# 4. Commit
git add backend/app/routers/lessons.py
git commit -m "Fix lesson creation validation"
git push

# 5. Espere 3 minutos
# 6. Acesse https://teacherflow-backend.onrender.com/api/v1/docs
# 7. Mudança está produção! ✅
```

---

## 🧪 Testar é Opcional

Se quiser testar **localmente antes de fazer push** (opcional):

```bash
# Terminal 1:
cd backend && pip install -r requirements.txt && python main.py

# Terminal 2:
cd frontend && npm install && npm run dev
```

Mas **não é necessário**. Você pode:
- Editar
- Git push
- Pronto!

---

## 🚨 Se Algo der Errado

### Ver logs de deploy
1. Vá para https://github.com/HugoLoyalConsulting/teacherflow-backend/actions
2. Clique na build que falhou
3. Veja o erro

### Reverter mudança
```bash
git revert HEAD
git push
```

Volta para versão anterior em ~3 minutos.

---

## 💡 Dicas

### 1. Editar e testar antes
Se quer testar localmente (opcional):
```bash
# Apenas para debug - sem necessidade de rodar
# Você pode editar e rodar uma única função em Python
# Ou abrir .html em navegador
```

### 2. Commits pequenos
```bash
# Bom:
git commit -m "Fix validation in create_lesson"

# Ruim:
git commit -m "Updates"
```

### 3. Branch para dev
```bash
git checkout -b feature/my-feature
git push origin feature/my-feature
# Faz PR para revisar antes
# Depois merge para main
```

---

## 🌐 URLs de Produção

| Recurso | URL |
|---------|-----|
| **Frontend** | https://teacherflow.vercel.app |
| **API Docs** | https://teacherflow-backend.onrender.com/api/v1/docs |
| **Dashboard de Pagamentos** | https://teacherflow.vercel.app/dashboard |
| **GitHub** | https://github.com/HugoLoyalConsulting/teacherflow-backend |

---

## ⚙️ Configuração Automática Necessária

**Uma única vez:**

1. **GitHub**
   - Repo criado e sincronizado ✅

2. **Vercel** (para frontend)
   - Conectar seu GitHub
   - Selecionar repo `teacherflow`
   - Definir ENVIRONMENT VARIABLES
   - Pronto!

3. **Render** (para backend)
   - Conectar seu GitHub
   - Selecionar repo `teacherflow`
   - Apontar para `backend/` folder
   - Definir DATABASE_URL
   - Definir SECRET_KEY
   - Ativar deploy automático
   - Pronto!

Depois disso: **git push = Deploy automático**

---

## 🎯 Checklist

- [ ] Clone repositório
- [ ] Configure Vercel (uma vez)
- [ ] Configure Render (uma vez)
- [ ] Edite arquivo
- [ ] `git commit` + `git push`
- [ ] Espere 3 minutos
- [ ] Acesse online
- [ ] Pronto! ✅

---

## ❓ FAQ

### Meu PC fica aberto ao público?
❌ Não. Nenhuma porta abre. Tudo fica online em Vercel/Render.

### Preciso manter meu PC ligado?
❌ Não. Push e desliga.

### Como faço para testar localmente?
Opcional. Se quiser: `python main.py` + `npm run dev`. Mas não é necessário.

### Quanto tempo até estar online?
~3 minutos desde o push.

### Posso reverter?
Sim: `git revert HEAD && git push`

### E se GitHub Actions falhar?
Veja logs em https://github.com/HugoLoyalConsulting/teacherflow-backend/actions

---

## 🔄 Resumo

1. **Edite localmente** (sem rodar)
2. **Git push**
3. **Tudo funciona online** (Vercel + Render)
4. **Zero portas abertas no seu PC**

---

**Status:** 🟢 Pronto para usar!

*Última atualização: Março 2026*
