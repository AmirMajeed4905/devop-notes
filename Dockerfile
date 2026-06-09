# ─── Stage 1: Builder ───────────────────────────────────────────────
# Yahan gcc aur libpq-dev use karke wheels banate hain
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Wheels build karke ek folder mein store karo
RUN pip install --no-cache-dir --upgrade pip \
    && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ─── Stage 2: Final image ───────────────────────────────────────────
# Sirf runtime cheezein — gcc aur build tools bilkul nahi
FROM python:3.12-slim AS final

# Sirf libpq chahiye runtime pe (psycopg2 ke liye) — gcc nahi
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Builder se sirf built wheels copy karo
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# Sirf app code copy karo
COPY app ./app

# ─── Security: Root pe mat chalao ──────────────────────────────────
RUN useradd --no-create-home --shell /bin/false appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck — Docker ko pata chale app theek hai
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
