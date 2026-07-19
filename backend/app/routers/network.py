from fastapi import APIRouter

from app.models.network import (
    BluetoothConnectRequest,
    BluetoothDevice,
    BluetoothStatus,
    NetworkActionResponse,
    NetworkInterface,
    ActiveConnection,
    WifiConnectRequest,
    WifiNetwork,
    WifiStatus,
)

from app.services.network_service import (
    connect_bluetooth,
    connect_wifi,
    disable_bluetooth,
    disable_wifi,
    disconnect_bluetooth,
    disconnect_wifi,
    enable_bluetooth,
    enable_wifi,
    get_active_connections,
    get_bluetooth_devices,
    get_bluetooth_status,
    get_interfaces,
    get_wifi_status,
    scan_wifi,
)

router = APIRouter(
    prefix="/network",
    tags=["Network"],
)

# =====================================================
# Wi-Fi
# =====================================================

@router.get(
    "/wifi/status",
    response_model=WifiStatus,
)
def wifi_status():
    return get_wifi_status()


@router.get(
    "/wifi/networks",
    response_model=list[WifiNetwork],
)
def wifi_networks():
    return scan_wifi()


@router.post(
    "/wifi/connect",
    response_model=NetworkActionResponse,
)
def wifi_connect(request: WifiConnectRequest):
    return connect_wifi(
        request.ssid,
        request.password,
    )


@router.post(
    "/wifi/disconnect",
    response_model=NetworkActionResponse,
)
def wifi_disconnect():
    return disconnect_wifi()


@router.post(
    "/wifi/on",
    response_model=NetworkActionResponse,
)
def wifi_on():
    return enable_wifi()


@router.post(
    "/wifi/off",
    response_model=NetworkActionResponse,
)
def wifi_off():
    return disable_wifi()


# =====================================================
# Bluetooth
# =====================================================

@router.get(
    "/bluetooth/status",
    response_model=BluetoothStatus,
)
def bluetooth_status():
    return get_bluetooth_status()


@router.get(
    "/bluetooth/devices",
    response_model=list[BluetoothDevice],
)
def bluetooth_devices():
    return get_bluetooth_devices()


@router.post(
    "/bluetooth/connect",
    response_model=NetworkActionResponse,
)
def bluetooth_connect(request: BluetoothConnectRequest):
    return connect_bluetooth(
        request.mac_address,
    )


@router.post(
    "/bluetooth/disconnect",
    response_model=NetworkActionResponse,
)
def bluetooth_disconnect(request: BluetoothConnectRequest):
    return disconnect_bluetooth(
        request.mac_address,
    )


@router.post(
    "/bluetooth/on",
    response_model=NetworkActionResponse,
)
def bluetooth_on():
    return enable_bluetooth()


@router.post(
    "/bluetooth/off",
    response_model=NetworkActionResponse,
)
def bluetooth_off():
    return disable_bluetooth()


# =====================================================
# Network Information
# =====================================================

@router.get(
    "/interfaces",
    response_model=list[NetworkInterface],
)
def interfaces():
    return get_interfaces()


@router.get(
    "/connections",
    response_model=list[ActiveConnection],
)
def active_connections():
    return get_active_connections()