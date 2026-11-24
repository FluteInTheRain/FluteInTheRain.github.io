import secrets

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

import p07_security as sec

SESSIONS: dict[str, str] = {}  # session id -> username, kept on the server

app = FastAPI()


@app.post("/session/login")
def session_login() -> dict:
    sid = secrets.token_urlsafe(16)
    SESSIONS[sid] = "alice"
    return {"sid": sid}


@app.post("/session/logout")
def session_logout(x_session: str = Header()) -> dict:
    SESSIONS.pop(x_session, None)  # revoking = deleting one dict entry
    return {"ok": True}


@app.get("/session/me")
def session_me(x_session: str = Header()) -> dict:
    user = SESSIONS.get(x_session)
    if user is None:
        raise HTTPException(401, "session unknown")
    return {"user": user}


@app.get("/jwt/me")
def jwt_me(user: str = Depends(sec.get_current_user)) -> dict:
    return {"user": user}


client = TestClient(app)
sid = client.post("/session/login").json()["sid"]
token = sec.make_token("alice", [])

print("before logout")
print("  session :", client.get("/session/me", headers={"x-session": sid}).status_code)
print("  jwt     :", client.get("/jwt/me", headers={"Authorization": f"Bearer {token}"}).status_code)

client.post("/session/logout", headers={"x-session": sid})
print("after logout (the server 'forgets' alice)")
print("  session :", client.get("/session/me", headers={"x-session": sid}).status_code)
print("  jwt     :", client.get("/jwt/me", headers={"Authorization": f"Bearer {token}"}).status_code)
print("  jwt claims still say:", jwt.decode(token, options={"verify_signature": False})["sub"])
