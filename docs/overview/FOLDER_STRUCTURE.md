# Folder Structure Guide

Guia oficial da estrutura de pastas do repositorio `teacherflow`.

## Regra de Ouro

Na raiz, manter apenas:

- pastas de dominio (`backend`, `frontend`, `docs`, `scripts`, `.github`)
- arquivos tecnicos obrigatorios (`render.yaml`, `.gitignore`, etc.)

Evitar arquivos operacionais soltos na raiz.

## Arvore Resumida

```text
teacherflow/
  .github/
    workflows/
  backend/
    app/
    alembic/
    README.md
  frontend/
    src/
    README.md
  docs/
    overview/
    deployment/
    architecture/
    operations/
    security/
    qa/
    status/
    DOCUMENTATION_INDEX.md
    README.md
  scripts/
    backup/
    database/
    quality/
    deploy/
    README.md
  render.yaml
```

## Convencao de Organizacao

- Documentacao de produto/processo: `docs/<tema>/...`
- Automacoes e utilitarios: `scripts/<grupo>/...`
- Codigo executavel: `backend/` e `frontend/`
- Infra CI/CD: `.github/workflows/`

## Fluxo de Inclusao de Novos Arquivos

1. Identificar o dominio (codigo, doc, script, infra).
2. Colocar no grupo correto de pasta.
3. Atualizar o indice em `docs/DOCUMENTATION_INDEX.md` quando for doc relevante.
4. Evitar criar novos arquivos no topo da raiz.
