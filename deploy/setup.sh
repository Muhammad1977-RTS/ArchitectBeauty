#!/bin/bash
# =============================================================
# Mastero — первичный деплой на Ubuntu 22.04 / 24.04
# Запуск: sudo bash setup.sh
# =============================================================
set -euo pipefail

DOMAIN="nexa.quest"
APP_DIR="/var/www/mastero"
REPO="https://github.com/Muhammad1977-RTS/ArchitectBeauty.git"
DB_USER="mastero_user"
DB_NAME="mastero"
DB_PASS=$(openssl rand -hex 20)
JWT_SECRET=$(openssl rand -hex 40)
ADMIN_EMAIL="admin@${DOMAIN}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && die "Запустите от root: sudo bash setup.sh"

# ── 1. Системные пакеты ──────────────────────────────────────
log "Обновление системы..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx \
                   postgresql postgresql-contrib ufw

# ── 2. Node.js 20 ────────────────────────────────────────────
log "Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ── 3. PM2 ───────────────────────────────────────────────────
log "PM2..."
npm install -g pm2

# ── 4. PostgreSQL ─────────────────────────────────────────────
log "PostgreSQL: создание БД и пользователя..."
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# ── 5. Клонирование репозитория ───────────────────────────────
log "Клонирование ${REPO}..."
# Если репозиторий приватный — добавьте токен в URL:
# REPO="https://<token>@github.com/Muhammad1977-RTS/ArchitectBeauty.git"
if [[ -d "${APP_DIR}/.git" ]]; then
  cd "${APP_DIR}" && git pull
else
  git clone "${REPO}" "${APP_DIR}"
fi

# ── 6. Backend ────────────────────────────────────────────────
log "Сборка backend..."
cd "${APP_DIR}/backend"

cat > .env <<ENV
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
ENV

mkdir -p uploads
npm ci
npx prisma generate
npx prisma db push
npm run build

# ── 7. Frontend ───────────────────────────────────────────────
log "Сборка frontend (может занять 1-2 мин)..."
cd "${APP_DIR}"
npm ci
NODE_OPTIONS="--max-old-space-size=1024" npx ng build --configuration production

mkdir -p /var/www/mastero/frontend
cp -r "${APP_DIR}/dist/ArchitectBeauty/browser/." /var/www/mastero/frontend/
chown -R www-data:www-data /var/www/mastero/frontend
chown -R www-data:www-data /var/www/mastero/backend/uploads

# ── 8. PM2 ───────────────────────────────────────────────────
log "Запуск PM2..."
pm2 start "${APP_DIR}/ecosystem.config.js" --env production
pm2 save

# Автозапуск PM2 после перезагрузки сервера
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── 9. Nginx ─────────────────────────────────────────────────
log "Настройка Nginx..."
cp "${APP_DIR}/deploy/nginx.conf" "/etc/nginx/sites-available/${DOMAIN}"
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

# ── 10. Firewall ─────────────────────────────────────────────
log "UFW..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 11. SSL ───────────────────────────────────────────────────
log "SSL сертификат Let's Encrypt..."
certbot --nginx \
  -d "${DOMAIN}" -d "www.${DOMAIN}" \
  --non-interactive --agree-tos \
  --email "${ADMIN_EMAIL}" \
  --redirect

# Авто-обновление сертификата
systemctl enable certbot.timer 2>/dev/null && systemctl start certbot.timer 2>/dev/null || \
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Деплой завершён успешно!          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Сайт:   ${BLUE}https://${DOMAIN}${NC}"
echo -e "  API:    ${BLUE}https://${DOMAIN}/api${NC}"
echo ""
echo -e "  pm2 status          — статус процессов"
echo -e "  pm2 logs mastero-api — логи API"
echo ""
warn "Сохраните учётные данные (записаны в backend/.env):"
warn "  DB_PASS  = ${DB_PASS}"
warn "  JWT_SECRET = ${JWT_SECRET}"
