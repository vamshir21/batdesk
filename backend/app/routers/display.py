from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.http import linux_call
from app.models.display import (
    BrightnessRequest,
    BrightnessStatus,
    BrightnessStepRequest,
)
from app.services.display_service import (
    decrease_brightness,
    get_brightness,
    increase_brightness,
    set_brightness,
)

router = APIRouter(
    prefix="/display",
    tags=["Display"],
    dependencies=[Depends(require_api_key)],
)


@router.get("/brightness", response_model=BrightnessStatus)
def brightness():
    return linux_call(get_brightness)


@router.post("/brightness", response_model=BrightnessStatus)
def update_brightness(request: BrightnessRequest):
    return linux_call(set_brightness, request.brightness)


@router.post("/increase", response_model=BrightnessStatus)
def increase(request: BrightnessStepRequest):
    return linux_call(increase_brightness, request.step)


@router.post("/decrease", response_model=BrightnessStatus)
def decrease(request: BrightnessStepRequest):
    return linux_call(decrease_brightness, request.step)
