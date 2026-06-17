from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import patientInfo, analysis
from backend.database import init_db
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield

app = FastAPI(
    title="Dementia Detection API",
    description="Backend API for Dementia Risk Assessment",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - origins are comma-separated in CORS_ORIGINS env var.
# Default to local Vite dev server if unset so the app still runs out-of-the-box.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(patientInfo.router, prefix="/api", tags=["PatientInfo"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
def home():
    return {"message": "Welcome to the Dementia Detection Backend!"}
