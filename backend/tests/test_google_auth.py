"""Tests for Emergent Google Auth integration (simulated sessions)."""
import os
import uuid
import subprocess
import json
import requests
import pytest
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"


def _mongo_eval(js: str) -> str:
    """Run a mongosh eval and return stdout."""
    result = subprocess.run(
        ["mongosh", "--quiet", "--eval", js],
        capture_output=True, text=True, timeout=15
    )
    return result.stdout + result.stderr


@pytest.fixture
def seeded_google_session():
    """Seed a user + user_session in mongo. Yields (user_id, session_token, email). Cleans up."""
    uid = f"test-google-user-{uuid.uuid4().hex[:8]}"
    token = f"test_session_{uuid.uuid4().hex}"
    email = f"test.gauth.{uuid.uuid4().hex[:6]}@example.com"
    now = datetime.now(timezone.utc).isoformat()
    exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    js = f"""
    db = db.getSiblingDB('test_database');
    db.users.insertOne({{
      id: '{uid}',
      email: '{email}',
      name: 'GAuth Tester',
      picture: 'https://via.placeholder.com/150',
      auth_provider: 'google',
      created_at: '{now}',
      build_count: 0,
      has_free_build: true
    }});
    db.user_sessions.insertOne({{
      user_id: '{uid}',
      session_token: '{token}',
      created_at: '{now}',
      expires_at: '{exp}'
    }});
    print('OK');
    """
    out = _mongo_eval(js)
    assert "OK" in out, f"seed failed: {out}"

    yield {"user_id": uid, "token": token, "email": email}

    # Cleanup
    _mongo_eval(f"""
    db = db.getSiblingDB('test_database');
    db.users.deleteOne({{id: '{uid}'}});
    db.user_sessions.deleteMany({{session_token: '{token}'}});
    """)


# ─── Google Auth Endpoints ───

class TestGoogleAuth:
    def test_google_session_invalid_id_returns_401(self):
        r = requests.post(f"{API}/auth/google/session",
                          json={"session_id": "definitely-not-a-real-session-xyz"})
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text}"

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
        d = r.json()
        assert d["email"] == s["email"]

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
        assert d["is_free"] is True  # first build

    def test_logout_invalidates_cookie_session(self, seeded_google_session):
        s = seeded_google_session
        # logout using cookie
        r = requests.post(f"{API}/auth/logout", cookies={"session_token": s["token"]})
        assert r.status_code == 200
        # Verify session is now invalid
        r2 = requests.get(f"{API}/auth/me",
                          headers={"Authorization": f"Bearer {s['token']}"})
        assert r2.status_code == 401, f"expected 401 after logout, got {r2.status_code}"
        # Cookie should be cleared (Set-Cookie with delete)
        set_cookie = r.headers.get("set-cookie", "")
        assert "session_token" in set_cookie.lower()

    def test_me_no_auth_returns_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401
