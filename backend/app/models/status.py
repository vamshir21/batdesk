from pydantic import BaseModel


class CPU(BaseModel):
    usage_percent: float
    physical_cores: int
    logical_cores: int

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
    current_mhz: float
    min_mhz: float
    max_mhz: float

class Temperature(BaseModel):
    cpu_temp:float
    cpu_max_temp:float
    cpu_critical_temp:float

class BootDuration(BaseModel):
    days: int
    hours: int
    minutes: int

class SystemStatus(BaseModel):
    cpu: CPU
    memory: Memory
    disk: Disk
    battery: Battery
    frequency: Frequency
    temperature: Temperature
    boot_duration: BootDuration