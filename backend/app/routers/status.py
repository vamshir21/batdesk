from fastapi import APIRouter

from app.services.status_service import get_system_status
from app.models.status import SystemStatus

router = APIRouter()


@router.get("/status", response_model=SystemStatus)
def status():
    return get_system_status()