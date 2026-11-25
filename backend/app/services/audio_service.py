import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlparse

from app.models.audio import AudioActionResponse, AudioSink, AudioStatus, NowPlaying

_EMPTY = NowPlaying(available=False, playing=False, status="stopped")


def _run_playerctl(args: list[str]) -> str | None:
    result = subprocess.run(
        ["playerctl", *args],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def get_now_playing() -> NowPlaying:
    raw = _run_playerctl(
        [
            "metadata",
            "--format",
            "{{status}}\x1e{{playerName}}\x1e{{artist}}\x1e{{title}}\x1e{{album}}\x1e{{mpris:artUrl}}",
        ]
    )
    if not raw:
        return _EMPTY

    parts = raw.split("\x1e")
    while len(parts) < 6:
        parts.append("")

    status, player, artist, title, album, art_url = [part.strip() for part in parts[:6]]
    status_norm = status.lower() or "stopped"
    title = title or None
    artist = artist or None
    album = album or None
    available = bool(title or artist or status_norm in {"playing", "paused"})

    return NowPlaying(
        available=available,
        playing=status_norm == "playing",
        status=status_norm,
        player=player or None,
        title=title,
        artist=artist,
        album=album,
        has_art=bool(art_url),
    )


def get_art_path() -> Path | None:
    raw = _run_playerctl(["metadata", "mpris:artUrl"])
    if not raw:
        return None
    parsed = urlparse(raw)
    if parsed.scheme != "file":
        return None
    path = Path(unquote(parsed.path))
    if not path.is_file():
        return None
    return path


def _mic_muted() -> bool:
    result = subprocess.run(
        ["pactl", "get-source-mute", "@DEFAULT_SOURCE@"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return False
    return "yes" in result.stdout.lower()


def get_sinks() -> list[AudioSink]:
    info = subprocess.run(["pactl", "info"], capture_output=True, text=True)
    default = ""
    for line in info.stdout.splitlines():
        if line.startswith("Default Sink:"):
            default = line.split(":", 1)[1].strip()

    listed = subprocess.run(
        ["pactl", "list", "short", "sinks"],
        capture_output=True,
        text=True,
    )
    sinks: list[AudioSink] = []
    if listed.returncode != 0:
        return sinks
    for line in listed.stdout.splitlines():
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        name = parts[1]
        sinks.append(
            AudioSink(
                name=name,
                description=name.split(".")[-1].replace("_", " "),
                default=name == default,
            )
        )
    return sinks


def set_default_sink(name: str) -> AudioStatus:
    subprocess.run(["pactl", "set-default-sink", name], check=True)
    return get_audio_status()


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
    match = re.search(r"(\d+)%", volume_result.stdout)
    volume = int(match.group(1)) if match else 0
    muted = "yes" in mute_result.stdout.lower()
    return AudioStatus(
        volume=volume,
        muted=muted,
        mic_muted=_mic_muted(),
        now_playing=get_now_playing(),
        sinks=get_sinks(),
    )


def set_volume(volume: int) -> AudioStatus:
    subprocess.run(
        ["pactl", "set-sink-volume", "@DEFAULT_SINK@", f"{volume}%"],
        check=True,
    )
    return get_audio_status()


def mute_audio() -> AudioStatus:
    subprocess.run(["pactl", "set-sink-mute", "@DEFAULT_SINK@", "1"], check=True)
    return get_audio_status()


def unmute_audio() -> AudioStatus:
    subprocess.run(["pactl", "set-sink-mute", "@DEFAULT_SINK@", "0"], check=True)
    return get_audio_status()


def mute_mic() -> AudioStatus:
    subprocess.run(["pactl", "set-source-mute", "@DEFAULT_SOURCE@", "1"], check=True)
    return get_audio_status()


def unmute_mic() -> AudioStatus:
    subprocess.run(["pactl", "set-source-mute", "@DEFAULT_SOURCE@", "0"], check=True)
    return get_audio_status()


def play_pause() -> AudioActionResponse:
    result = subprocess.run(["playerctl", "play-pause"], capture_output=True, text=True)
    if result.returncode == 0:
        return AudioActionResponse(success=True, message="Playback toggled")
    _send_player_key("space")
    return AudioActionResponse(success=True, message="Playback toggled")


def next_track() -> AudioActionResponse:
    subprocess.run(["playerctl", "next"], check=True)
    return AudioActionResponse(success=True, message="Skipped to next track")


def previous_track() -> AudioActionResponse:
    subprocess.run(["playerctl", "previous"], check=True)
    return AudioActionResponse(success=True, message="Returned to previous track")


def _player_blob() -> str:
    url = _run_playerctl(["metadata", "xesam:url"]) or ""
    title = _run_playerctl(["metadata", "title"]) or ""
    player = _run_playerctl(["metadata", "--format", "{{playerName}}"]) or ""
    return f"{url} {title} {player}".lower()


def _seek_key(seconds: int) -> str:
    blob = _player_blob()
    youtube = "youtube" in blob
    if youtube:
        return "l" if seconds > 0 else "j"
    return "Right" if seconds > 0 else "Left"


def _send_player_key(key: str) -> None:
    commands = [
        [
            "xdotool",
            "search",
            "--onlyvisible",
            "--class",
            "brave",
            "windowactivate",
            "--sync",
            "key",
            "--clearmodifiers",
            key,
        ],
        ["xdotool", "key", "--clearmodifiers", key],
    ]
    for command in commands:
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode == 0:
            return
    raise RuntimeError("Could not send a key to the player (install xdotool)")


def seek(seconds: int) -> AudioActionResponse:
    if seconds == 0:
        return AudioActionResponse(success=True, message="No seek")
    amount = abs(seconds)
    sign = "+" if seconds > 0 else "-"
    result = subprocess.run(
        ["playerctl", "position", f"{amount}{sign}"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        return AudioActionResponse(success=True, message=f"Seek {seconds}s")
    _send_player_key(_seek_key(seconds))
    return AudioActionResponse(success=True, message=f"Seek {seconds}s")


def toggle_fullscreen() -> AudioActionResponse:
    _send_player_key("f")
    return AudioActionResponse(success=True, message="Toggled fullscreen")
