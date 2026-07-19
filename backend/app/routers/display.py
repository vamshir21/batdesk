from fastapi import APIRouter

from app.models.display import (
    BrightnessRequest,
    BrightnessStatus,
    BrightnessStepRequest,
)

from app.services.display_service import (
    get_brightness,
    set_brightness,
    increase_brightness,
    decrease_brightness,
)

router = APIRouter(
    prefix="/api/v1/display",
    tags=["Display"],
)


@router.get("/brightness", response_model=BrightnessStatus)
def brightness():
    return get_brightness()


@router.post("/brightness", response_model=BrightnessStatus)
def update_brightness(request: BrightnessRequest):
    return set_brightness(request.brightness)


@router.post("/increase", response_model=BrightnessStatus)
def increase(request: BrightnessStepRequest):
    return increase_brightness(request.step)


@router.post("/decrease", response_model=BrightnessStatus)
def decrease(request: BrightnessStepRequest):
    return decrease_brightness(request.step)