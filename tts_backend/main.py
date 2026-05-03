import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from database import create_tables
from routers import tts, history
from services.ai_service import check_ai_health


# Thư mục frontend (cùng cấp với tts_backend/)
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "tayvoice-frontv2" / "tayvoice"


# ─── Startup / Shutdown ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tạo bảng SQLite nếu chưa có
    create_tables()
    yield


# Đảm bảo thư mục audio tồn tại TRƯỚC khi mount (StaticFiles raise nếu thiếu).
# Phải chạy ở module-level vì mount xảy ra ở import-time, trước khi lifespan run.
os.makedirs(settings.AUDIO_DIR, exist_ok=True)


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

@app.get("/", include_in_schema=False)
def root():
    # Mở http://localhost:8888/ → tự động vào trang frontend
    return RedirectResponse(url="/html/index.html")


@app.get("/api/health", tags=["Health"])
async def health():
    """Kiểm tra trạng thái backend và AI API."""
    try:
        ai_status = await check_ai_health()
        return {"backend": "ok", "ai_api": ai_status}
    except Exception as e:
        return {"backend": "ok", "ai_api": "unreachable", "error": str(e)}


# ─── Mount Frontend (đặt cuối để các route /api/*, /audio/* match trước) ─────

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")


# ─── Run trực tiếp: python main.py ───────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8888, reload=True)
