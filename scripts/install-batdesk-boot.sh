#!/bin/bash
# Run once on the PC:  sudo /home/vamshi-yadav/batdesk/scripts/install-batdesk-boot.sh
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "Run with: sudo $0"
  exit 1
fi

USER_NAME=vamshi-yadav
ROOT=/home/vamshi-yadav/batdesk

loginctl enable-linger "$USER_NAME"

# Avoid two copies of uvicorn if the user unit was enabled earlier
sudo -u "$USER_NAME" XDG_RUNTIME_DIR=/run/user/1000 \
  systemctl --user disable --now batdesk.service 2>/dev/null || true


install -m 0644 "$ROOT/deploy/batdesk.service" /etc/systemd/system/batdesk.service
systemctl daemon-reload
systemctl enable --now batdesk.service

a2enmod proxy proxy_http headers
install -m 0644 "$ROOT/deploy/apache-batdesk.conf" /etc/apache2/sites-available/batdesk.conf
a2ensite batdesk.conf
a2dissite 000-default.conf || true
systemctl reload apache2

if grep -q '^#host-name=' /etc/avahi/avahi-daemon.conf; then
  sed -i 's/^#host-name=.*/host-name=batdesk/' /etc/avahi/avahi-daemon.conf
elif grep -q '^host-name=' /etc/avahi/avahi-daemon.conf; then
  sed -i 's/^host-name=.*/host-name=batdesk/' /etc/avahi/avahi-daemon.conf
else
  sed -i '/^\[server\]/a host-name=batdesk' /etc/avahi/avahi-daemon.conf
fi
install -m 0644 "$ROOT/deploy/avahi-batdesk.service" /etc/avahi/services/batdesk.service
systemctl restart avahi-daemon

echo
echo "BatDesk is enabled on boot."
echo "Tablet URL:  http://batdesk.local"
echo "Fallback:    http://$(hostname -I | awk '{print $1}'):8000"
