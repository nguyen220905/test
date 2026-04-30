from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # URL ngrok của bạn AI (thay bằng link thật)
    AI_API_URL: str = "https://xxxx.ngrok-free.app"
    # API key do bạn AI cung cấp
    AI_API_KEY: str = "your-api-key-here"
    # Thư mục lưu file âm thanh
    AUDIO_DIR: str = "audio_files"
    # Database SQLite
    DATABASE_URL: str = "sqlite:///./tts_history.db"
    # CORS origins (để * cho dev local)
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
