import subprocess

from app.models.display import BrightnessStatus


def _current_percentage() -> int:
    current = int(
        subprocess.run(
            ["brightnessctl", "get"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )

    maximum = int(
        subprocess.run(
            ["brightnessctl", "max"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )

    return round(current * 100 / maximum)


def get_brightness() -> BrightnessStatus:
    return BrightnessStatus(
        brightness=_current_percentage()
    )


def set_brightness(level: int) -> BrightnessStatus:
    subprocess.run(
        ["brightnessctl", "set", f"{level}%"],
        check=True,
    )

    return get_brightness()


def increase_brightness(step: int) -> BrightnessStatus:
    current = _current_percentage()

    new_level = min(current + step, 100)

    return set_brightness(new_level)


def decrease_brightness(step: int) -> BrightnessStatus:
    current = _current_percentage()

    new_level = max(current - step, 0)

    return set_brightness(new_level)