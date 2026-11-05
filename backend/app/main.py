from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, files, shares

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="API for the CloudSync file storage and sharing application.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    # CloudSync uses bearer JWT headers, not cookie-based authentication.
    # This permits both the local Vite origin and the single-origin CloudFront deployment.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth")
app.include_router(files.router, prefix=f"{settings.api_v1_prefix}/files")
app.include_router(shares.router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["General"])
def root() -> dict[str, str]:
    """Basic welcome endpoint."""
    return {
        "service": settings.app_name,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Report whether the API process is responding."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
    }
