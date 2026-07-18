import time
import psutil

from app.utils.conversions import bytes_to_gb
from app.models.status import (
    CPU,
    Memory,
    Disk,
    Battery,
    Frequency,
    Temperature,
    BootDuration,
    SystemStatus,
)


def get_cpu() -> CPU:
    return CPU(
        usage_percent=psutil.cpu_percent(),
        physical_cores=psutil.cpu_count(logical=False),
        logical_cores=psutil.cpu_count(logical=True),
    )



def get_memory() -> Memory:
    memory = psutil.virtual_memory()

    return Memory(
        total_gb=bytes_to_gb(memory.total),
        used_gb=bytes_to_gb(memory.used),
        free_gb=bytes_to_gb(memory.free),
        available_gb=bytes_to_gb(memory.available),
        percent=memory.percent,
    )


def get_disk() -> Disk:
    disk = psutil.disk_usage("/")

    return Disk(
        total_gb=bytes_to_gb(disk.total),
        used_gb=bytes_to_gb(disk.used),
        free_gb=bytes_to_gb(disk.free),
        percent=disk.percent,
    )


def get_battery() -> Battery:
    battery = psutil.sensors_battery()

    return Battery(
        available=battery is not None,
        percent=round(battery.percent, 2) if battery else None,
        charging=battery.power_plugged if battery else None,
    )


def get_frequency() -> Frequency:
    freq = psutil.cpu_freq()

    return Frequency(
        current_mhz=freq.current,
        min_mhz=freq.min,
        max_mhz=freq.max,
    )


def get_temperature() -> Temperature:
    temps = psutil.sensors_temperatures()
    core_temps = temps.get("coretemp")

    return Temperature(
        cpu_temp=core_temps[0].current,
        cpu_max_temp=core_temps[0].high,
        cpu_critical_temp=core_temps[0].critical,
    )


def get_boot_duration() -> BootDuration:
    uptime_seconds = int(time.time() - psutil.boot_time())

    days = uptime_seconds // (24 * 3600)
    remaining = uptime_seconds % (24 * 3600)

    hours = remaining // 3600
    remaining %= 3600

    minutes = remaining // 60

    return BootDuration(
        days=days,
        hours=hours,
        minutes=minutes,
    )


def get_system_status() -> SystemStatus:
    return SystemStatus(
        cpu=get_cpu(),
        memory=get_memory(),
        disk=get_disk(),
        battery=get_battery(),
        frequency=get_frequency(),
        temperature=get_temperature(),
        boot_duration=get_boot_duration(),
    )