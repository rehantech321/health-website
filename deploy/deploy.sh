#!/usr/bin/env bash
# Deploy or redeploy. Run on the server as the app user:
#   sudo -iu eldava bash /var/www/eldava/deploy/deploy.sh
#
# Pulls the latest code (if this is a git checkout), installs exact
# dependencies, generates the Prisma client for THIS machine (AlmaLinux 9 ->
# rhel-openssl-3.0.x engine; never copy node_modules from Windows), builds, and
# reloads PM2 without dropping in-flight requests.
set -euo pipefail

APP_DIR=/var/www/eldava
cd "$APP_DIR"

if [ -d .git ]; then
  echo "==> git pull"
  git pull --ff-only
fi

[ -f .env ] || { echo "ERROR: ${APP_DIR}/.env is missing (DATABASE_URL). See DEPLOY.md"; exit 1; }

echo "==> npm ci"
npm ci --no-audit --no-fund

echo "==> prisma generate (server-native engine) + schema sync"
npx prisma generate
# Safe to re-run: a no-op when the schema already matches. Deliberately WITHOUT
# --accept-data-loss - if a schema change would drop data, this stops the
# deploy and says so, rather than doing it silently in production.
npx prisma db push --skip-generate

echo "==> next build (uses swap on this box - expect a few minutes)"
NODE_OPTIONS="--max-old-space-size=1536" npm run build

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
