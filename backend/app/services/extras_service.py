import subprocess

from app.models.common import ActionResponse

_inhibit_proc: subprocess.Popen | None = None

LAUNCHERS: dict[str, list[str]] = {
    "files": ["nautilus"],
    "browser": ["brave-browser"],
    "terminal": ["gnome-terminal"],
    "settings": ["gnome-control-center"],
    "spotify": ["spotify"],
    "code": ["code"],
}

BRAVE_BINS = ("brave-browser", "brave-browser-stable", "brave")

BRAVE_SITES: dict[str, str] = {
    "hotstar": "https://www.jiohotstar.com",
    "youtube": "https://www.youtube.com",
    "netflix": "https://www.netflix.com",
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


def _open_in_brave(url: str) -> None:
    for binary in BRAVE_BINS:
        try:
            subprocess.Popen([binary, url])
            return
        except FileNotFoundError:
            continue
    raise RuntimeError("Brave browser is not installed")


def open_url(url: str) -> ActionResponse:
    if not url.startswith(("http://", "https://")):
        raise RuntimeError("URL must start with http:// or https://")
    _open_in_brave(url)
    return ActionResponse(success=True, message="Opened in Brave")


def launch_app(app: str) -> ActionResponse:
    site = BRAVE_SITES.get(app)
    if site:
        _open_in_brave(site)
        return ActionResponse(success=True, message=f"Opening {app} in Brave")

    command = LAUNCHERS.get(app)
    if command is None:
        raise RuntimeError("Unknown app")
    try:
        subprocess.Popen(command)
    except FileNotFoundError as exc:
        if app == "browser":
            _open_in_brave("https://www.google.com")
            return ActionResponse(success=True, message="Opening Brave")
        raise RuntimeError(f"{command[0]} is not installed") from exc
    return ActionResponse(success=True, message=f"Launching {app}")
