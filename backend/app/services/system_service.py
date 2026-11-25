import getpass
import os
import subprocess

from app.models.common import ActionResponse


def _run(command: list[str], *, timeout: float = 8) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
        env=os.environ,
    )


def _detail(proc: subprocess.CompletedProcess[str]) -> str:
    return (proc.stderr or proc.stdout or "").strip()


def _gdbus(dest: str, path: str, method: str) -> subprocess.CompletedProcess[str]:
    return _run(
        [
            "gdbus",
            "call",
            "--session",
            "--dest",
            dest,
            "--object-path",
            path,
            "--method",
            method,
        ]
    )


def _graphical_session_ids() -> list[str]:
    user = getpass.getuser()
    listed = _run(["loginctl", "list-sessions", "--no-legend"])
    if listed.returncode != 0:
        return []

    session_ids: list[str] = []
    for line in listed.stdout.splitlines():
        parts = line.split()
        if len(parts) < 3 or parts[2] != user:
            continue
        session_id = parts[0]
        shown = _run(
            [
                "loginctl",
                "show-session",
                session_id,
                "-p",
                "Type",
                "-p",
                "Class",
                "-p",
                "CanLock",
            ]
        )
        props = dict(row.split("=", 1) for row in shown.stdout.splitlines() if "=" in row)
        if props.get("Class") != "user":
            continue
        if props.get("CanLock") == "yes" or props.get("Type") in {"wayland", "x11"}:
            session_ids.append(session_id)
    return session_ids


def _as_logged_in_user(command: list[str]) -> subprocess.CompletedProcess[str]:
    """Run through user systemd so polkit treats us as the seated user, not system.slice."""
    return _run(
        [
            "systemd-run",
            "--user",
            "--quiet",
            "--collect",
            "--wait",
            "--pipe",
            *command,
        ],
        timeout=12,
    )


def _first_ok(attempts: list, message: str) -> ActionResponse:
    errors: list[str] = []
    for attempt in attempts:
        proc = attempt()
        if proc.returncode == 0:
            return ActionResponse(success=True, message=message)
        detail = _detail(proc)
        if detail:
            errors.append(detail)
    raise RuntimeError(errors[-1] if errors else "Command failed")


def lock_screen() -> ActionResponse:
    attempts = [
        lambda: _gdbus(
            "org.gnome.ScreenSaver",
            "/org/gnome/ScreenSaver",
            "org.gnome.ScreenSaver.Lock",
        ),
        lambda: _gdbus(
            "org.freedesktop.ScreenSaver",
            "/org/freedesktop/ScreenSaver",
            "org.freedesktop.ScreenSaver.Lock",
        ),
    ]
    for session_id in _graphical_session_ids():
        attempts.append(lambda sid=session_id: _run(["loginctl", "lock-session", sid]))
    attempts.append(lambda: _as_logged_in_user(["loginctl", "lock-sessions"]))
    return _first_ok(attempts, "Screen locked")


def _session_power(method: str) -> subprocess.CompletedProcess[str]:
    return _gdbus(
        "org.gnome.SessionManager",
        "/org/gnome/SessionManager",
        f"org.gnome.SessionManager.{method}",
    )


def _logind(method: str) -> subprocess.CompletedProcess[str]:
    return _as_logged_in_user(
        [
            "busctl",
            "call",
            "org.freedesktop.login1",
            "/org/freedesktop/login1",
            "org.freedesktop.login1.Manager",
            method,
            "b",
            "false",
        ]
    )


def shutdown_system() -> ActionResponse:
    return _first_ok(
        [
            lambda: _session_power("Shutdown"),
            lambda: _logind("PowerOff"),
            lambda: _as_logged_in_user(["loginctl", "poweroff"]),
        ],
        "System shutting down",
    )


def restart_system() -> ActionResponse:
    return _first_ok(
        [
            lambda: _session_power("Reboot"),
            lambda: _logind("Reboot"),
            lambda: _as_logged_in_user(["loginctl", "reboot"]),
        ],
        "System restarting",
    )


def sleep_system() -> ActionResponse:
    return _first_ok(
        [
            lambda: _session_power("Suspend"),
            lambda: _logind("Suspend"),
            lambda: _as_logged_in_user(["loginctl", "suspend"]),
        ],
        "System going to sleep",
    )
