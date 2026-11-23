import base64
import json
import sys

import httpx

import p07_security as sec

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4337"
client = httpx.Client(base_url=base)


def show(label: str, response: httpx.Response) -> None:
    print(f"{label:<28} -> {response.status_code} {response.json()}")


def get_token(user: str, password: str, scope: str) -> str:
    r = client.post("/token", data={"username": user, "password": password, "scope": scope})
    return r.json()["access_token"]


def me(token: str | None) -> httpx.Response:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return client.get("/me", headers=headers)


good = get_token("alice", "alice-demo-pw", "cases:read cases:write")
show("no token", me(None))
show("valid token", me(good))
show("expired token", me(sec.make_token("alice", ["cases:read"], minutes=-1)))

# Tamper: edit the payload (claim more scopes), keep the old signature.
head, payload, sig = good.split(".")
claims = json.loads(base64.urlsafe_b64decode(payload + "=="))
claims["sub"] = "admin"
forged = base64.urlsafe_b64encode(json.dumps(claims).encode()).rstrip(b"=").decode()
show("tampered payload", me(f"{head}.{forged}.{sig}"))

# alg=none: a token that claims it needs no signature at all.
none_head = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').rstrip(b"=").decode()
show("alg=none", me(f"{none_head}.{forged}."))
show("wrong password", client.post("/token", data={"username": "alice", "password": "nope"}))
