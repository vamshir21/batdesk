from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.http import linux_call
from app.models.common import ActionResponse
from app.models.extras import (
    AwakeRequest,
    ClipboardRequest,
    LaunchRequest,
    NotifyRequest,
    OpenUrlRequest,
)
from app.services.extras_service import (
    keep_awake_enabled,
    launch_app,
    open_url,
    send_notification,
    set_clipboard,
    set_keep_awake,
)
from app.services.system_service import (
    lock_screen,
    restart_system,
    shutdown_system,
    sleep_system,
)

router = APIRouter(
    prefix="/system",
    tags=["System"],
    dependencies=[Depends(require_api_key)],
)


@router.post("/lock", response_model=ActionResponse)
def lock():
    return linux_call(lock_screen)


@router.post("/shutdown", response_model=ActionResponse)
def shutdown():
    return linux_call(shutdown_system)


@router.post("/restart", response_model=ActionResponse)
def restart():
    return linux_call(restart_system)


@router.post("/sleep", response_model=ActionResponse)
def sleep():
    return linux_call(sleep_system)


@router.get("/awake")
def awake_status():
    return {"enabled": keep_awake_enabled()}


@router.post("/awake", response_model=ActionResponse)
def awake(request: AwakeRequest):
    return linux_call(set_keep_awake, request.enabled)


@router.post("/notify", response_model=ActionResponse)
def notify(request: NotifyRequest):
    return linux_call(send_notification, request.title, request.body)


@router.post("/clipboard", response_model=ActionResponse)
def clipboard(request: ClipboardRequest):
    return linux_call(set_clipboard, request.text)


@router.post("/open-url", response_model=ActionResponse)
def browse(request: OpenUrlRequest):
    return linux_call(open_url, request.url)


@router.post("/launch", response_model=ActionResponse)
def launch(request: LaunchRequest):
    return linux_call(launch_app, request.app)
