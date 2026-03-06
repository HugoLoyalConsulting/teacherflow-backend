# TeacherFlow Frontend

Aplicacao React + TypeScript do TeacherFlow.

## Estrutura

```text
frontend/
  src/
    components/
    pages/
    services/
    store/
    utils/
  package.json
  vite.config.ts
  README.md
```

## Execucao Local

```bash
cd frontend
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Variaveis de Ambiente

```env
VITE_API_URL=https://teacherflow-backend.onrender.com/api/v1
VITE_ENVIRONMENT=production
```

## Referencias

- `../docs/VERCEL_ENVIRONMENT_VARIABLES.md`
- `../docs/DOCUMENTATION_INDEX.md`
- `../docs/overview/FOLDER_STRUCTURE.md`
- `../backend/README.md`