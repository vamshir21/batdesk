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
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    battery = psutil.sensors_battery()

    if battery is not None:
        battery_info = {
            "available": True,
            "percent": battery.percent,
            "charging": battery.power_plugged
        }
    else:
        battery_info = {
            "available": False,
            "percent": None,
            "charging": None
        }

    return {
        "cpu_percent": cpu,
        "memory": {
            "total": round(memory.total / (1024 **3), 2),  # Convert bytes to GB
            "available": round(memory.available / (1024 **3), 2),
            "used": round(memory.used / (1024 **3), 2),
            "free": round(memory.free / (1024 **3), 2),
            "percent": memory.percent
        },
        "battery": battery_info
    }