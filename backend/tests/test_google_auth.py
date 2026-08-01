"""Tests for Emergent Google Auth integration (simulated sessions, direct pymongo seeding)."""
import os
import uuid
import requests
import pytest
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('/app/frontend/.env')
load_dotenv('/app/backend/.env')

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

_client = MongoClient(os.environ['MONGO_URL'])
_db = _client[os.environ['DB_NAME']]


@pytest.fixture
def seeded_google_session():
    """Seed a user + user_session directly via pymongo. Yields ids. Cleans up."""
    uid = f"test-google-user-{uuid.uuid4().hex[:8]}"
    token = f"test_session_{uuid.uuid4().hex}"
    email = f"test.gauth.{uuid.uuid4().hex[:6]}@example.com"
    now = datetime.now(timezone.utc).isoformat()
    exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    _db.users.insert_one({
        "id": uid,
        "email": email,
        "name": "GAuth Tester",
        "picture": "https://via.placeholder.com/150",
        "auth_provider": "google",
        "created_at": now,
        "build_count": 0,
        "has_free_build": True
    })
    _db.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "created_at": now,
        "expires_at": exp
    })

    yield {"user_id": uid, "token": token, "email": email}

    _db.users.delete_one({"id": uid})
    _db.user_sessions.delete_many({"session_token": token})
    _db.builds.delete_many({"user_id": uid})


@pytest.fixture
def seeded_google_only_user():
    """Seed a Google-only user without a password hash and clean it up."""
    uid = f"test-google-only-{uuid.uuid4().hex[:8]}"
    email = f"test.google.only.{uuid.uuid4().hex[:6]}@example.com"
    _db.users.insert_one({
        "id": uid,
        "email": email,
        "name": "Google Only Tester",
        "auth_provider": "google",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "build_count": 0,
        "has_free_build": True,
    })
    yield {"user_id": uid, "email": email}
    _db.users.delete_one({"id": uid})




class TestGoogleAuth:
    def test_google_session_invalid_id_returns_401(self):
        r = requests.post(f"{API}/auth/google/session",
                          json={"session_id": "definitely-not-a-real-session-xyz"})
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text}"

    def test_password_login_rejects_google_only_account(self, seeded_google_only_user):
        r = requests.post(f"{API}/auth/login", json={
            "email": seeded_google_only_user["email"],
            "password": f"unused-{uuid.uuid4().hex}",
        })
        assert r.status_code == 401
        assert r.json()["detail"] == "This account uses Google Sign-In"


    def test_me_with_bearer_session_token(self, seeded_google_session):
        s = seeded_google_session
        r = requests.get(f"{API}/auth/me",
                         headers={"Authorization": f"Bearer {s['token']}"})
        assert r.status_code == 200, f"bearer /me failed: {r.status_code} {r.text}"
        d = r.json()
        assert d["email"] == s["email"]
        assert d["id"] == s["user_id"]

    def test_me_with_cookie_session_token(self, seeded_google_session):
        s = seeded_google_session
        r = requests.get(f"{API}/auth/me",
                         cookies={"session_token": s["token"]})
        assert r.status_code == 200, f"cookie /me failed: {r.status_code} {r.text}"
        assert r.json()["email"] == s["email"]

    def test_protected_builds_get_with_session_token(self, seeded_google_session):
        s = seeded_google_session
        r = requests.get(f"{API}/builds",
                         headers={"Authorization": f"Bearer {s['token']}"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_protected_builds_post_with_session_token(self, seeded_google_session):
        s = seeded_google_session
        r = requests.post(f"{API}/builds",
                          json={"name": "TEST_Google Build", "description": "via session token"},
                          headers={"Authorization": f"Bearer {s['token']}"})
        assert r.status_code == 200, f"POST /builds failed: {r.status_code} {r.text}"
        d = r.json()
        assert d["name"] == "TEST_Google Build"
        assert d["is_free"]  # first build

    def test_logout_invalidates_cookie_session(self, seeded_google_session):
        s = seeded_google_session
        r = requests.post(f"{API}/auth/logout", cookies={"session_token": s["token"]})
        assert r.status_code == 200
        r2 = requests.get(f"{API}/auth/me",
                          headers={"Authorization": f"Bearer {s['token']}"})
        assert r2.status_code == 401, f"expected 401 after logout, got {r2.status_code}"
        assert "session_token" in r.headers.get("set-cookie", "").lower()

    def test_logout_invalidates_bearer_session(self, seeded_google_session):
        s = seeded_google_session
        r = requests.post(f"{API}/auth/logout",
                          headers={"Authorization": f"Bearer {s['token']}"})
        assert r.status_code == 200
        r2 = requests.get(f"{API}/auth/me", cookies={"session_token": s["token"]})
        assert r2.status_code == 401

    def test_me_no_auth_returns_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401
