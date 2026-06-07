# 🐳 FastAPI + Nginx + PostgreSQL — Docker DevOps Project

A production-style deployment of a FastAPI application with Nginx load balancing, PostgreSQL database, and a full CI/CD pipeline using GitHub Actions.

## 🏗️ Architecture

```
Internet
    │
    ▼
┌─────────┐
│  Nginx  │  ← Load Balancer (port 8000)
└────┬────┘
     │  Round-robin
  ┌──┴──┐
  │     │
┌─┴──┐ ┌┴───┐
│API1│ │API2│  ← FastAPI + Uvicorn
└─┬──┘ └┬───┘
  └──┬───┘
     ▼
┌──────────┐
│PostgreSQL│  ← Database
└──────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| API Framework | FastAPI + Uvicorn |
| Load Balancer | Nginx 1.25 Alpine |
| Database | PostgreSQL 17 |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Auth | JWT (python-jose) + Passlib |
| ORM | SQLAlchemy |

## 📁 Project Structure

```
project/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
├── nginx/
│   └── default.conf        # Nginx load balancer config
├── app/
│   ├── main.py             # FastAPI application
│   └── static/             # Static files
├── tests/
│   └── ...
├── Dockerfile              # Multi-stage optimized build
├── docker-compose.yml      # Full stack definition
├── .env                    # Local secrets (never commit!)
├── .env.example            # Template for teammates
└── requirements.txt
```

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed
- Docker Hub account

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd your-project

# .env file banao
cp .env.example .env
```

`.env` mein fill karo:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=mydb
SECRET_KEY=your-secret-key   # generate: python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Run

```bash
docker compose up --build
```

App available at: **http://localhost:8000**

### 3. Useful Commands

```bash
# Logs dekhna
docker compose logs -f

# Band karna
docker compose down

# Band karna + database reset
docker compose down -v

# Specific container ka log
docker compose logs api1
```

## 🔄 CI/CD Pipeline

```
Push to main
     │
     ▼
┌─────────┐     ┌───────────────┐
│  Tests  │────▶│ Build & Push  │
│(pytest) │     │ (Docker Hub)  │
└─────────┘     └───────────────┘
```

### GitHub Secrets Required

Go to **Repo → Settings → Secrets → Actions** and add:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (not password) |

## 📊 Image Size Optimization

Multi-stage Docker build used to reduce image size:

| | Before | After |
|--|--------|-------|
| API Image | 656 MB | 412 MB |
| Savings | — | **244 MB (37% smaller)** |

**How:** Build stage compiles packages with gcc, final stage copies only the compiled wheels — no build tools in production image.

## 🔒 Security Features

- Non-root user inside containers (`appuser`)
- Secrets via `.env` file — never hardcoded
- DB port not exposed in production (only internal Docker network)
- JWT-based authentication
- Healthchecks on all services

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login, get JWT |
| ... | ... | Your endpoints |

## 🧠 What I Learned

- Docker multi-stage builds for smaller images
- Nginx as a reverse proxy and load balancer
- Docker Compose healthchecks and service dependencies
- GitHub Actions CI/CD with real PostgreSQL service
- Container security best practices
