from pydantic import BaseModel


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
    password: str | None = None


class BluetoothStatus(BaseModel):
    enabled: bool
    discovering: bool


class BluetoothDevice(BaseModel):
    mac_address: str
    name: str
    connected: bool = False


class BluetoothConnectRequest(BaseModel):
    mac_address: str


class NetworkInterface(BaseModel):
    name: str
    type: str
    state: str
    connection: str


class ActiveConnection(BaseModel):
    name: str
    connection_type: str
    device: str


class NetworkActionResponse(BaseModel):
    success: bool
    message: str
