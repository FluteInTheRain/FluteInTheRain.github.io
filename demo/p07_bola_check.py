import sys

import httpx

base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4337"
client = httpx.Client(base_url=base)


def token(user: str, password: str) -> dict:
    r = client.post("/token", data={"username": user, "password": password, "scope": "cases:read"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


bob = token("bob", "bob-demo-pw")
alice = token("alice", "alice-demo-pw")


def show(label: str, path: str, headers: dict) -> None:
    r = client.get(path, headers=headers)
    print(f"{label:<34} {path:<26} -> {r.status_code} {r.json()}")


show("before: bob reads alice's case", "/vulnerable/cases/C-1", bob)
show("after : bob reads alice's case", "/cases/C-1", bob)
show("after : bob reads his own case", "/cases/C-2", bob)
show("after : alice reads her own case", "/cases/C-1", alice)
show("after : a case that does not exist", "/cases/C-9", bob)
