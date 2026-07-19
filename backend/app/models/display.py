from pydantic import BaseModel, Field


class BrightnessStatus(BaseModel):
    brightness: int


class BrightnessRequest(BaseModel):
    brightness: int = Field(ge=0, le=100)


class BrightnessStepRequest(BaseModel):
    step: int = Field(default=10, ge=1, le=100)