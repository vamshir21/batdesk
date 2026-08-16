import subprocess

from app.models.common import ActionResponse


def lock_screen() -> ActionResponse:
    subprocess.run(["loginctl", "lock-session"], check=True)
    return ActionResponse(success=True, message="Screen locked")


def shutdown_system() -> ActionResponse:
    subprocess.Popen(["systemctl", "poweroff"])
    return ActionResponse(success=True, message="System shutting down")


def restart_system() -> ActionResponse:
    subprocess.Popen(["systemctl", "reboot"])
    return ActionResponse(success=True, message="System restarting")


def sleep_system() -> ActionResponse:
    subprocess.Popen(["systemctl", "suspend"])
    return ActionResponse(success=True, message="System going to sleep")
