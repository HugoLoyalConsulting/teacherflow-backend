# TeacherFlow Monorepo

Guia principal do projeto TeacherFlow com navegação por pastas e documentos.

## Leitura Recomendada

1. `docs/overview/START.md`
2. `docs/deployment/SETUP_INSTRUCTIONS.md`
3. `docs/deployment/RENDER_SETUP_CHECKLIST.md`
4. `docs/DOCUMENTATION_INDEX.md`

## Estrutura do Repositorio

- `backend/`: API FastAPI, modelos, migracoes Alembic e servicos.
- `frontend/`: aplicacao React + TypeScript.
- `.github/workflows/`: pipelines CI/CD, backup e seguranca.
- `docs/`: documentacao organizada por tema.
- `scripts/`: automacoes de backup, database, qualidade e deploy.

Detalhamento completo da arvore: `docs/overview/FOLDER_STRUCTURE.md`.

## Ambientes e URLs

- Frontend: `https://teacherflow-app.vercel.app`
- Backend: `https://teacherflow-backend.onrender.com`
- OpenAPI: `https://teacherflow-backend.onrender.com/api/v1/docs`

## Fluxo Operacional

1. Alterar codigo/documentacao.
2. Commit e push para `main`.
3. Validar workflow/deploy no GitHub Actions e Render.
4. Executar smoke test: `./scripts/quality/test-backend.ps1`.

## Guia por Area

- Arquitetura: `docs/architecture/ARCHITECTURE_STACK_INTEGRATION.md`
- Deploy: `docs/deployment/GUIA_DEPLOY_FINAL.md`
- Operacoes: `docs/operations/DISASTER_RECOVERY_RUNBOOK.md`
- Seguranca: `docs/security/SECURITY.md`
- QA: `docs/qa/QA_SUMMARY.md`
- Status: `docs/status/STATUS_PROJETO.md`

## Observacao Importante Sobre Render

`render.yaml` no repositorio so eh aplicado automaticamente quando o servico foi criado como Blueprint. Se o servico Render foi criado manualmente, as configuracoes precisam ser ajustadas no dashboard do Render.
