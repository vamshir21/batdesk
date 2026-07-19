from pydantic import BaseModel , Field


class AudioStatus(BaseModel):
    volume: int
    muted: bool




class VolumeRequest(BaseModel):
    volume: int = Field(ge=0, le=100)




class AudioStatus(BaseModel):
    volume: int
    muted: bool


class VolumeRequest(BaseModel):
    volume: int = Field(ge=0, le=100)


class AudioActionResponse(BaseModel):
    success: bool
    message: str