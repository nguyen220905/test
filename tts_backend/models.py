from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Request ─────────────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000,
                      description="Văn bản tiếng Việt cần chuyển đổi")
    noise_scale: float = Field(0.667, ge=0.0, le=2.0,
                               description="Cao độ giọng nói (0–2, mặc định 0.667)")
    length_scale: float = Field(1.0, ge=0.5, le=2.0,
                                description="Tốc độ (0.5=nhanh, 2.0=chậm, mặc định 1.0)")
    volume: float = Field(1.0, ge=0.1, le=3.0,
                          description="Âm lượng (0.1–3.0, mặc định 1.0)")
    save_audio: bool = Field(True,
                             description="Có lưu file WAV xuống server không?")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "Xin chào Việt Nam",
                "noise_scale": 0.667,
                "length_scale": 1.0,
                "volume": 1.0,
                "save_audio": True,
            }
        }
    }


# ─── Response ────────────────────────────────────────────────────────────────

class TTSResponse(BaseModel):
    success: bool
    audio_url: Optional[str] = None   # e.g. /audio/abc123.wav
    history_id: Optional[int] = None
    message: str = ""


class HistoryItem(BaseModel):
    id: int
    text: str
    audio_url: Optional[str] = None
    noise_scale: float
    length_scale: float
    volume: float
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    backend: str
    ai_api: object
