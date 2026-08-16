from pydantic import BaseModel


class CPU(BaseModel):
    usage_percent: float
    physical_cores: int | None
    logical_cores: int | None


class Memory(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    available_gb: float
    percent: float


class Disk(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class Battery(BaseModel):
    available: bool
    percent: float | None
    charging: bool | None


class Frequency(BaseModel):
    current_mhz: float | None
    min_mhz: float | None
    max_mhz: float | None


class Temperature(BaseModel):
    available: bool
    cpu_temp: float | None = None
    cpu_max_temp: float | None = None
    cpu_critical_temp: float | None = None


class BootDuration(BaseModel):
    days: int
    hours: int
    minutes: int


class Host(BaseModel):
    hostname: str
    os: str
    kernel: str
    machine: str


class Gpu(BaseModel):
    available: bool
    name: str | None = None
    usage_percent: float | None = None
    temperature: float | None = None
    memory_used_gb: float | None = None
    memory_total_gb: float | None = None


class NetworkRate(BaseModel):
    down_kbps: float
    up_kbps: float


class SystemStatus(BaseModel):
    host: Host
    cpu: CPU
    memory: Memory
    disk: Disk
    battery: Battery
    frequency: Frequency
    temperature: Temperature
    boot_duration: BootDuration
    gpu: Gpu
    network: NetworkRate
    keep_awake: bool
