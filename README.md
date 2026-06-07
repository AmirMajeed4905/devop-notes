# Notes Studio

A simple FastAPI notes application with a modern UI, nginx reverse proxy, and Docker support.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:8000

## GitHub Actions CI

This repository includes a GitHub Actions pipeline at `.github/workflows/ci.yml`.
The CI workflow:
- installs dependencies
- runs `pytest`
- builds the Docker image to verify the container can build successfully

## Deploy

For production, deploy to any Docker-ready host or VM.
Recommended options:
- DigitalOcean Droplet / App Platform
- AWS ECS, EC2 with Docker Compose
- Render, Railway, or Fly.io

On a Linux host, deploy with:

```bash
docker compose up --build -d
```

Set production environment variables before startup:
- `DATABASE_URL` (Postgres connection string)
- `SECRET_KEY` (JWT secret)

Then visit `http://<your-server-ip>`.

## Notes
- The web UI assets are in `app/static` and templates in `app/templates`.
- The backend uses SQLAlchemy and Postgres.
- nginx is configured in `nginx/default.conf` to proxy to backend instances and serve static files.
