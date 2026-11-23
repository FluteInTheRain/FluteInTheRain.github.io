import sys

import httpx
import jwt

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4337"
client = httpx.Client(base_url=base)

for user, password in [("alice", "alice-demo-pw"), ("bob", "bob-demo-pw")]:
    # Both users ask for both scopes. The server decides what they actually get.
    r = client.post(
        "/token",
        data={"username": user, "password": password, "scope": "cases:read cases:write"},
    )
    token = r.json()["access_token"]
    # A JWT is signed, not secret: anyone holding it can read the claims.
    claims = jwt.decode(token, options={"verify_signature": False})
    print(f"{user}: granted {claims['scopes']}")
    headers = {"Authorization": f"Bearer {token}"}
    reports = client.get("/reports", headers=headers)
    purge = client.post("/purge", headers=headers)
    print(f"  GET  /reports -> {reports.status_code} {reports.json()}")
    print(f"  POST /purge   -> {purge.status_code} {purge.json()}")
