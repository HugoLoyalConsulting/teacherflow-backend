# Troubleshooting

Guia rapido para diagnosticar problemas comuns.

## Render

- Verifique `branch=main` e `rootDirectory=backend`.
- Confirme build/start command no dashboard.
- Rode `alembic upgrade head` no shell apos deploy.

## API

- `GET /healthz` deve responder 200.
- `GET /api/v1/openapi.json` deve responder 200.

## Frontend

- Verifique `VITE_API_URL` no Vercel.
- Redeploy apos alterar variaveis.