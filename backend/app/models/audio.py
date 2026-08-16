from pydantic import BaseModel, Field

from app.models.common import ActionResponse


class NowPlaying(BaseModel):
    available: bool
    playing: bool
    status: str
    player: str | None = None
    title: str | None = None
    artist: str | None = None
    album: str | None = None
    has_art: bool = False


class AudioSink(BaseModel):
    name: str
    description: str
    default: bool


class AudioStatus(BaseModel):
    volume: int
    muted: bool
    mic_muted: bool
    now_playing: NowPlaying
    sinks: list[AudioSink] = []


class VolumeRequest(BaseModel):
    volume: int = Field(ge=0, le=100)


class SinkRequest(BaseModel):
    name: str


class AudioActionResponse(ActionResponse):
    pass
