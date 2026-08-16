from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.http import linux_call
from app.models.status import SystemStatus
from app.services.status_service import get_system_status

router = APIRouter(tags=["Status"])


@router.get("/health")
def health():
    return {"ok": True}


@router.get("/status", response_model=SystemStatus, dependencies=[Depends(require_api_key)])
def status():
    return linux_call(get_system_status)
