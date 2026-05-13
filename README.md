# Мастеро

Строительный маркетплейс: клиенты ↔ мастера, перевозчики, магазины.

**Стек:** Angular 17+ · NestJS · Prisma · PostgreSQL · JWT

---

## Быстрый старт

### 1. Настроить базу данных

Отредактируй `backend/.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mastero"
JWT_SECRET="замени-на-длинную-случайную-строку"
JWT_EXPIRES_IN="7d"
```

Для Supabase (Session pooler):
```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### 2. Применить схему базы данных

```bash
cd backend
npm install
npx prisma db push      # создать таблицы (dev)
# или
npx prisma migrate dev  # если нужна история миграций
```

### 3. Запустить NestJS backend

```bash
cd backend
npm run start:dev
# Слушает на http://localhost:3001/api
```

### 4. Запустить Angular frontend

```bash
# в корне проекта
npm install
ng serve
# Открыть http://localhost:4200
```

---

## Структура

```
/                  Angular frontend
/backend           NestJS API (порт 3001)
  /prisma          Схема базы данных
  /src
    /auth          POST /api/auth/register, /api/auth/login
    /profiles      GET/PATCH /api/profiles/me, GET /api/profiles/:id
    /master-rates  POST/DELETE /api/master-rates
    /work-types    GET/POST/DELETE /api/work-types
    /orders        CRUD /api/orders
    /responses     CRUD /api/responses
    /messages      CRUD /api/messages
    /transport-orders
    /transport-responses
    /store         /api/store (профиль магазина)
    /products      CRUD /api/products
    /complaints    CRUD /api/complaints
    /admin         /api/admin/users, /api/admin/complaints
```

---

## Следующие шаги

1. **Протестировать** — запустить оба сервера, пройти: регистрация → онбординг → заявка → отклик → чат → завершение
2. **Flutter** — мобильное приложение поверх того же NestJS API
3. **ЮKassa** — онлайн-оплата (веб + Flutter)
