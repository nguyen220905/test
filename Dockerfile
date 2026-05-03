# ─── Stage 1: Builder ──────────────────────────────────────────────────────
# Cài deps vào virtualenv riêng để runtime stage chỉ copy /opt/venv,
# không kéo theo pip cache / build artifacts.
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY tts_backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt


# ─── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Non-root user (uid/gid 1001) — không login, không cần home thật
RUN groupadd --system --gid 1001 tayvoice \
 && useradd  --system --uid 1001 --gid 1001 \
             --home-dir /home/tayvoice --create-home \
             --shell /usr/sbin/nologin tayvoice

# Copy venv đã build sẵn từ stage builder
COPY --from=builder /opt/venv /opt/venv

WORKDIR /app

# Copy code, gán quyền cho non-root ngay khi copy (nhanh hơn chown sau)
COPY --chown=tayvoice:tayvoice tts_backend/      /app/tts_backend/
COPY --chown=tayvoice:tayvoice tayvoice-frontv2/ /app/tayvoice-frontv2/

# Tạo dir runtime cần ghi (audio + db) và cấp quyền cho non-root
RUN mkdir -p /app/tts_backend/audio_files /data \
 && chown -R tayvoice:tayvoice /app/tts_backend/audio_files /data

USER tayvoice
WORKDIR /app/tts_backend

# Mặc định: DB → /data (volume), audio → /app/tts_backend/audio_files (bind/volume)
ENV DATABASE_URL="sqlite:////data/tts_history.db" \
    AUDIO_DIR="/app/tts_backend/audio_files"

EXPOSE 8888

# Healthcheck dùng urllib có sẵn trong Python (không phải cài curl).
# /api/health luôn trả 200 nếu backend còn sống (ngay cả khi AI API down)
# nên healthcheck chỉ phản ánh tình trạng của container, không gây false-negative.
HEALTHCHECK --interval=30s --timeout=15s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8888/api/health', timeout=10)"]

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8888"]
