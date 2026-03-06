# Pre-Deploy Checklist

Checklist objetivo para deploy em producao.

## 1. Codigo

- [ ] Branch correta: `main`
- [ ] `git status` limpo
- [ ] Ultimo commit com mudancas esperadas

## 2. Render

- [ ] Service apontando para repo correto
- [ ] Root Directory = `backend`
- [ ] Build Command = `pip install --upgrade pip && pip install -r requirements.txt`
- [ ] Start Command = `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Variaveis obrigatorias setadas (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`)

## 3. Banco

- [ ] `alembic upgrade head` executado no shell do Render
- [ ] Endpoints criticos respondendo

## 4. Validacao

- [ ] `./scripts/quality/test-backend.ps1`
- [ ] `GET /healthz` retorna 200
- [ ] `GET /api/v1/openapi.json` retorna 200