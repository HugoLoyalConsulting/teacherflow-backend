# START - Railway First

Este repositório está padronizado para deploy no Railway.

## 1) URLs de produção

- Frontend: `https://frontend-production-a7c5.up.railway.app`
- Backend: `https://backend-production-c4f8f.up.railway.app`
- API Docs: `https://backend-production-c4f8f.up.railway.app/docs`

## 2) Fluxo de atualização

1. Edite o código.
2. Faça `git commit` e `git push`.
3. Railway gera novo deploy automaticamente.

## 3) Configuração de plataforma

- Deploy principal: `README_RAILWAY.md`
- Config global: `railway.json`
- Backend: `backend/railway.toml`
- Frontend: `frontend/railway.toml`

## 4) Smoke tests rápidos

```powershell
./scripts/quality/validate-stack.ps1
./scripts/quality/test-backend.ps1
```

## 5) Observação

Arquivos legados de Vercel/Render/Neon foram removidos para evitar drift operacional.

---

**Fácil? Agora vai!** 🚀

```bash
git push
```
