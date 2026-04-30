import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import create_tables
from routers import tts, history
from services.ai_service import check_ai_health


# ─── Startup / Shutdown ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tạo bảng SQLite nếu chưa có
    create_tables()
    # Tạo thư mục lưu audio
    os.makedirs(settings.AUDIO_DIR, exist_ok=True)
    yield


# ─── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "Vietnamese TTS — Backend",
    description = "Middleware giữa Frontend và AI VITS API",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# CORS — cho phép frontend (localhost) gọi tới
app.add_middleware(
    CORSMiddleware,
    allow_origins    = settings.CORS_ORIGINS,
    allow_credentials= True,
    allow_methods    = ["*"],
    allow_headers    = ["*"],
)

# Serve file audio tĩnh tại /audio/<filename>
app.mount("/audio", StaticFiles(directory=settings.AUDIO_DIR), name="audio")

# Đăng ký routers
app.include_router(tts.router)
app.include_router(history.router)


# ─── Root & Health ────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Vietnamese TTS Backend đang chạy",
        "docs"   : "/docs",
        "health" : "/api/health",
    }


@app.get("/api/health", tags=["Health"])
async def health():
    """Kiểm tra trạng thái backend và AI API."""
    try:
        ai_status = await check_ai_health()
        return {"backend": "ok", "ai_api": ai_status}
    except Exception as e:
        return {"backend": "ok", "ai_api": "unreachable", "error": str(e)}
