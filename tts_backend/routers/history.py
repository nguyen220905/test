import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from config import settings
from database import TTSHistory, get_db
from models import HistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])


# ─── Helper ──────────────────────────────────────────────────────────────────

def _to_item(h: TTSHistory) -> HistoryItem:
    return HistoryItem(
        id          = h.id,
        text        = h.text,
        audio_url   = f"/audio/{h.audio_filename}" if h.audio_filename else None,
        noise_scale = h.noise_scale,
        length_scale= h.length_scale,
        volume      = h.volume,
        created_at  = h.created_at,
    )


def _delete_audio_file(filename: str | None):
    if filename:
        path = os.path.join(settings.AUDIO_DIR, filename)
        if os.path.exists(path):
            os.remove(path)


# ─── GET /api/history ────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[HistoryItem],
    summary="Lấy danh sách lịch sử chuyển đổi",
)
def get_history(
    skip : int = Query(0,  ge=0),
    limit: int = Query(50, ge=1, le=200),
    db   : Session = Depends(get_db),
):
    items = (
        db.query(TTSHistory)
        .order_by(TTSHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_to_item(h) for h in items]


# ─── DELETE /api/history/{id} ─────────────────────────────────────────────────

@router.delete(
    "/{item_id}",
    summary="Xóa một bản ghi lịch sử",
)
def delete_history_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(TTSHistory).filter(TTSHistory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")

    _delete_audio_file(item.audio_filename)
    db.delete(item)
    db.commit()
    return {"message": f"Đã xóa bản ghi #{item_id}"}


# ─── DELETE /api/history/ (xóa tất cả) ───────────────────────────────────────

@router.delete(
    "/",
    summary="Xóa toàn bộ lịch sử",
)
def clear_all_history(db: Session = Depends(get_db)):
    items = db.query(TTSHistory).all()
    for item in items:
        _delete_audio_file(item.audio_filename)
    db.query(TTSHistory).delete()
    db.commit()
    return {"message": "Đã xóa toàn bộ lịch sử"}
