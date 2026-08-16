import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_NAME = "BatDesk API"
API_VERSION = "2.0.0"

DISK_PATH = os.getenv("BATDESK_DISK_PATH", "/")
CPU_INTERVAL = float(os.getenv("BATDESK_CPU_INTERVAL", "0.1"))

API_KEY = os.getenv("BATDESK_API_KEY", "")

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
