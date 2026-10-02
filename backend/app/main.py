from fastapi import FastAPI

from app.api.assets import router as assets_router
from app.api.findings import router as findings_router
from app.db.database import Base, engine
from app.models import Asset, Finding


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CYBER Security API",
    description="Backend API for the CYBER security scanning MVP",
    version="0.1.0",
)


app.include_router(assets_router)
app.include_router(findings_router)


@app.get("/")
def root():
    return {
        "message": "CYBER Security API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cyber-security-api"
    }