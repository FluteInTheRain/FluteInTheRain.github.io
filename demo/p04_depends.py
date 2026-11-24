"""clue.api, layered, with FastAPI wiring the way the framework intends it.

layered_app.py builds `service` as a module global. Here the endpoints ask
for the service in their signature and FastAPI hands it over (Depends).
Same service, same repository, same rules: only the wiring moved.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p04_depends:app --port 4334
"""

from functools import lru_cache

from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from layered_data import CaseRepository, InMemoryCaseRepository
from layered_service import CaseNotFoundError, CaseRuleError, CaseService


@lru_cache
def get_repo() -> CaseRepository:
    return InMemoryCaseRepository()  # built once: the dict must outlive a request


def get_service(repo: CaseRepository = Depends(get_repo)) -> CaseService:
    return CaseService(repo)  # a fresh, cheap service per request


app = FastAPI(title="clue.api", version="0.4.0")
router = APIRouter(prefix="/cases", tags=["cases"])


@app.exception_handler(CaseNotFoundError)
async def case_not_found(request: Request, exc: CaseNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(CaseRuleError)
async def rule_refused(request: Request, exc: CaseRuleError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@router.post("", status_code=201)
async def open_case(title: str, service: CaseService = Depends(get_service)) -> dict:
    return vars(service.open_case(title=title))


@router.post("/{case_id}/close")
async def close(
    case_id: str, resolution: str, service: CaseService = Depends(get_service)
) -> dict:
    return vars(service.close(case_id=case_id, resolution=resolution))


app.include_router(router)
