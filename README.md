# Notes Studio 📝

A production-grade note management application built with FastAPI, PostgreSQL, and Docker — featuring JWT authentication, load balancing, and a fully automated CI/CD pipeline.

**Live Demo:** http://54.237.199.213

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 17 |
| Auth | JWT + bcrypt |
| Reverse Proxy | Nginx (load balanced) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS EC2 |

---

## Architecture

```
Internet
    │
    ▼
Nginx (Port 80)
Load Balancer
    │
    ├──▶ FastAPI Instance 1 (api1:8000)
    │
    └──▶ FastAPI Instance 2 (api2:8000)
              │
              ▼
        PostgreSQL 17
        (persistent volume)
```

**Why 2 API instances?**
- Zero downtime if one instance crashes
- Load distributed between both
- Production-grade reliability

---

## Features

- **User Authentication** — Register, login, logout with JWT tokens
- **Notes CRUD** — Create, read, update, delete notes
- **Real-time Search** — Filter notes by title or content instantly
- **Secure by default** — Non-root Docker user, no exposed DB ports
- **Health checks** — All containers monitored automatically
- **Auto deploy** — Push to main → live in minutes

---

## Project Structure

```
devop-notes/
├── app/
│   ├── main.py          # FastAPI app entry point
│   ├── auth.py          # Authentication routes
│   ├── routes.py        # Notes CRUD routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # DB connection
│   ├── security.py      # JWT + password hashing
│   ├── templates/       # HTML pages
│   └── static/          # CSS + JS
├── nginx/
│   └── default.conf     # Reverse proxy + load balancer config
├── tests/
│   └── test_app.py      # Pytest test suite
├── .github/
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline
├── Dockerfile           # Multi-stage production build
├── docker-compose.yml   # Full stack orchestration
├── requirements.txt     # Production dependencies
└── requirements-dev.txt # Dev + testing dependencies
```

---

## Local Setup

**Prerequisites:** Docker Desktop installed

```bash
# 1. Clone
git clone https://github.com/AmirMajeed4905/devop-notes.git
cd devop-notes

# 2. Environment setup
cp .env.example .env
# Edit .env with your values

# 3. Generate secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# 4. Run
docker compose up --build -d

# 5. Open
# http://localhost
```

---

## Environment Variables

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password
POSTGRES_DB=notesdb
SECRET_KEY=your_generated_secret_key
```

---

## CI/CD Pipeline

Every push to `main` branch automatically:

```
git push
    │
    ▼
① Run Tests (pytest + PostgreSQL)
    │
    ▼
② Build Docker Image
   Push to Docker Hub
    │
    ▼
③ SSH into EC2
   Pull latest image
   docker compose up -d
    │
    ▼
✅ Live at http://54.237.199.213
```

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `EC2_HOST` | EC2 public IP |
| `EC2_USER` | EC2 username (ubuntu) |
| `EC2_SSH_KEY` | EC2 private key (.pem content) |

---

## Docker Image Optimization

Multi-stage build keeps image size minimal:

```
Stage 1 (Builder):   gcc + libpq-dev + compile wheels
Stage 2 (Final):     libpq5 only + pre-built wheels

Result: ~320MB vs ~600MB (standard build)

Production deps only — pytest/httpx excluded from image
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/notes` | Get all user notes |
| POST | `/notes` | Create note |
| PUT | `/notes/{id}` | Update note |
| DELETE | `/notes/{id}` | Delete note |
| GET | `/health` | Health check |

---

## Running Tests

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

## Author

**Amir Majeed**
- GitHub: [@AmirMajeed4905](https://github.com/AmirMajeed4905)

---

*Built to demonstrate production-grade DevOps practices — Docker, CI/CD, cloud deployment, and security best practices.*
