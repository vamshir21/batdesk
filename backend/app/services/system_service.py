import subprocess


def lock_screen():
    subprocess.run(
        ["loginctl", "lock-session"],
        check=True
    )

    return {
        "success": True,
        "message": "Screen locked successfully"
    }



def shutdown_system():
    subprocess.run(
        ["systemctl", "poweroff"],
        check=True
    )

    return {
        "success": True,
        "message": "System shutting down."
    }


def restart_system():
    subprocess.run(
        ["systemctl", "reboot"],
        check=True
    )

    return {
        "success": True,
        "message": "System restarting."
    }




def sleep_system():
    subprocess.run(
        ["systemctl", "suspend"],
        check=True
    )

    return {
        "success": True,
        "message": "System is going to sleep."
    }