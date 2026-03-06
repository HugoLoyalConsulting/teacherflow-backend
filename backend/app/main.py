"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, students, locations, groups, schedules, lessons, payments, dashboard, feedback, verification, onboarding, admin, tour, lgpd, subscriptions
from app.core.autoseed import auto_seed_if_empty
import logging

# Initialize monitoring and telemetry
from app.core import monitoring, telemetry

logger = logging.getLogger(__name__)

# Create database tables with error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    # Don't fail startup if tables can't be created, health check will catch actual DB issues

# Auto-seed database with realistic data if empty (only on first deployment)
try:
    auto_seed_if_empty()
except Exception as e:
    logger.warning(f"Auto-seed failed (non-critical): {e}")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(verification.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(tour.router, prefix=settings.API_V1_STR)
app.include_router(lgpd.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(groups.router, prefix=settings.API_V1_STR)
app.include_router(schedules.router, prefix=settings.API_V1_STR)
app.include_router(lessons.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info(f"Starting {settings.PROJECT_NAME} (env: {settings.ENVIRONMENT})")
    if settings.SENTRY_ENABLED:
        logger.info("Sentry error monitoring: ENABLED")
    if settings.POSTHOG_ENABLED:
        logger.info("PostHog telemetry: ENABLED")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Shutting down application...")
    telemetry.shutdown_posthog()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/healthz")
async def healthz():
    """Health check endpoint (Render format)"""
    return {"status": "ok"}
