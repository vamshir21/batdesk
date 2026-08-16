import subprocess
from pathlib import Path

from app.models.common import ActionResponse

_inhibit_proc: subprocess.Popen | None = None

LAUNCHERS: dict[str, list[str]] = {
    "files": ["nautilus"],
    "browser": ["xdg-open", "https://www.google.com"],
    "terminal": ["gnome-terminal"],
    "settings": ["gnome-control-center"],
    "spotify": ["spotify"],
    "code": ["code"],
}


def keep_awake_enabled() -> bool:
    return _inhibit_proc is not None and _inhibit_proc.poll() is None


def set_keep_awake(enabled: bool) -> ActionResponse:
    global _inhibit_proc
    if enabled:
        if keep_awake_enabled():
            return ActionResponse(success=True, message="Already keeping the PC awake")
        _inhibit_proc = subprocess.Popen(
            [
                "systemd-inhibit",
                "--what=idle:sleep",
                "--who=BatDesk",
                "--why=Keep awake from tablet",
                "sleep",
                "infinity",
            ]
        )
        return ActionResponse(success=True, message="PC will stay awake")

    if _inhibit_proc and _inhibit_proc.poll() is None:
        _inhibit_proc.terminate()
    _inhibit_proc = None
    return ActionResponse(success=True, message="Idle allowed again")


def send_notification(title: str, body: str) -> ActionResponse:
    subprocess.run(["notify-send", "-a", "BatDesk", title, body], check=True)
    return ActionResponse(success=True, message="Notification sent")


def set_clipboard(text: str) -> ActionResponse:
    for command in (
        ["wl-copy"],
        ["xclip", "-selection", "clipboard"],
        ["xsel", "--clipboard", "--input"],
    ):
        try:
            subprocess.run(command, input=text, text=True, check=True)
            return ActionResponse(success=True, message="Copied on the PC")
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    raise RuntimeError("No clipboard tool (wl-copy, xclip, or xsel)")


def open_url(url: str) -> ActionResponse:
    if not url.startswith(("http://", "https://")):
        raise RuntimeError("URL must start with http:// or https://")
    subprocess.Popen(["xdg-open", url])
    return ActionResponse(success=True, message="Opened on the PC")


def launch_app(app: str) -> ActionResponse:
    command = LAUNCHERS.get(app)
    if command is None:
        raise RuntimeError("Unknown app")
    subprocess.Popen(command)
    return ActionResponse(success=True, message=f"Launching {app}")
