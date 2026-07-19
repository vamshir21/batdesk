from fastapi import APIRouter

from app.models.audio import AudioStatus
from app.services.audio_service import get_audio_status
from app.models.audio import VolumeRequest

from app.services.audio_service import (
    get_audio_status,
    set_volume,
)

from app.models.audio import (
    AudioStatus,
    VolumeRequest,
    AudioActionResponse,
)

from app.services.audio_service import (
    get_audio_status,
    set_volume,
    mute_audio,
    unmute_audio,
    play_pause,
    next_track,
    previous_track,
)


router = APIRouter(
    prefix="/api/v1/audio",
    tags=["Audio"],
)


@router.get("/volume", response_model=AudioStatus)
def get_volume():
    return get_audio_status()


@router.post("/volume", response_model=AudioStatus)
def update_volume(request: VolumeRequest):
    return set_volume(request.volume)






@router.get("/volume", response_model=AudioStatus)
def get_volume():
    return get_audio_status()


@router.post("/volume", response_model=AudioStatus)
def update_volume(request: VolumeRequest):
    return set_volume(request.volume)


@router.post("/mute", response_model=AudioStatus)
def mute():
    return mute_audio()


@router.post("/unmute", response_model=AudioStatus)
def unmute():
    return unmute_audio()


@router.post("/play-pause", response_model=AudioActionResponse)
def toggle_play_pause():
    return play_pause()


@router.post("/next", response_model=AudioActionResponse)
def next_song():
    return next_track()


@router.post("/previous", response_model=AudioActionResponse)
def previous_song():
    return previous_track()