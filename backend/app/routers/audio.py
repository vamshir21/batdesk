from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.auth import require_api_key
from app.http import linux_call
from app.models.audio import (
    AudioActionResponse,
    AudioStatus,
    SinkRequest,
    VolumeRequest,
)
from app.services.audio_service import (
    get_art_path,
    get_audio_status,
    mute_audio,
    mute_mic,
    next_track,
    play_pause,
    previous_track,
    set_default_sink,
    set_volume,
    unmute_audio,
    unmute_mic,
)

router = APIRouter(
    prefix="/audio",
    tags=["Audio"],
    dependencies=[Depends(require_api_key)],
)


@router.get("/volume", response_model=AudioStatus)
def get_volume():
    return linux_call(get_audio_status)


@router.get("/now-playing", response_model=AudioStatus)
def now_playing():
    return linux_call(get_audio_status)


@router.get("/art")
def album_art():
    path = get_art_path()
    if path is None:
        raise HTTPException(status_code=404, detail="No artwork")
    return FileResponse(path)


@router.post("/volume", response_model=AudioStatus)
def update_volume(request: VolumeRequest):
    return linux_call(set_volume, request.volume)


@router.post("/mute", response_model=AudioStatus)
def mute():
    return linux_call(mute_audio)


@router.post("/unmute", response_model=AudioStatus)
def unmute():
    return linux_call(unmute_audio)


@router.post("/mic/mute", response_model=AudioStatus)
def mic_mute():
    return linux_call(mute_mic)


@router.post("/mic/unmute", response_model=AudioStatus)
def mic_unmute():
    return linux_call(unmute_mic)


@router.post("/sink", response_model=AudioStatus)
def choose_sink(request: SinkRequest):
    return linux_call(set_default_sink, request.name)


@router.post("/play-pause", response_model=AudioActionResponse)
def toggle_play_pause():
    return linux_call(play_pause)


@router.post("/next", response_model=AudioActionResponse)
def next_song():
    return linux_call(next_track)


@router.post("/previous", response_model=AudioActionResponse)
def previous_song():
    return linux_call(previous_track)
