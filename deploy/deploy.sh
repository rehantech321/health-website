#!/usr/bin/env bash
# Deploy or redeploy. Run on the server as the app user:
#   sudo -iu eldava bash /var/www/eldava/deploy/deploy.sh
#
# Pulls the latest code (if this is a git checkout), installs exact
# dependencies, generates the Prisma client for THIS machine (AlmaLinux 9 ->
# rhel-openssl-3.0.x engine; never copy node_modules from Windows), builds, and
# reloads PM2 without dropping in-flight requests.
#
# This box has 1 GB of RAM, which is less than `npm ci` and `next build` want.
# Everything below is written to stay inside that: swap is checked first, the
# install runs with a small heap and no post-install scripts, and the build is
# capped. If a step is "Killed" with no other message, it was the kernel's
# out-of-memory killer - see the hint printed on failure.
set -euo pipefail

APP_DIR=/var/www/eldava
cd "$APP_DIR"

on_error() {
  local code=$?
  echo
  echo "==> DEPLOY FAILED (exit $code)"
  if [ "$code" -eq 137 ] || [ "$code" -eq 143 ]; then
    echo "    'Killed' means the kernel ran out of memory."
    echo "    Check swap is on:            free -h"
    echo "    If Swap total is 0, as root: bash $APP_DIR/deploy/add-swap.sh"
    echo "    Then run this script again."
  fi
  echo "    Memory at the time:"
  free -h | sed 's/^/      /'
  exit "$code"
}
trap on_error ERR

echo "==> Memory check"
free -h | sed 's/^/    /'
SWAP_KB=$(awk '/^SwapTotal:/ {print $2}' /proc/meminfo)
if [ "${SWAP_KB:-0}" -lt 524288 ]; then
  echo
  echo "ERROR: less than 512 MB of swap is active (SwapTotal=${SWAP_KB:-0} kB)."
  echo "This machine cannot install and build without it - npm gets OOM-killed."
  echo "As root, run:  bash $APP_DIR/deploy/add-swap.sh"
  echo "Then re-run this script. (Set SKIP_SWAP_CHECK=1 to bypass at your own risk.)"
  [ "${SKIP_SWAP_CHECK:-0}" = "1" ] || exit 1
fi

if [ -d .git ]; then
  echo "==> git pull"
  git pull --ff-only
fi

[ -f .env ] || { echo "ERROR: ${APP_DIR}/.env is missing (DATABASE_URL). See DEPLOY.md"; exit 1; }

# --ignore-scripts keeps package post-install hooks (notably Prisma's, which
# generates a client we regenerate below anyway) out of the install's memory
# footprint. --maxsockets limits parallel downloads/extractions.
echo "==> npm ci"
NODE_OPTIONS="--max-old-space-size=512" npm ci --no-audit --no-fund --no-progress --prefer-offline --maxsockets 3 --ignore-scripts

echo "==> prisma generate (server-native engine) + schema sync"
npx prisma generate
# Safe to re-run: a no-op when the schema already matches. Deliberately WITHOUT
# --accept-data-loss - if a schema change would drop data, this stops the
# deploy and says so, rather than doing it silently in production.
npx prisma db push --skip-generate

# The old build is worth dropping before making a new one: it frees page cache
# and disk, and a stale .next is never what we want to serve.
rm -rf .next/cache

echo "==> next build (uses swap on this box - expect a few minutes)"
NODE_OPTIONS="--max-old-space-size=1024" npm run build

echo "==> pm2 reload"
if pm2 describe eldava >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.js --update-env
else
  pm2 start deploy/ecosystem.config.js
fi
pm2 save

echo
pm2 status eldava
echo "Deployed. Tail logs with:  pm2 logs eldava"
