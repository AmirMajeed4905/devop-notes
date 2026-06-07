# FROM python:3.12-slim

# # System dependencies for psycopg2
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt

# COPY app ./app

# EXPOSE 8000


# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]



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
# Sirf runtime cheezein — gcc aur build tools nahi
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

COPY app ./app

# Root pe mat chalao — security best practice
RUN useradd -m appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]