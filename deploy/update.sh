#!/bin/bash
# =============================================================
# Mastero — деплой обновлений (запускать после git push)
# Запуск: sudo bash update.sh
# =============================================================
set -euo pipefail

APP_DIR="/var/www/mastero"
GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${GREEN}[+]${NC} $*"; }

[[ $EUID -ne 0 ]] && echo "Запустите от root: sudo bash update.sh" && exit 1

log "Получение обновлений из git..."
cd "${APP_DIR}"
git pull

log "Backend: сборка..."
cd "${APP_DIR}/backend"
npm ci
npx prisma generate
npx prisma db push
npm run build

log "Backend: перезапуск PM2..."
pm2 restart mastero-api
pm2 save

log "Frontend: сборка..."
cd "${APP_DIR}"
npm ci
NODE_OPTIONS="--max-old-space-size=1024" npx ng build --configuration production

log "Frontend: публикация..."
cp -r dist/ArchitectBeauty/browser/. /var/www/mastero/frontend/
chown -R www-data:www-data /var/www/mastero/frontend

echo ""
log "Обновление завершено."
pm2 status
