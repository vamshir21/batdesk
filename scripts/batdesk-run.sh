#!/bin/bash
set -euo pipefail

export HOME=/home/vamshi-yadav
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/1000}"
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=${XDG_RUNTIME_DIR}/bus}"

for _ in $(seq 1 30); do
  if [[ -d "$XDG_RUNTIME_DIR" ]]; then
    break
  fi
  sleep 1
done

if [[ -S "${XDG_RUNTIME_DIR}/wayland-0" ]]; then
  export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"
fi
if [[ -z "${DISPLAY:-}" && -S /tmp/.X11-unix/X0 ]]; then
  export DISPLAY=:0
fi

cd /home/vamshi-yadav/batdesk/backend
exec /home/vamshi-yadav/batdesk/backend/.venv/bin/uvicorn \
  app.main:app \
  --host 0.0.0.0 \
  --port 8000
