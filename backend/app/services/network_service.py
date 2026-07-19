import subprocess

from app.models.network import (
    ActiveConnection,
    BluetoothDevice,
    BluetoothStatus,
    NetworkActionResponse,
    NetworkInterface,
    WifiNetwork,
    WifiStatus,
)


# =====================================================
# Helpers
# =====================================================

def _run_command(command: list[str]) -> str:
    """Execute a shell command and return stdout."""
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())

    return result.stdout.strip()


# =====================================================
# Wi-Fi
# =====================================================

def get_wifi_status() -> WifiStatus:
    radio = _run_command(["nmcli", "radio", "wifi"])
    enabled = radio.lower() == "enabled"

    device_output = _run_command(
        ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE", "device"]
    )

    connected = False
    ssid = None
    signal = None

    for line in device_output.splitlines():
        parts = line.split(":")
        if len(parts) < 3:
            continue

        _, device_type, state = parts

        if device_type == "wifi" and state == "connected":
            connected = True
            break

    if connected:
        wifi_output = _run_command(
            ["nmcli", "-t", "-f", "ACTIVE,SSID,SIGNAL", "dev", "wifi"]
        )

        for line in wifi_output.splitlines():
            parts = line.split(":")
            if len(parts) != 3:
                continue

            active, wifi_name, wifi_signal = parts

            if active == "yes":
                ssid = wifi_name
                signal = int(wifi_signal)
                break

    return WifiStatus(
        enabled=enabled,
        connected=connected,
        ssid=ssid,
        signal=signal,
    )


def scan_wifi() -> list[WifiNetwork]:
    output = _run_command(
        [
            "nmcli",
            "-t",
            "-f",
            "SSID,SIGNAL,SECURITY",
            "device",
            "wifi",
            "list",
        ]
    )

    networks = []

    seen = set()

    for line in output.splitlines():
        parts = line.split(":")

        if len(parts) < 3:
            continue

        ssid = parts[0].strip()

        if not ssid:
            continue

        if ssid in seen:
            continue

        seen.add(ssid)

        signal = int(parts[1]) if parts[1].isdigit() else 0

        security = ":".join(parts[2:]).strip()

        networks.append(
            WifiNetwork(
                ssid=ssid,
                signal=signal,
                security=security,
            )
        )

    return sorted(networks, key=lambda x: x.signal, reverse=True)


def connect_wifi(ssid: str, password: str) -> NetworkActionResponse:
    _run_command(
        [
            "nmcli",
            "device",
            "wifi",
            "connect",
            ssid,
            "password",
            password,
        ]
    )

    return NetworkActionResponse(
        success=True,
        message=f"Connected to {ssid}",
    )


def disconnect_wifi() -> NetworkActionResponse:
    output = _run_command(
        ["nmcli", "-t", "-f", "DEVICE,TYPE", "device"]
    )

    wifi_device = None

    for line in output.splitlines():
        device, device_type = line.split(":")

        if device_type == "wifi":
            wifi_device = device
            break

    if wifi_device:
        _run_command(
            [
                "nmcli",
                "device",
                "disconnect",
                wifi_device,
            ]
        )

    return NetworkActionResponse(
        success=True,
        message="Wi-Fi disconnected",
    )


def enable_wifi() -> NetworkActionResponse:
    _run_command(["nmcli", "radio", "wifi", "on"])

    return NetworkActionResponse(
        success=True,
        message="Wi-Fi enabled",
    )


def disable_wifi() -> NetworkActionResponse:
    _run_command(["nmcli", "radio", "wifi", "off"])

    return NetworkActionResponse(
        success=True,
        message="Wi-Fi disabled",
    )


# =====================================================
# Bluetooth
# =====================================================

def get_bluetooth_status() -> BluetoothStatus:
    output = _run_command(["bluetoothctl", "show"])

    powered = False
    discovering = False

    for line in output.splitlines():
        line = line.strip()

        if line.startswith("Powered:"):
            powered = line.split(":")[1].strip().lower() == "yes"

        elif line.startswith("Discovering:"):
            discovering = line.split(":")[1].strip().lower() == "yes"

    return BluetoothStatus(
        enabled=powered,
        discovering=discovering,
    )


def get_bluetooth_devices() -> list[BluetoothDevice]:
    paired = _run_command(["bluetoothctl", "devices"])

    connected_output = _run_command(
        ["bluetoothctl", "devices", "Connected"]
    )

    connected_set = set()

    for line in connected_output.splitlines():
        parts = line.split(maxsplit=2)

        if len(parts) >= 2:
            connected_set.add(parts[1])

    devices = []

    for line in paired.splitlines():
        parts = line.split(maxsplit=2)

        if len(parts) < 3:
            continue

        devices.append(
            BluetoothDevice(
                mac_address=parts[1],
                name=parts[2],
                connected=parts[1] in connected_set,
            )
        )

    return devices


def enable_bluetooth() -> NetworkActionResponse:
    _run_command(["bluetoothctl", "power", "on"])

    return NetworkActionResponse(
        success=True,
        message="Bluetooth enabled",
    )


def disable_bluetooth() -> NetworkActionResponse:
    _run_command(["bluetoothctl", "power", "off"])

    return NetworkActionResponse(
        success=True,
        message="Bluetooth disabled",
    )


def connect_bluetooth(mac_address: str) -> NetworkActionResponse:
    _run_command(["bluetoothctl", "connect", mac_address])

    return NetworkActionResponse(
        success=True,
        message="Bluetooth device connected",
    )


def disconnect_bluetooth(mac_address: str) -> NetworkActionResponse:
    _run_command(["bluetoothctl", "disconnect", mac_address])

    return NetworkActionResponse(
        success=True,
        message="Bluetooth device disconnected",
    )


# =====================================================
# Network Interfaces
# =====================================================

def get_interfaces() -> list[NetworkInterface]:
    output = _run_command(
        ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE,CONNECTION", "device"]
    )

    interfaces = []

    for line in output.splitlines():
        parts = line.split(":")

        if len(parts) < 4:
            continue

        interfaces.append(
            NetworkInterface(
                name=parts[0],
                type=parts[1],
                state=parts[2],
                connection=parts[3],
            )
        )

    return interfaces


def get_active_connections() -> list[ActiveConnection]:
    output = _run_command(
        [
            "nmcli",
            "-t",
            "-f",
            "NAME,TYPE,DEVICE",
            "connection",
            "show",
            "--active",
        ]
    )

    connections = []

    for line in output.splitlines():
        parts = line.split(":")

        if len(parts) < 3:
            continue

        connections.append(
            ActiveConnection(
                name=parts[0],
                connection_type=parts[1],
                device=parts[2],
            )
        )

    return connections