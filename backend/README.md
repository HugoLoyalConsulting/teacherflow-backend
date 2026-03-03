# TeacherFlow Backend

FastAPI backend for TeacherFlow SaaS platform. Production-ready with PostgreSQL, JWT authentication, Docker support, and cloud deployment ready.

## Features

- ✅ FastAPI 0.104+ with async/await
- ✅ SQLAlchemy ORM with PostgreSQL
- ✅ JWT authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ CORS middleware configured
- ✅ Docker & docker-compose included
- ✅ Alembic migrations ready
- ✅ Environment-based configuration
- ✅ API documentation (Swagger/ReDoc)

## Quick Start (Local Dev)

### 1. Setup Python Environment

```bash
# Clone/navigate to backend
cd teacherflow-backend

# Create virtual environment
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
# For local dev, defaults should work
```

### 4. Start Local Database (Option A: Local PostgreSQL)

```bash
# If you have PostgreSQL installed locally:
# Create database
createdb teacherflow

# Update DATABASE_URL in .env to match your setup
DATABASE_URL=postgresql://username:password@localhost/teacherflow
```

### 5. Start Backend Server

```bash
# Navigate to project root
cd teacherflow-backend

# Run uvicorn directly
python main.py

# Or use uvicorn directly
uvicorn app.main:app --reload
```

**Server will start on:** http://localhost:8000

**API Docs:** http://localhost:8000/api/v1/docs

## Docker Setup (Recommended for Production)

### With Docker Compose (Full Stack)

```bash
# Navigate to backend directory
cd teacherflow-backend

# Copy env example
cp .env.example .env

# Start all services (PostgreSQL + Backend)
docker-compose up --build

# On first run, wait for database to be ready
# Alembic migrations run automatically
```

**Access:**
- API: http://localhost:8000
- Swagger: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc
- PostgreSQL: localhost:5432 (user: teacherflow, pass: teacherflow123)

### Stop Services

```bash
docker-compose down

# To remove volume data also:
docker-compose down -v
```

## API Endpoints

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user info |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/students` | List all students |
| GET | `/api/v1/students/{id}` | Get student by ID |
| POST | `/api/v1/students` | Create student |
| PUT | `/api/v1/students/{id}` | Update student |
| DELETE | `/api/v1/students/{id}` | Delete student |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/locations` | List all locations |
| GET | `/api/v1/locations/{id}` | Get location by ID |
| POST | `/api/v1/locations` | Create location |
| PUT | `/api/v1/locations/{id}` | Update location |
| DELETE | `/api/v1/locations/{id}` | Delete location |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/groups` | List all groups |
| GET | `/api/v1/groups/{id}` | Get group by ID |
| POST | `/api/v1/groups` | Create group |
| PUT | `/api/v1/groups/{id}` | Update group |
| DELETE | `/api/v1/groups/{id}` | Delete group |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/schedules` | List all schedules |
| GET | `/api/v1/schedules/{id}` | Get schedule by ID |
| POST | `/api/v1/schedules` | Create schedule |
| PUT | `/api/v1/schedules/{id}` | Update schedule |
| DELETE | `/api/v1/schedules/{id}` | Delete schedule |

### Lessons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lessons` | List lessons (with date filters) |
| GET | `/api/v1/lessons/{id}` | Get lesson by ID |
| POST | `/api/v1/lessons` | Create lesson |
| PUT | `/api/v1/lessons/{id}` | Update lesson |
| PATCH | `/api/v1/lessons/{id}/attendance` | Update attendance |
| DELETE | `/api/v1/lessons/{id}` | Delete lesson |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/payments` | List payments (with filters) |
| GET | `/api/v1/payments/{id}` | Get payment by ID |
| POST | `/api/v1/payments` | Create payment |
| PUT | `/api/v1/payments/{id}` | Update payment |
| DELETE | `/api/v1/payments/{id}` | Delete payment |

## Configuration

Environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/teacherflow

# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# API
DEBUG=true
API_V1_STR=/api/v1

# CORS Origins
CORS_ORIGINS=["http://localhost:5176", "http://localhost:3000"]
```

## Database Models

### User
- Teacher/admin accounts
- Email-based login
- Password hashing with bcrypt

### Student
- Student records
- Profile types: free, trial, premium
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
