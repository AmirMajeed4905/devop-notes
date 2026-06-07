import os
import uuid

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "testsecret"

from fastapi.testclient import TestClient
from app.database import Base, engine
from app.main import app

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)


def teardown_module(module):
    pass


def unique_email():
    return f"user-{uuid.uuid4().hex[:10]}@example.com"


def auth_headers(email: str, password: str):
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_homepage_loads():
    response = client.get("/")
    assert response.status_code == 200
    assert "Notes Studio" in response.text


def test_register_and_login():
    email = unique_email()
    password = "StrongP@ssw0rd"
    register = client.post("/auth/register", json={"email": email, "password": password})
    assert register.status_code == 200
    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"


def test_note_crud_lifecycle():
    email = unique_email()
    password = "TestPass123!"
    headers = auth_headers(email, password)

    create_resp = client.post("/notes", json={"title": "First note", "content": "This is a test."}, headers=headers)
    assert create_resp.status_code == 200
    note = create_resp.json()
    assert note["title"] == "First note"

    list_resp = client.get("/notes", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    note_id = note["id"]
    update_resp = client.put(f"/notes/{note_id}", json={"title": "Updated", "content": "Changed."}, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated"

    delete_resp = client.delete(f"/notes/{note_id}", headers=headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["message"] == "Note deleted"

    list_resp = client.get("/notes", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json() == []
