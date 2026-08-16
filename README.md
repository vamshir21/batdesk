# BatDesk

A personal control panel for an Ubuntu PC. A 7-inch Android tablet runs a touch UI; the desktop runs a FastAPI service that reads system state and issues Linux commands over the local network.

```
Tablet (React)  --HTTP/JSON over Wi-Fi-->  Ubuntu PC (FastAPI)  -->  Linux
```

BatDesk is built as a client–server systems project: monitoring, power, audio, display, and network controls, with a dark, high-contrast UI sized for **1024×600** touch.

---

## Features

**Cave (home)**  
Speedometer-style gauges for CPU, RAM, disk, temperature, GPU, and battery. Now-playing from the PC. Lock, sleep, mute, and keep-awake.

**Ops**  
Brightness and volume sliders, speaker output picker, microphone mute, media transport, power actions.

**Net**  
Wi-Fi scan/connect and Bluetooth device connect/disconnect via NetworkManager and `bluetoothctl`.

**Core**  
Host, kernel, clocks, memory, disk, GPU (`nvidia-smi` when present), and network throughput.

**Cfg**  
Backend URL, optional API key, poll interval, theme. Send clipboard text, desktop notifications, and URLs to the PC. Launch Files, Browser, Terminal, Settings, Spotify, or VS Code.

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1c3168ca-efcc-4c36-8c81-743d91495ef7" />


## Architecture

| Layer | Role |
| --- | --- |
| `frontend/` | React + TypeScript + Vite. Polls `/api/v1` about every 2s. |
| `backend/app/routers/` | HTTP surface (`/api/v1/...`) |
| `backend/app/services/` | `psutil`, `pactl`, `playerctl`, `brightnessctl`, `nmcli`, `bluetoothctl`, `loginctl`, `systemctl` |
| `backend/app/models/` | Pydantic request/response models |

The production UI is the Vite build served by FastAPI from `frontend/dist`. In development, Vite proxies `/api` to port 8000.

---

## Requirements

**PC**

- Ubuntu (GNOME). Developed on Ubuntu with an Intel CPU and NVIDIA GPU.
- Python 3.12+ with a virtualenv
- Node.js 20+ (to build the frontend)
- Typical tools already used by the desktop: PulseAudio/PipeWire (`pactl`), `playerctl`, `brightnessctl`, NetworkManager (`nmcli`), BlueZ (`bluetoothctl`)

**Tablet**

- Browser on the same Wi-Fi as the PC
- Designed around a 7-inch 1024×600 display (e.g. Lenovo TB-7305F)

---

## Project layout

```
batdesk/
├── backend/app/          FastAPI application
├── frontend/             React client
├── deploy/               systemd, Apache, Avahi unit files
└── scripts/              server wrapper and boot install
```

---

## Development

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # optional BATDESK_API_KEY
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Vite listens on `5173` and proxies `/api` to the backend. On the tablet, open `http://<pc-ip>:5173`. Leave **PC address** empty in Settings.

**Production UI on the API port**

```bash
cd frontend && npm run build
```

Then open `http://<pc-ip>:8000`. FastAPI serves `frontend/dist` when that build exists.

---

## Run as a systemd service

A user unit is already defined for this machine. After login it keeps Uvicorn on port **8000**:

```bash
systemctl --user status batdesk
systemctl --user restart batdesk
```

Logs: `journalctl --user -u batdesk -f`

To start at **boot** (not only after login), publish **`http://batdesk.local`** on port 80, and enable linger, run once on the PC:

```bash
sudo ./scripts/install-batdesk-boot.sh
```

That installs `/etc/systemd/system/batdesk.service`, an Apache reverse proxy, and an Avahi name. Tablet bookmark:

| URL | When |
| --- | --- |
| `http://batdesk.local` | After the boot install script |
| `http://<pc-ip>:8000` | Always, while the service is up |
| `http://<hostname>.local:8000` | mDNS, no Apache required |

On the tablet, leave the server field empty if you opened that host directly.

The install script and unit files currently assume the account and path `vamshi-yadav` / `/home/vamshi-yadav/batdesk`. Edit `scripts/batdesk-run.sh` and `deploy/batdesk.service` before using them on another machine.

---

## API (v2)

All routes are under `/api/v1`. If `BATDESK_API_KEY` is set in `backend/.env`, send the same value as header `X-API-Key`. `/health` stays public.

| Area | Examples |
| --- | --- |
| Status | `GET /health`, `GET /status` |
| Power | `POST /system/lock`, `/sleep`, `/restart`, `/shutdown`, `/awake` |
| Audio | `GET/POST /audio/volume`, mute, mic, sink, play-pause, next/previous, art |
| Display | `GET/POST /display/brightness` |
| Network | `/network/wifi/*`, `/network/bluetooth/*` |
| Extras | `POST /system/notify`, `/clipboard`, `/open-url`, `/launch` |

---

## Security

This API can lock, sleep, shut down, and change Wi-Fi. Treat it as a **LAN control plane**:

- Prefer binding through the local firewall; do not expose it to the internet.
- Set `BATDESK_API_KEY` and enter it in the tablet Settings screen before you rely on it off localhost.
- Launch and URL open are allowlisted / scheme-checked on the server; they are still privileged actions.

---

## Configuration

`backend/.env` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `BATDESK_API_KEY` | Optional shared secret (`X-API-Key`) |
| `BATDESK_DISK_PATH` | Disk used for the disk gauge (default `/`) |
| `BATDESK_CPU_INTERVAL` | Seconds for `psutil.cpu_percent` (default `0.1`) |

Frontend settings (theme, refresh, server URL, API key) are stored in the tablet browser’s `localStorage`.


---

## License

Private personal project. Not affiliated with DC or Warner Bros.
