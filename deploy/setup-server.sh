#!/usr/bin/env bash
# One-time server preparation for AlmaLinux 9. Run as root:
#   bash setup-server.sh app.eldava.com
#
# Installs Node 20, Nginx, Certbot, PM2; creates a 2 GB swap file (the 1 GB VPS
# cannot run `next build` without it); opens the firewall; lets Nginx proxy to
# the app under SELinux; creates the `eldava` service user and /var/www/eldava.
set -euo pipefail

DOMAIN="${1:?usage: setup-server.sh <domain>}"
APP_USER=eldava
APP_DIR=/var/www/eldava

echo "==> System packages"
dnf -y update
dnf -y install epel-release
dnf -y install git nginx certbot python3-certbot-nginx policycoreutils-python-utils curl tar

echo "==> Node.js 20 (AlmaLinux module stream)"
dnf -y module reset nodejs
dnf -y module enable nodejs:20
dnf -y install nodejs
node -v && npm -v
npm install -g pm2

echo "==> 2 GB swap (build needs more RAM than this VPS has)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
# Prefer RAM; only spill to swap under pressure.
sysctl -w vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
free -h

echo "==> Service user and app directory"
id -u "$APP_USER" &>/dev/null || useradd --system --create-home --shell /bin/bash "$APP_USER"
mkdir -p "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> Firewall: http + https"
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

echo "==> SELinux: allow Nginx to reach the app on localhost:3000"
setsebool -P httpd_can_network_connect 1

echo "==> Nginx site"
HERE="$(cd "$(dirname "$0")" && pwd)"
cp "${HERE}/eldava-proxy-headers.inc" /etc/nginx/conf.d/eldava-proxy-headers.inc
sed "s/__DOMAIN__/${DOMAIN}/g" "${HERE}/nginx.conf" > /etc/nginx/conf.d/eldava.conf
nginx -t
systemctl enable --now nginx

echo "==> PM2 starts on boot, as ${APP_USER}"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/${APP_USER}" | tail -1 | bash || true

cat <<EOF

Server ready.

Next:
  1. Put the code in ${APP_DIR}  (git clone as ${APP_USER}, or scp)
  2. Create ${APP_DIR}/.env and ${APP_DIR}/.env.local
  3. sudo -iu ${APP_USER} bash ${APP_DIR}/deploy/deploy.sh
  4. certbot --nginx -d ${DOMAIN}     (once DNS for ${DOMAIN} points here)
EOF
