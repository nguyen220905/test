import httpx
from config import settings


# ─── TTS call ────────────────────────────────────────────────────────────────

async def call_tts_api(
    text: str,
    noise_scale: float,
    length_scale: float,
) -> bytes:
    """
    Gọi AI API và trả về raw WAV bytes.
    Dùng response_mode='stream' để lấy audio trực tiếp.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{settings.AI_API_URL}/v1/tts",
            headers={
                "x-api-key": settings.AI_API_KEY,
                "ngrok-skip-browser-warning": "true",   # bỏ trang warning của ngrok
            },
            json={
                "text": text,
                "noise_scale": noise_scale,
                "length_scale": length_scale,
                "response_mode": "stream",
            },
        )
        resp.raise_for_status()
        return resp.content


# ─── Health check ────────────────────────────────────────────────────────────

async def check_ai_health() -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{settings.AI_API_URL}/v1/health",
            headers={"ngrok-skip-browser-warning": "true"},
        )
        return resp.json()
