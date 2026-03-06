# TeacherFlow Backend

Backend FastAPI do TeacherFlow no monorepo.

## Visao Geral

- API REST em `backend/app/`
- Migrations em `backend/alembic/`
- Deploy em Render com configuracao em `render.yaml` (raiz)

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

## Deploy Render

Servico deve usar:

- Branch: `main`
- Root Directory: `backend`
- Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Migrations apos deploy:

```bash
cd /opt/render/project/src/backend
alembic upgrade head
```

## Referencias

- `../render.yaml`
- `../docs/deployment/GUIA_DEPLOY_FINAL.md`
- `../docs/deployment/RENDER_SETUP_CHECKLIST.md`
- `../docs/operations/DISASTER_RECOVERY_RUNBOOK.md`