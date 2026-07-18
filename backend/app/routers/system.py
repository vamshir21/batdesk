from fastapi import APIRouter

from app.services.system_service import lock_screen, shutdown_system, restart_system, sleep_system

router = APIRouter(
    prefix="/system",
    tags=["System"]
)


@router.post("/lock")
def lock():
    return lock_screen()


@router.post("/shutdown")
def shutdown():
    return shutdown_system()


@router.post("/restart")
def restart():
    return restart_system()


@router.post("/sleep")
def sleep():
    return sleep_system()