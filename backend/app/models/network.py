from pydantic import BaseModel, Field


# =========================
# Wi-Fi Models
# =========================

class WifiStatus(BaseModel):
    enabled: bool
    connected: bool
    ssid: str | None = None
    signal: int | None = None


class WifiNetwork(BaseModel):
    ssid: str
    signal: int
    security: str


class WifiConnectRequest(BaseModel):
    ssid: str
    password: str


# =========================
# Bluetooth Models
# =========================

class BluetoothStatus(BaseModel):
    enabled: bool
    discovering: bool


class BluetoothDevice(BaseModel):
    mac_address: str
    name: str
    connected: bool = False


class BluetoothConnectRequest(BaseModel):
    mac_address: str


# =========================
# Network Interface Models
# =========================

class NetworkInterface(BaseModel):
    name: str
    type: str
    state: str
    connection: str


class ActiveConnection(BaseModel):
    name: str
    connection_type: str
    device: str


# =========================
# Request Models
# =========================

class BrightnessRequest(BaseModel):
    """(Reserved for future use if needed; remove if unused.)"""
    value: int = Field(ge=0, le=100)


# =========================
# Common Response
# =========================

class NetworkActionResponse(BaseModel):
    success: bool
    message: str