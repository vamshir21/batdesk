from fastapi import FastAPI 
import psutil
app =FastAPI()

@app.get("/")
def home():
    return{
        "message":"Welcome to Batcave"
    }

@app.get("/status")
def get_status():
    
    memory = psutil.virtual_memory()
    battery = psutil.sensors_battery()
    disk_main = psutil.disk_usage("/")
    cpu_per = psutil.cpu_percent()
    physical = psutil.cpu_count(logical=False)
    logical = psutil.cpu_count(logical=True)
    freq = psutil.cpu_freq()

    if battery:
    
        is_charging = battery.power_plugged
        if is_charging is None:
            charging_status = "Plugged IN"
        
    if battery is not None:
        battery_info = {
            "available": True,
            "percent": f"{int(battery.percent)} percent",
            "charging": charging_status
        }
    else:
        battery_info = {
            "available": False,
            "percent": None,
            "charging": None
        }

    return {
        "cpu":{
            "physical_cores": physical,
            "logical_cores": logical,
            "usage_percent": f"{cpu_per} percent"

        },
        "frequency": {
            "current": round(freq.current, 2),
            "min": round(freq.min, 2),
            "max": round(freq.max, 2)
        },
        "memory": {
            "total": round(memory.total / (1024 **3), 2),
            "available": round(memory.available / (1024 **3), 2),
            "used": round(memory.used / (1024 **3), 2),
            "free": round(memory.free / (1024 **3), 2),
            "percent": memory.percent,
            "disk":{
                "total": round(disk_main.total / (1024 **3), 2),
                "used": round(disk_main.used / (1024 **3), 2),
                "free": round(disk_main.free / (1024 **3), 2),
                "percent": disk_main.percent
            }
        },
        "battery": battery_info
    }