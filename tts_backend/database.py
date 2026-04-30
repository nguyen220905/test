from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── ORM Model ───────────────────────────────────────────────────────────────

class TTSHistory(Base):
    __tablename__ = "tts_history"

    id            = Column(Integer, primary_key=True, index=True)
    text          = Column(String,  nullable=False)
    audio_filename= Column(String,  nullable=True)   # None nếu không lưu
    noise_scale   = Column(Float,   default=0.667)
    length_scale  = Column(Float,   default=1.0)
    volume        = Column(Float,   default=1.0)
    created_at    = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ─── Helpers ─────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
