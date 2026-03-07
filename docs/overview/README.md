# TeacherFlow Monorepo

Guia principal do projeto TeacherFlow com navegação por pastas e documentos.

## Leitura Recomendada

1. `docs/overview/START.md`
2. `docs/deployment/SETUP_INSTRUCTIONS.md`
3. `README_RAILWAY.md`
4. `docs/DOCUMENTATION_INDEX.md`

## Estrutura do Repositorio

- `backend/`: API FastAPI, modelos, migracoes Alembic e servicos.
- `frontend/`: aplicacao React + TypeScript.
- `.github/workflows/`: pipelines CI/CD, backup e seguranca.
- `docs/`: documentacao organizada por tema.
- `scripts/`: automacoes de backup, database, qualidade e deploy.

Detalhamento completo da arvore: `docs/overview/FOLDER_STRUCTURE.md`.

## Ambientes e URLs

- Frontend: `https://frontend-production-a7c5.up.railway.app`
- Backend: `https://backend-production-c4f8f.up.railway.app`
- OpenAPI: `https://backend-production-c4f8f.up.railway.app/docs`

## Fluxo Operacional

1. Alterar codigo/documentacao.
2. Commit e push para `main`.
3. Validar deploy no Railway.
4. Executar smoke test: `./scripts/quality/test-backend.ps1`.

## Guia por Area

- Arquitetura: `docs/architecture/ARCHITECTURE_STACK_INTEGRATION.md`
- Deploy: `docs/deployment/GUIA_DEPLOY_FINAL.md`
- Operacoes: `docs/operations/DISASTER_RECOVERY_RUNBOOK.md`
- Seguranca: `docs/security/SECURITY.md`
- QA: `docs/qa/QA_SUMMARY.md`
- Status: `docs/status/STATUS_PROJETO.md`

## Observacao Importante Sobre Deploy

O projeto esta padronizado para Railway. Configuracoes de deploy antigas (Render/Vercel) foram removidas para evitar drift operacional.
