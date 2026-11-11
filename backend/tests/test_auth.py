"""Test đăng ký / đăng nhập. Không cần model AI (không chạy lifespan của app)."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import hash_password, verify_password

EMAIL = "nongdan@example.com"
PASSWORD = "matkhau-test-123"


@pytest.fixture(scope="module")
def client():
    from app.database import init_db
    from app.main import app

    init_db()  # tạo bảng users trong DB tạm (xem conftest.py)
    return TestClient(app)  # không dùng "with" -> không load model


def test_hash_roundtrip():
    h = hash_password(PASSWORD)
    assert PASSWORD not in h
    assert h != hash_password(PASSWORD)  # salt ngẫu nhiên
    assert verify_password(PASSWORD, h)
    assert not verify_password(PASSWORD + "x", h)
    assert not verify_password(PASSWORD, "chuoi-bam-hong")


def test_register_ok(client):
    r = client.post(
        "/api/auth/register",
        json={"email": EMAIL, "password": PASSWORD, "full_name": "Nông Dân"},
    )
    assert r.status_code == 201
    d = r.json()
    assert d["email"] == EMAIL and d["full_name"] == "Nông Dân"
    assert "password" not in r.text  # không lộ mật khẩu / chuỗi băm


def test_password_stored_hashed(client):
    from app.database import SessionLocal
    from app.models.user import User

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == EMAIL).one()
    assert user.password_hash.startswith("scrypt$")
    assert PASSWORD not in user.password_hash


def test_register_duplicate(client):
    r = client.post(
        "/api/auth/register", json={"email": EMAIL.upper(), "password": PASSWORD}
    )
    assert r.status_code == 409


@pytest.mark.parametrize(
    "body",
    [
        {"email": "khong-phai-email", "password": PASSWORD},
        {"email": "a@example.com", "password": "ngan"},
        {"email": "a@example.com"},
    ],
)
def test_register_invalid(client, body):
    assert client.post("/api/auth/register", json=body).status_code == 422


def test_login_ok(client):
    r = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == EMAIL


def test_login_email_case_insensitive(client):
    r = client.post(
        "/api/auth/login", json={"email": EMAIL.upper(), "password": PASSWORD}
    )
    assert r.status_code == 200


def test_login_wrong_password_and_unknown_email_look_the_same(client):
    wrong = client.post(
        "/api/auth/login", json={"email": EMAIL, "password": "sai-mat-khau"}
    )
    unknown = client.post(
        "/api/auth/login", json={"email": "ai-do@example.com", "password": PASSWORD}
    )
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()  # không lộ email nào đã đăng ký


def test_login_inactive_user(client):
    from app.database import SessionLocal
    from app.models.user import User

    with SessionLocal() as db:
        db.query(User).filter(User.email == EMAIL).update({"is_active": False})
        db.commit()
    r = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert r.status_code == 403


# --- Phiên đăng nhập: token, /me, /logout ---
SESSION_EMAIL = "phien@example.com"


@pytest.fixture
def token(client):
    client.post(
        "/api/auth/register",
        json={"email": SESSION_EMAIL, "password": PASSWORD, "full_name": "Phiên"},
    )
    r = client.post("/api/auth/login", json={"email": SESSION_EMAIL, "password": PASSWORD})
    assert r.status_code == 200
    return r.json()["access_token"]


def _auth(t):
    return {"Authorization": f"Bearer {t}"}


def test_login_returns_token_and_stores_only_hash(client, token):
    from app.database import SessionLocal
    from app.models.session import AuthSession

    assert len(token) >= 40
    with SessionLocal() as db:
        hashes = [s.token_hash for s in db.query(AuthSession).all()]
    assert token not in hashes  # DB không chứa token gốc


def test_me_with_token(client, token):
    r = client.get("/api/auth/me", headers=_auth(token))
    assert r.status_code == 200
    assert r.json()["email"] == SESSION_EMAIL


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer sai-token"}])
def test_me_without_valid_token(client, headers):
    assert client.get("/api/auth/me", headers=headers).status_code == 401


def test_logout_revokes_token(client, token):
    assert client.post("/api/auth/logout", headers=_auth(token)).status_code == 204
    assert client.get("/api/auth/me", headers=_auth(token)).status_code == 401
    assert client.post("/api/auth/logout", headers=_auth(token)).status_code == 401


def test_logout_only_affects_current_session(client, token):
    other = client.post(
        "/api/auth/login", json={"email": SESSION_EMAIL, "password": PASSWORD}
    ).json()["access_token"]
    client.post("/api/auth/logout", headers=_auth(token))
    assert client.get("/api/auth/me", headers=_auth(other)).status_code == 200


def test_expired_token_rejected(client, token):
    from datetime import datetime, timedelta, timezone

    from app.core.security import hash_token
    from app.database import SessionLocal
    from app.models.session import AuthSession

    with SessionLocal() as db:
        db.query(AuthSession).filter(AuthSession.token_hash == hash_token(token)).update(
            {"expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)}
        )
        db.commit()
    r = client.get("/api/auth/me", headers=_auth(token))
    assert r.status_code == 401
    assert "hết hạn" in r.json()["detail"]


def test_inactive_user_token_rejected(client, token):
    from app.database import SessionLocal
    from app.models.user import User

    with SessionLocal() as db:
        db.query(User).filter(User.email == SESSION_EMAIL).update({"is_active": False})
        db.commit()
    try:
        assert client.get("/api/auth/me", headers=_auth(token)).status_code == 401
    finally:
        with SessionLocal() as db:
            db.query(User).filter(User.email == SESSION_EMAIL).update({"is_active": True})
            db.commit()
