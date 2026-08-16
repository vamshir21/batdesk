import platform
import subprocess
import time

import psutil

from app.config import CPU_INTERVAL, DISK_PATH
from app.models.status import (
    CPU,
    Battery,
    BootDuration,
    Disk,
    Frequency,
    Gpu,
    Host,
    Memory,
    NetworkRate,
    SystemStatus,
    Temperature,
)
from app.services.extras_service import keep_awake_enabled
from app.utils.conversions import bytes_to_gb

_prev_net: tuple[float, int, int] | None = None


def get_host() -> Host:
    uname = platform.uname()
    return Host(
        hostname=uname.node,
        os=f"{uname.system} {uname.release}",
        kernel=uname.version.split()[0] if uname.version else uname.release,
        machine=uname.machine,
    )


def get_cpu() -> CPU:
    return CPU(
        usage_percent=psutil.cpu_percent(interval=CPU_INTERVAL),
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
    disk = psutil.disk_usage(DISK_PATH)
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
    if freq is None:
        return Frequency(current_mhz=None, min_mhz=None, max_mhz=None)
    return Frequency(
        current_mhz=freq.current,
        min_mhz=freq.min,
        max_mhz=freq.max,
    )


def get_temperature() -> Temperature:
    temps = psutil.sensors_temperatures() or {}
    entries = (
        temps.get("coretemp")
        or temps.get("k10temp")
        or temps.get("cpu_thermal")
        or next(iter(temps.values()), None)
    )
    if not entries:
        return Temperature(available=False)
    sensor = entries[0]
    return Temperature(
        available=True,
        cpu_temp=sensor.current,
        cpu_max_temp=sensor.high,
        cpu_critical_temp=sensor.critical,
    )


def get_boot_duration() -> BootDuration:
    uptime_seconds = int(time.time() - psutil.boot_time())
    days = uptime_seconds // (24 * 3600)
    remaining = uptime_seconds % (24 * 3600)
    hours = remaining // 3600
    remaining %= 3600
    minutes = remaining // 60
    return BootDuration(days=days, hours=hours, minutes=minutes)


def get_gpu() -> Gpu:
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,utilization.gpu,temperature.gpu,memory.used,memory.total",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=1.5,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return Gpu(available=False)

    if result.returncode != 0 or not result.stdout.strip():
        return Gpu(available=False)

    parts = [part.strip() for part in result.stdout.strip().split(",")]
    if len(parts) < 5:
        return Gpu(available=False)

    return Gpu(
        available=True,
        name=parts[0],
        usage_percent=float(parts[1]),
        temperature=float(parts[2]),
        memory_used_gb=round(float(parts[3]) / 1024, 2),
        memory_total_gb=round(float(parts[4]) / 1024, 2),
    )


def get_network_rate() -> NetworkRate:
    global _prev_net
    counters = psutil.net_io_counters()
    now = time.time()
    if _prev_net is None:
        _prev_net = (now, counters.bytes_recv, counters.bytes_sent)
        return NetworkRate(down_kbps=0, up_kbps=0)

    prev_t, prev_down, prev_up = _prev_net
    elapsed = max(now - prev_t, 0.001)
    down = (counters.bytes_recv - prev_down) / elapsed / 1024
    up = (counters.bytes_sent - prev_up) / elapsed / 1024
    _prev_net = (now, counters.bytes_recv, counters.bytes_sent)
    return NetworkRate(down_kbps=round(down, 1), up_kbps=round(up, 1))


def get_system_status() -> SystemStatus:
    return SystemStatus(
        host=get_host(),
        cpu=get_cpu(),
        memory=get_memory(),
        disk=get_disk(),
        battery=get_battery(),
        frequency=get_frequency(),
        temperature=get_temperature(),
        boot_duration=get_boot_duration(),
        gpu=get_gpu(),
        network=get_network_rate(),
        keep_awake=keep_awake_enabled(),
    )
