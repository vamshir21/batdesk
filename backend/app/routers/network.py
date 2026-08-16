from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.http import linux_call
from app.models.network import (
    ActiveConnection,
    BluetoothConnectRequest,
    BluetoothDevice,
    BluetoothStatus,
    NetworkActionResponse,
    NetworkInterface,
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
    dependencies=[Depends(require_api_key)],
)


@router.get("/wifi/status", response_model=WifiStatus)
def wifi_status():
    return linux_call(get_wifi_status)


@router.get("/wifi/networks", response_model=list[WifiNetwork])
def wifi_networks():
    return linux_call(scan_wifi)


@router.post("/wifi/connect", response_model=NetworkActionResponse)
def wifi_connect(request: WifiConnectRequest):
    return linux_call(connect_wifi, request.ssid, request.password)


@router.post("/wifi/disconnect", response_model=NetworkActionResponse)
def wifi_disconnect():
    return linux_call(disconnect_wifi)


@router.post("/wifi/on", response_model=NetworkActionResponse)
def wifi_on():
    return linux_call(enable_wifi)


@router.post("/wifi/off", response_model=NetworkActionResponse)
def wifi_off():
    return linux_call(disable_wifi)


@router.get("/bluetooth/status", response_model=BluetoothStatus)
def bluetooth_status():
    return linux_call(get_bluetooth_status)


@router.get("/bluetooth/devices", response_model=list[BluetoothDevice])
def bluetooth_devices():
    return linux_call(get_bluetooth_devices)


@router.post("/bluetooth/connect", response_model=NetworkActionResponse)
def bluetooth_connect(request: BluetoothConnectRequest):
    return linux_call(connect_bluetooth, request.mac_address)


@router.post("/bluetooth/disconnect", response_model=NetworkActionResponse)
def bluetooth_disconnect(request: BluetoothConnectRequest):
    return linux_call(disconnect_bluetooth, request.mac_address)


@router.post("/bluetooth/on", response_model=NetworkActionResponse)
def bluetooth_on():
    return linux_call(enable_bluetooth)


@router.post("/bluetooth/off", response_model=NetworkActionResponse)
def bluetooth_off():
    return linux_call(disable_bluetooth)


@router.get("/interfaces", response_model=list[NetworkInterface])
def interfaces():
    return linux_call(get_interfaces)


@router.get("/connections", response_model=list[ActiveConnection])
def active_connections():
    return linux_call(get_active_connections)
