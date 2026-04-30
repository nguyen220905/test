import io
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from config import settings
from database import TTSHistory, get_db
from models import TTSRequest, TTSResponse
from services.ai_service import call_tts_api
from services.audio_utils import adjust_volume

router = APIRouter(prefix="/api", tags=["TTS"])


# ─── 0. Danh sách giọng đọc (cho frontend dropdown) ──────────────────────────

@router.get("/voices", summary="Danh sách giọng đọc khả dụng")
async def list_voices():
    """
    Trả về danh sách giọng đọc cho frontend.
    VITS hiện là single-speaker tiếng Việt → chỉ 1 entry.
    """
    return {
        "voices": [
            {"code": "vi", "name": "Tiếng Việt (VITS)", "lang": "vi-VN"},
        ]
    }


# ─── 1. Chuyển đổi text → audio ──────────────────────────────────────────────

@router.post(
    "/tts",
    response_model=TTSResponse,
    summary="Chuyển text thành giọng nói",
)
async def synthesize(request: TTSRequest, db: Session = Depends(get_db)):
    """
    Gửi text lên AI API → nhận WAV → điều chỉnh volume → (tuỳ chọn) lưu file.
    Trả về audio_url để frontend fetch và phát.
    """
    try:
        # 1. Gọi AI API
        audio_bytes = await call_tts_api(
            text=request.text,
            noise_scale=request.noise_scale,
            length_scale=request.length_scale,
        )

        # 2. Điều chỉnh âm lượng
        audio_bytes = adjust_volume(audio_bytes, request.volume)

        # 3. Lưu file (nếu được yêu cầu)
        filename  = None
        audio_url = None

        if request.save_audio:
            filename  = f"{uuid.uuid4().hex}.wav"
            filepath  = os.path.join(settings.AUDIO_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(audio_bytes)
            audio_url = f"/audio/{filename}"

        # 4. Ghi lịch sử
        history = TTSHistory(
            text          = request.text,
            audio_filename= filename,
            noise_scale   = request.noise_scale,
            length_scale  = request.length_scale,
            volume        = request.volume,
        )
        db.add(history)
        db.commit()
        db.refresh(history)

        return TTSResponse(
            success    = True,
            audio_url  = audio_url,
            history_id = history.id,
            message    = "Chuyển đổi thành công",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi AI API: {str(e)}")


# ─── 2. Stream audio trực tiếp (không lưu file) ──────────────────────────────

@router.post(
    "/tts/stream",
    summary="Stream WAV audio trực tiếp",
    response_class=StreamingResponse,
)
async def synthesize_stream(request: TTSRequest):
    """
    Trả về WAV audio stream — phát nhanh, không lưu server.
    Phù hợp cho chức năng nghe thử (preview).
    """
    try:
        audio_bytes = await call_tts_api(
            text=request.text,
            noise_scale=request.noise_scale,
            length_scale=request.length_scale,
        )
        audio_bytes = adjust_volume(audio_bytes, request.volume)

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=output.wav"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi stream audio: {str(e)}")


# ─── 3. Upload file text → trả về nội dung ───────────────────────────────────

@router.post(
    "/tts/upload-file",
    summary="Upload file .txt → trả về nội dung text",
)
async def upload_text_file(file: UploadFile = File(...)):
    """
    Nhận file .txt từ frontend, đọc nội dung, trả về text.
    Frontend dùng text này để gọi /api/tts tiếp theo.
    """
    if not file.filename.lower().endswith((".txt", ".text")):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file .txt")

    content = await file.read()

    # Thử các encoding phổ biến cho tiếng Việt
    for enc in ("utf-8-sig", "utf-8", "utf-16", "latin-1"):
        try:
            text = content.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise HTTPException(
            status_code=422,
            detail="Không thể đọc file — hãy lưu file với encoding UTF-8",
        )

    text = text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="File trống")

    return {
        "text"    : text,
        "filename": file.filename,
        "length"  : len(text),
    }
