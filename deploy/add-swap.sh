#!/usr/bin/env bash
# Adds (or restores) the swap file this 1 GB box needs to install and build.
# Run as root:  bash /var/www/eldava/deploy/add-swap.sh [size, default 2G]
#
# setup-server.sh already does this on a fresh server; this script exists for
# when swap is gone - a rebuilt VPS, a restored snapshot, or an /etc/fstab that
# lost its entry, which shows up as `npm ci` or `next build` being "Killed".
set -euo pipefail

SIZE="${1:-2G}"
SWAPFILE=/swapfile

[ "$(id -u)" -eq 0 ] || { echo "Run as root."; exit 1; }

echo "==> Before"
free -h

if swapon --show | grep -q "$SWAPFILE"; then
  echo "$SWAPFILE is already active. Nothing to do."
else
  if [ -f "$SWAPFILE" ]; then
    echo "==> $SWAPFILE exists but is not active - enabling it"
    chmod 600 "$SWAPFILE"
    mkswap "$SWAPFILE" >/dev/null || true
  else
    echo "==> Creating $SIZE swap file (needs that much free disk)"
    fallocate -l "$SIZE" "$SWAPFILE" || dd if=/dev/zero of="$SWAPFILE" bs=1M count=$(( ${SIZE%G} * 1024 )) status=progress
    chmod 600 "$SWAPFILE"
    mkswap "$SWAPFILE"
  fi
  swapon "$SWAPFILE"
fi

# Survive a reboot.
grep -q "^$SWAPFILE " /etc/fstab || echo "$SWAPFILE none swap sw 0 0" >> /etc/fstab

# Prefer RAM; only spill to swap under pressure.
sysctl -w vm.swappiness=10 >/dev/null
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf

echo "==> After"
free -h
echo
echo "Swap is on. Now deploy:  sudo -iu eldava bash /var/www/eldava/deploy/deploy.sh"
