# TeacherFlow Backend

Backend FastAPI do TeacherFlow no monorepo.

## Visao Geral

- API REST em `backend/app/`
- Migrations em `backend/alembic/`
- Deploy em Railway com configuracao em `backend/railway.toml`

## Estrutura

```text
backend/
  app/
    core/
    models.py
    routers/
    schemas/
    services/
  alembic/
  requirements.txt
  main.py
  README.md
```

## Execucao Local

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs local: `http://localhost:8000/api/v1/docs`

## Deploy Railway

Servico usa `backend/Dockerfile` e `backend/railway.toml`.

URL atual de producao:

- Backend: `https://backend-production-c4f8f.up.railway.app`
- Docs: `https://backend-production-c4f8f.up.railway.app/docs`

## Referencias

- `../railway.json`
- `../README_RAILWAY.md`
- `../docs/deployment/GUIA_DEPLOY_FINAL.md`
- `../docs/operations/DISASTER_RECOVERY_RUNBOOK.md`