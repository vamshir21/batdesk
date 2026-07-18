import time
import psutil

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
        total_gb=round(memory.total / (1024 ** 3), 2),
        used_gb=round(memory.used / (1024 ** 3), 2),
        free_gb=round(memory.free / (1024 ** 3), 2),
        available_gb=round(memory.available / (1024 ** 3), 2),
        percent=memory.percent,
    )


def get_disk() -> Disk:
    disk = psutil.disk_usage("/")

    return Disk(
        total_gb=round(disk.total / (1024 ** 3), 2),
        used_gb=round(disk.used / (1024 ** 3), 2),
        free_gb=round(disk.free / (1024 ** 3), 2),
        percent=disk.percent,
    )


def get_battery() -> Battery:
    battery = psutil.sensors_battery()

    return Battery(
        available=battery is not None,
        percent=battery.percent if battery else None,
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