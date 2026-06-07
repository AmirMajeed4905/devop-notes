from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import os

from app.routes import router as notes_router
from app.auth import router as auth_router
from app.database import init_db

app = FastAPI()

# Ensure correct paths (important in Docker)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

init_db()

# Ensure a static folder exists and mount it
static_path = os.path.join(BASE_DIR, "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Include API routes from router
app.include_router(auth_router)
app.include_router(notes_router)


def serve_page(page_name: str):
    page_path = os.path.join(BASE_DIR, "templates", page_name)
    return FileResponse(page_path, media_type="text/html")


@app.get("/", response_class=HTMLResponse)
def home():
    return serve_page("index.html")


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard():
    return serve_page("dashboard.html")


@app.get("/about", response_class=HTMLResponse)
def about():
    return serve_page("about.html")

@app.get("/health")
def health():
    return {"status": "ok"}