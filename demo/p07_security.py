import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Security, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
from pwdlib import PasswordHash

# Obviously fake default so the demo runs; real deploys inject it from the environment.
SECRET_KEY = os.environ.get("CLUE_JWT_SECRET", "dev-only-not-a-real-secret-change-me-please")
ALGORITHM = "HS256"
TOKEN_MINUTES = 15

hasher = PasswordHash.recommended()
SCOPES = {"cases:read": "Read cases", "cases:write": "Close and purge cases"}

# In-memory user store: the hash is stored, the password never is.
USERS = {
    "alice": {"hash": hasher.hash("alice-demo-pw"), "scopes": ["cases:read", "cases:write"]},
    "bob": {"hash": hasher.hash("bob-demo-pw"), "scopes": ["cases:read"]},
}
DUMMY_HASH = hasher.hash("not-a-real-password")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", scopes=SCOPES)
router = APIRouter()


def make_token(username: str, scopes: list[str], minutes: int = TOKEN_MINUTES) -> str:
    claims = {
        "sub": username,
        "scopes": scopes,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes),
    }
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)


# Plain `def`: Argon2 takes ~30 ms of CPU, so FastAPI runs it in a worker thread
# instead of freezing the event loop.
@router.post("/token")
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict:
    user = USERS.get(form.username)
    # Verify against a dummy hash for unknown users so both paths cost the same time.
    ok = hasher.verify(form.password, user["hash"] if user else DUMMY_HASH)
    if not user or not ok:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "incorrect username or password")
    # The client asks for scopes; the user's own allowance decides what it gets.
    granted = [s for s in form.scopes if s in user["scopes"]]
    return {"access_token": make_token(form.username, granted), "token_type": "bearer"}


async def get_current_user(
    security_scopes: SecurityScopes,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> str:
    try:
        # algorithms is pinned: the token never gets to choose how it is verified.
        claims = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "token expired", {"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "invalid token", {"WWW-Authenticate": "Bearer"}
        )
    granted = claims.get("scopes", [])
    for needed in security_scopes.scopes:
        if needed not in granted:
            # Identity is fine, permission is not: 403, not 401.
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"missing scope {needed}")
    return claims["sub"]


@router.get("/me")
async def me(user: Annotated[str, Depends(get_current_user)]) -> dict:
    return {"user": user}


@router.get("/reports")
async def reports(
    user: Annotated[str, Security(get_current_user, scopes=["cases:read"])],
) -> dict:
    return {"user": user, "reports": ["weekly-summary"]}


@router.post("/purge")
async def purge(
    user: Annotated[str, Security(get_current_user, scopes=["cases:write"])],
) -> dict:
    return {"user": user, "purged": True}


app = FastAPI(title="clue.api", version="0.7.0")
app.include_router(router)
