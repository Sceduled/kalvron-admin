from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
import logging
from core.config import settings
from api.routes import auth, admin
from contextlib import asynccontextmanager
from core.database import engine
from sqlalchemy import text
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Kalvron Admin started: Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    yield

app = FastAPI(title="Kalvron Admin", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, tags=["admin"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "kalvron-admin"}

frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")

@app.get("/assets/{file_path:path}")
def serve_assets(file_path: str):
    asset_path = os.path.join(frontend_dist, "assets", file_path)
    if os.path.exists(asset_path):
        return FileResponse(asset_path)
    raise HTTPException(status_code=404, detail="Asset not found")

@app.get("/{rest_of_path:path}")
def serve_frontend(rest_of_path: str):
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Frontend not built")
