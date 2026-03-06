# TeacherFlow Backend

Backend FastAPI do TeacherFlow (monorepo), com foco em deploy no Render e banco PostgreSQL (Neon).

## Escopo

- API REST em `app/`
- Migrations em `alembic/`
- Configuracao por variaveis de ambiente
- Integracao com autenticacao, assinatura e LGPD

## Estrutura Interna

```
backend/
   app/
      routers/
      services/
      schemas/
      core/
      models.py
   alembic/
   requirements.txt
   render.yaml (legado; referencia principal fica em ../render.yaml)
```

## Execucao Local

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentacao local da API:

- `http://localhost:8000/api/v1/docs`

## Variaveis de Ambiente Minimas

```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
API_V1_STR=/api/v1
ENVIRONMENT=production
```

## Deploy (Render)

Configuracao declarativa em `../render.yaml`:

- `rootDirectory: ./backend`
- `buildCommand: pip install --upgrade pip && pip install -r requirements.txt`
- `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Depois do deploy, executar migrations:

```bash
cd /opt/render/project/src/backend
alembic upgrade head
```

## Links Relacionados

- `../docs/deployment/GUIA_DEPLOY_FINAL.md`
- `../docs/deployment/RENDER_SETUP_CHECKLIST.md`
- `../docs/operations/DISASTER_RECOVERY_RUNBOOK.md`
- Payment status tracking

### Location
- Venues/classrooms
- Address information
- Capacity management

### Group
- Classes/groups of students
- Location-based
- Student enrollment

### Schedule
- Weekly recurring schedules
- Time slots
- Location + Group linked

### Lesson
- Specific class instances
- Attendance tracking
- Notes and status

### Payment
- Payment records
- Multiple payment methods
- Reference tracking

## Deployment

### Render.com (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render service:**
   - Go to https://dashboard.render.com
   - New > Web Service
   - Connect GitHub repo
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
   - Add environment variables (DATABASE_URL, SECRET_KEY, etc)
   - Deploy

3. **Neon Database (PostgreSQL):**
   - Go to https://neon.tech
   - Create account, new project
   - Copy connection string
   - Set DATABASE_URL in Render environment

### Vercel (Frontend)

See [frontend README](../TeacherFlow\ App/README.md)

## Development

### Run Tests (when added)

```bash
pytest
```

### Run Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback latest
alembic downgrade -1
```

### Database Reset (Development Only)

```bash
# Stop docker containers
docker-compose down -v

# Recreate
docker-compose up --build
```

## Troubleshooting

### Port Already in Use

```bash
# Change port in docker-compose.yml or startup command
uvicorn app.main:app --port 8001
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Local: psql -U teacherflow -d teacherflow
# Docker: docker-compose logs postgres

# Verify DATABASE_URL format in .env
```

### CORS Errors

Add frontend URL to `CORS_ORIGINS` in `.env`:
```env
CORS_ORIGINS=["http://localhost:5176", "https://your-frontend.vercel.app"]
```

## File Structure

```
teacherflow-backend/
├── app/
│   ├── core/
│   │   ├── config.py        # Configuration & settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── security.py      # JWT & password hashing
│   ├── routers/             # API endpoints
│   │   ├── auth.py
│   │   ├── students.py
│   │   ├── locations.py
│   │   ├── groups.py
│   │   ├── schedules.py
│   │   ├── lessons.py
│   │   └── payments.py
│   ├── schemas/             # Pydantic models
│   ├── models.py            # SQLAlchemy models
│   └── main.py              # FastAPI app setup
├── alembic/                 # Database migrations
├── main.py                  # Entry point
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env                     # Local development
├── .env.example             # Template
└── README.md
```

## Next Steps

1. **Connect Frontend:** Update frontend API client to point to your backend
2. **Database Setup:** Choose PostgreSQL provider (Neon, Supabase, AWS RDS)
3. **Deploy:** Follow deployment guide for Render + Vercel
4. **Security:** Update SECRET_KEY before production deploy
5. **Monitoring:** Add error tracking (Sentry) and logging

## Support

For issues, check:
- FastAPI docs: https://fastapi.tiangolo.com
- SQLAlchemy: https://docs.sqlalchemy.org
- PostgreSQL: https://www.postgresql.org/docs/

---

**Last Updated:** February 27, 2026
**Status:** Production Ready (Phase 2 Complete)
