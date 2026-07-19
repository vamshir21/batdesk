import re
import subprocess

from app.models.audio import AudioStatus


def get_audio_status() -> AudioStatus:
    volume_result = subprocess.run(
        ["pactl", "get-sink-volume", "@DEFAULT_SINK@"],
        capture_output=True,
        text=True,
        check=True,
    )

    mute_result = subprocess.run(
        ["pactl", "get-sink-mute", "@DEFAULT_SINK@"],
        capture_output=True,
        text=True,
        check=True,
    )

    volume_output = volume_result.stdout
    mute_output = mute_result.stdout

    match = re.search(r"(\d+)%", volume_output)

    volume = int(match.group(1)) if match else 0
    muted = "yes" in mute_output.lower()

    return AudioStatus(
        volume=volume,
        muted=muted,
    )

def set_volume(volume: int):
    subprocess.run(
        ["pactl", "set-sink-volume", "@DEFAULT_SINK@", f"{volume}%"],
        check=True,
    )

    return get_audio_status()




def mute_audio():
    subprocess.run(
        ["pactl", "set-sink-mute", "@DEFAULT_SINK@", "1"],
        check=True,
    )
    return get_audio_status()


def unmute_audio():
    subprocess.run(
        ["pactl", "set-sink-mute", "@DEFAULT_SINK@", "0"],
        check=True,
    )
    return get_audio_status()


def play_pause():
    subprocess.run(
        ["playerctl", "play-pause"],
        check=True,
    )

    return {
        "success": True,
        "message": "Playback toggled"
    }


def next_track():
    subprocess.run(
        ["playerctl", "next"],
        check=True,
    )

    return {
        "success": True,
        "message": "Skipped to next track"
    }


def previous_track():
    subprocess.run(
        ["playerctl", "previous"],
        check=True,
    )

    return {
        "success": True,
        "message": "Returned to previous track"
    }