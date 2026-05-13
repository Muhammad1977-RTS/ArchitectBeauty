# Мастеро — техническая спецификация

## Обзор

Мастеро — строительный маркетплейс, соединяющий клиентов с мастерами-ремонтниками, перевозчиками и строительными магазинами. Клиент создаёт заявку (тип работы, площадь, адрес), мастера откликаются с ценой и сроками, клиент выбирает исполнителя. Отдельный тип заявок — перевозка грузов. Строительные магазины размещают каталог товаров.

**Запуск:** Чеченская Республика. Архитектура рассчитана на расширение по регионам РФ.

**Стек:** Angular · NestJS (Prisma + PostgreSQL) · JWT Auth · REST API

**Дизайн-система:** [DESIGN.md](DESIGN.md) — единственный источник истины по UI.

---

## Пользовательские истории

**Клиент**
- Регистрируюсь как клиент, прохожу онбординг (имя, телефон, район)
- Создаю заявку на ремонт: тип работы, площадь, адрес, описание, фото
- Вижу список своих заявок с фильтром по статусу
- Просматриваю отклики мастеров: цена, срок, комментарий
- Выбираю мастера — общаюсь с ним в чате
- Отмечаю работу завершённой, оставляю рейтинг
- Создаю заявку на перевозку груза, выбираю перевозчика

**Мастер**
- Регистрируюсь как мастер, прохожу онбординг (имя, телефон, район)
- Указываю ставки за м² для каждой специализации в профиле
- Вижу все открытые заявки клиентов
- Откликаюсь: цена авторасчётом (площадь × ставка), добавляю комментарий и срок
- После выбора клиентом — общаюсь с ним в чате
- Вижу список своих откликов

**Перевозчик**
- Регистрируюсь как перевозчик, прохожу онбординг
- Опционально указываю тип ТС, цену за км, мин. цену, макс. грузоподъёмность
- Вижу все открытые транспортные заявки
- Откликаюсь с предложенной ценой и типом ТС
- Вижу список своих откликов с фильтром по статусу

**Магазин**
- Регистрируюсь как магазин, прохожу онбординг
- Заполняю профиль магазина: название, адрес, описание
- Добавляю товары: название, цена, единица (шт/м²/кг/л/уп), категория, наличие
- Редактирую и удаляю товары

---

## Функциональность (реализовано)

### Авторизация
- Регистрация: email + пароль + выбор роли (клиент / мастер / перевозчик / магазин)
- Вход, выход, сброс пароля (Supabase Auth)
- После регистрации → `/onboarding` (3-шаговый флоу)

### Онбординг (`/onboarding`)
- Шаг 1: имя + телефон
- Шаг 2: город / район
- Шаг 3: экран «Готово» с CTA по роли
- Сохраняет данные в `profiles` через ProfileService

### Профили
- Клиент: имя, телефон, город/район
- Мастер: то же + таблица ставок (тип работы → ₽/м²)
- Перевозчик: то же + опциональный профиль (тип ТС, цена за км, мин. цена, макс. вес)
- Магазин: то же + профиль магазина (название, адрес, описание) через `/store/profile`
- Редактирование личных данных через `/profile`

### Заявки на ремонт (клиент ↔ мастер)
- Создание: тип работы (список из `work_types`), площадь (м²), адрес, описание, фото (до 5)
- Список с фильтром по статусу + бейдж непрочитанных сообщений и новых откликов
- Детальный просмотр с откликами мастеров, выбор, завершение с рейтингом

### Просмотр заявок (мастер)
- Лента всех открытых заявок (статус `new`) с фильтром по типу работ
- Карточка: тип работы, площадь, район, дата
- Нельзя откликнуться дважды

### Отклики мастера
- Предложенная цена: авторасчёт (площадь × ставка) или ручной ввод
- Комментарий, срок выполнения (дней)

### Выбор мастера и завершение
- Клиент сравнивает отклики и выбирает мастера → статус `master_selected`
- Кнопка «Завершить» → статус `completed`, рейтинг + отзыв

### Чат
- Realtime-чат по паре `(order_id, master_id)` через Supabase Realtime
- Бейджи непрочитанных сообщений: на карточках заявок и в навбаре мастера
- Счётчик обновляется в реальном времени

### Транспортные заявки (клиент ↔ перевозчик)
- Создание: откуда/куда, описание груза, вес, объём, дата, бюджет
- Статусы: `new → carrier_selected → completed | cancelled`
- Перевозчик видит все открытые заявки, откликается с ценой и типом ТС
- Клиент выбирает перевозчика, завершает с рейтингом

### Каталог магазина
- Магазин добавляет/редактирует/удаляет товары через `/store/products`
- Все роли видят список магазинов (`/shops`) и витрину конкретного магазина (`/shops/:id`)
- Витрина: фильтр по категориям, карточки товаров с ценой, единицей и статусом наличия

### Жалобы
- Клиент и мастер могут подать жалобу из карточки заявки
- Администратор рассматривает жалобы в `/admin/complaints`

### Админ-панель (`/admin`)
- Управление пользователями: список, удаление
- Управление видами работ: добавить / удалить без SQL
- Управление жалобами: просмотр, удаление пользователя, отклонение

---

## Модель данных

### `work_types`
| поле | тип |
|------|-----|
| id | uuid PK |
| name | text NOT NULL |
| slug | text UNIQUE |

Seed: укладка_плитки, покраска, штукатурка, шпаклёвка, сантехника, электрика, напольные_покрытия, потолки, кладка_кирпича, стяжка, сварка, общестроительные_работы

### `profiles`
| поле | тип |
|------|-----|
| id | uuid PK → auth.users |
| role | enum('client','master','carrier','store') NOT NULL |
| name | text NOT NULL |
| phone | text |
| city_district | text |
| is_admin | bool DEFAULT false |
| created_at | timestamptz DEFAULT now() |

### `master_rates`
| поле | тип |
|------|-----|
| id | uuid PK |
| master_id | uuid FK → profiles |
| work_type_id | uuid FK → work_types |
| rate_per_sqm | numeric(10,2) NOT NULL |
| UNIQUE | (master_id, work_type_id) |

### `orders`
| поле | тип |
|------|-----|
| id | uuid PK |
| client_id | uuid FK → profiles |
| work_type_id | uuid FK → work_types |
| area_sqm | numeric(8,2) NOT NULL |
| address | text NOT NULL |
| description | text |
| photo_urls | text[] |
| status | enum('new','master_selected','completed') DEFAULT 'new' |
| selected_master_id | uuid FK → profiles NULLABLE |
| rating | integer NULLABLE |
| review_text | text NULLABLE |
| created_at | timestamptz DEFAULT now() |
| updated_at | timestamptz DEFAULT now() |

Индексы: `(client_id)`, `(status)`, `(work_type_id)`

### `responses`
| поле | тип |
|------|-----|
| id | uuid PK |
| order_id | uuid FK → orders |
| master_id | uuid FK → profiles |
| proposed_price | numeric(10,2) NOT NULL |
| comment | text |
| estimated_days | integer |
| created_at | timestamptz DEFAULT now() |
| UNIQUE | (order_id, master_id) |

### `messages`
| поле | тип |
|------|-----|
| id | uuid PK |
| order_id | uuid FK → orders |
| master_id | uuid FK → profiles |
| sender_id | uuid FK → profiles |
| content | text NOT NULL |
| is_read_by_client | bool DEFAULT false |
| is_read_by_master | bool DEFAULT false |
| created_at | timestamptz DEFAULT now() |

### `carrier_profiles`
| поле | тип |
|------|-----|
| carrier_id | uuid PK FK → profiles |
| vehicle_type | enum('car','minivan','gazelle','truck') |
| price_per_km | numeric(10,2) |
| min_price | numeric(10,2) |
| max_weight_kg | numeric(8,2) |

### `transport_orders`
| поле | тип |
|------|-----|
| id | uuid PK |
| client_id | uuid FK → profiles |
| from_address | text NOT NULL |
| to_address | text NOT NULL |
| cargo_description | text NOT NULL |
| cargo_weight_kg | numeric(8,2) |
| cargo_volume_m3 | numeric(8,2) |
| transport_date | date |
| budget | numeric(10,2) |
| status | enum('new','carrier_selected','completed','cancelled') DEFAULT 'new' |
| selected_carrier_id | uuid FK → profiles NULLABLE |
| rating | integer NULLABLE |
| review_text | text NULLABLE |
| created_at | timestamptz DEFAULT now() |
| updated_at | timestamptz DEFAULT now() |

### `transport_responses`
| поле | тип |
|------|-----|
| id | uuid PK |
| order_id | uuid FK → transport_orders |
| carrier_id | uuid FK → profiles |
| proposed_price | numeric(10,2) NOT NULL |
| comment | text |
| vehicle_type | enum('car','minivan','gazelle','truck') |
| status | enum('new','selected','rejected') DEFAULT 'new' |
| created_at | timestamptz DEFAULT now() |
| UNIQUE | (order_id, carrier_id) |

### `store_profiles`
| поле | тип |
|------|-----|
| store_id | uuid PK FK → profiles |
| store_name | text NOT NULL |
| address | text |
| description | text |
| created_at | timestamptz DEFAULT now() |

### `products`
| поле | тип |
|------|-----|
| id | uuid PK |
| store_id | uuid FK → store_profiles |
| name | text NOT NULL |
| description | text |
| price | numeric(10,2) NOT NULL |
| unit | text NOT NULL ('шт'/'м²'/'кг'/'л'/'уп') |
| category | text |
| in_stock | boolean DEFAULT true |
| created_at | timestamptz DEFAULT now() |

### `complaints`
| поле | тип |
|------|-----|
| id | uuid PK |
| order_id | uuid FK → orders |
| complainant_id | uuid FK → profiles |
| target_id | uuid FK → profiles |
| reason | text NOT NULL |
| created_at | timestamptz DEFAULT now() |

---

## Миграции

| файл | статус | описание |
|------|--------|----------|
| 001–016 | ✅ применено | Базовая схема, роли, мастера, заказы, чат, жалобы, админ |
| 017_carrier.sql | ✅ применено | carrier_profiles, transport_orders, transport_responses |
| 018_store.sql | ✅ применено | store_profiles, products |

---

## Row Level Security

| таблица | правило |
|---------|---------|
| profiles | SELECT — любой авторизованный; UPDATE — только свой профиль |
| master_rates | SELECT — любой авторизованный; INSERT/UPDATE/DELETE — только свой master_id |
| orders | SELECT(new) — любой авторизованный; INSERT — только клиент; UPDATE — только владелец |
| responses | SELECT — владелец заявки + сам мастер; INSERT — только мастер, статус = 'new' |
| messages | SELECT/INSERT — участники чата (клиент заявки или мастер отклика) |
| carrier_profiles | SELECT — любой авторизованный; INSERT/UPDATE — только свой carrier_id |
| transport_orders | SELECT(new) — любой авторизованный; INSERT — только клиент; UPDATE — только владелец |
| transport_responses | SELECT — владелец заявки + сам перевозчик; INSERT — только перевозчик |
| store_profiles | SELECT — любой авторизованный; INSERT/UPDATE — только свой store_id |
| products | SELECT — любой авторизованный; INSERT/UPDATE/DELETE — только владелец магазина |

---

## Архитектура Angular

```
src/app/
├── core/
│   ├── guards/       auth.guard, role.guard, admin.guard
│   ├── models/       types.ts
│   └── services/
│       ├── auth.service.ts
│       ├── profile.service.ts
│       ├── order.service.ts
│       ├── response.service.ts
│       ├── chat.service.ts
│       ├── storage.service.ts
│       ├── carrier.service.ts
│       ├── store.service.ts
│       └── admin.service.ts
├── shared/
│   └── components/
│       └── nav/      nav.ts, nav.html
└── features/
    ├── home/
    ├── onboarding/
    ├── auth/
    │   ├── login/
    │   └── register/
    ├── profile/
    ├── client/
    │   ├── orders-list/
    │   ├── order-create/
    │   ├── order-detail/
    │   ├── transport-orders-list/
    │   ├── transport-order-create/
    │   └── transport-order-detail/
    ├── master/
    │   ├── orders-browse/
    │   ├── order-detail/
    │   └── my-responses/
    ├── carrier/
    │   ├── orders-browse/
    │   ├── order-detail/
    │   └── my-responses/
    ├── store/
    │   ├── products-list/
    │   ├── product-form/
    │   └── store-profile/
    ├── shops/
    │   ├── shops-list/
    │   └── shop-detail/
    └── admin/
        ├── users/
        ├── work-types/
        └── complaints/
```

### Маршруты

| путь | компонент | роль | guard |
|------|-----------|------|-------|
| `/` | HomeComponent | — | — |
| `/onboarding` | OnboardingComponent | — | authGuard |
| `/auth/login` | LoginComponent | — | — |
| `/auth/register` | RegisterComponent | — | — |
| `/profile` | ProfileEditComponent | все | authGuard |
| `/client/orders` | ClientOrdersListComponent | client | authGuard, roleGuard |
| `/client/orders/new` | OrderCreateComponent | client | authGuard, roleGuard |
| `/client/orders/:id` | ClientOrderDetailComponent | client | authGuard, roleGuard |
| `/client/transport-orders` | ClientTransportOrdersListComponent | client | authGuard, roleGuard |
| `/client/transport-orders/new` | TransportOrderCreateComponent | client | authGuard, roleGuard |
| `/client/transport-orders/:id` | ClientTransportOrderDetailComponent | client | authGuard, roleGuard |
| `/master/orders` | MasterOrdersBrowseComponent | master | authGuard, roleGuard |
| `/master/orders/:id` | MasterOrderDetailComponent | master | authGuard, roleGuard |
| `/master/responses` | MasterMyResponsesComponent | master | authGuard, roleGuard |
| `/carrier/orders` | CarrierOrdersBrowseComponent | carrier | authGuard, roleGuard |
| `/carrier/orders/:id` | CarrierOrderDetailComponent | carrier | authGuard, roleGuard |
| `/carrier/responses` | CarrierMyResponsesComponent | carrier | authGuard, roleGuard |
| `/store/products` | StoreProductsListComponent | store | authGuard, roleGuard |
| `/store/products/new` | ProductFormComponent | store | authGuard, roleGuard |
| `/store/products/:id/edit` | ProductFormComponent | store | authGuard, roleGuard |
| `/store/profile` | StoreProfileComponent | store | authGuard, roleGuard |
| `/shops` | ShopsListComponent | все | authGuard |
| `/shops/:id` | ShopDetailComponent | все | authGuard |
| `/admin` | — | is_admin | adminGuard |
| `**` | — | — | → `/` |

---

## Ключевые Supabase-запросы

```typescript
// Все открытые заявки для мастера
supabase
  .from('orders')
  .select('*, work_types(name), profiles!client_id(name, city_district)')
  .eq('status', 'new')
  .order('created_at', { ascending: false })

// Создать отклик мастера
supabase
  .from('responses')
  .insert({ order_id, master_id, proposed_price, comment, estimated_days })

// Выбрать мастера (клиент)
supabase
  .from('orders')
  .update({ status: 'master_selected', selected_master_id: masterId })
  .eq('id', orderId).eq('client_id', currentUserId)

// Авторасчёт цены мастера
const rate = await supabase
  .from('master_rates')
  .select('rate_per_sqm')
  .eq('master_id', masterId).eq('work_type_id', workTypeId).single()
const price = order.area_sqm * (rate.data?.rate_per_sqm ?? 0)

// Все открытые транспортные заявки
supabase
  .from('transport_orders')
  .select('*, profiles!client_id(name)')
  .eq('status', 'new')
  .order('created_at', { ascending: false })

// Выбрать перевозчика + отклонить остальных
supabase.from('transport_orders').update({ status: 'carrier_selected', selected_carrier_id }).eq('id', orderId)
supabase.from('transport_responses').update({ status: 'selected' }).eq('id', responseId)
supabase.from('transport_responses').update({ status: 'rejected' }).eq('order_id', orderId).neq('id', responseId)

// Непрочитанные сообщения (клиент)
supabase
  .from('messages')
  .select('order_id')
  .eq('is_read_by_client', false)
  .neq('sender_id', currentUserId)
```

---

## Решённые архитектурные вопросы

| вопрос | решение |
|--------|---------|
| Отмена заявки после выбора мастера | Нет — `master_selected` финальный |
| Показывать заявки мастеру без ставки | Да — цена вводится вручную |
| Дизайн-система | «Тёплая мастерская» — тёмно-синий + терракота, Golos Text. Подробно в DESIGN.md |
| Логотип | SVG-арка (не emoji) |
| Онбординг | 3 шага после регистрации перед входом в приложение |
| Транспортные заявки | Отдельный тип, не связан с заявками на ремонт |
| Чат для перевозчиков | Нет в текущей версии — транспортный флоу проще |
| Ставки перевозчика | Опциональный профиль; цена всегда указывается в отклике |
| Магазин — покупка в приложении | Только просмотр, контакт напрямую. Все роли видят витрину. |
| Магазин — профиль | Отдельная страница `/store/profile`, не через `/profile` |

---

## Следующие шаги

- [x] Роль перевозчика ✅
- [x] Роль строительного магазина ✅
- [x] Responsive UI на Angular ✅
- [x] Миграция с Supabase на NestJS — единый API для веба и мобилки ✅
- [x] База данных подключена (Supabase PostgreSQL через Prisma, схема применена) ✅
- [ ] Сквозное тестирование: запустить NestJS + Angular, пройти полный цикл (регистрация → заявка → отклик → чат → завершение)
- [ ] Flutter-приложение (Google Play + App Store) — поверх NestJS API
- [ ] Онлайн-оплата (ЮKassa) — после NestJS, интегрируется и в веб и в Flutter

---

## Вне MVP

| фича | статус |
|------|--------|
| Роль перевозчика | ✅ реализовано |
| Роль строительного магазина | ✅ реализовано |
| Мобильная версия (responsive) | ✅ реализовано |
| Онлайн-оплата | ⏳ после тестирования |
| Email-уведомления | Supabase webhook → Edge Function → Resend |
| Портфолио мастера | важно для доверия |
| iOS / Android (Flutter) | 🔜 после NestJS миграции |

---

## Расширение после MVP

- **Email:** Supabase Database Webhook → Edge Function → Resend (триггеры: новый отклик, выбран мастер/перевозчик)
- **Оплата:** ЮKassa (основной провайдер для РФ), поле `payment_status` в `orders` и `transport_orders`, эскроу-флоу. Вебхуки обрабатываются на NestJS бэкенде (секретный ключ не может быть на фронте). Реализовывать только после миграции на NestJS.
- **Регионы:** поле `region` в `profiles` и заявках, фильтр в ленте

---

## Монетизация

MVP запускается **бесплатно** — приоритет набрать базу клиентов и мастеров.

| модель | фаза | кто платит |
|--------|------|-----------|
| Платные отклики (кредиты) | 1 (50+ мастеров) | мастер |
| Комиссия с онлайн-оплаты 5–8% | 2 (после оплаты) | мастер |
| Подписка для магазинов/перевозчиков | 3 | бизнес |
| Продвижение в ленте | 3 | мастер / магазин |

**Фаза 1 — кредиты:** поле `credits_balance` в `profiles` + таблица `credit_transactions`. Первые 10 откликов бесплатно.

---

## Миграция с Supabase на собственный бэкенд

### Причина
Supabase недоступен без VPN в регионе пользователя. После завершения всего функционала нужен переход на собственный бэкенд.

### Когда делать
**Лучший момент:** когда все роли реализованы и протестированы — тогда есть чёткие API-контракты и не нужно параллельно разрабатывать новый функционал.

### Что заменить

| Supabase | Своё решение |
|---|---|
| PostgreSQL (cloud) | PostgreSQL self-hosted (Railway, Render, VPS) |
| Supabase Auth | NestJS + Passport.js + JWT + bcrypt |
| PostgREST API | NestJS REST API |
| RLS политики | Guards / Middleware в NestJS |
| Supabase Realtime | Socket.io (WebSocket) |
| supabase-js клиент | Angular HttpClient |

### Архитектура нового бэкенда

```
NestJS API
├── auth/          — регистрация, логин, JWT refresh
├── users/         — профили, роли
├── orders/        — заказы на ремонт
├── responses/     — отклики мастеров
├── transport/     — транспортные заявки и отклики
├── carriers/      — профили перевозчиков
└── admin/         — управление пользователями
```

### Что НЕ придётся переписывать
- Все Angular компоненты и шаблоны
- Бизнес-логику в компонентах
- Роутинг и guards (только auth.guard поменяется)
- Стили и UI
- База данных — та же схема PostgreSQL

### Что придётся переписывать
- `SupabaseService` → базовый `HttpClient` сервис
- `AuthService` — логин/регистрация через REST вместо supabase-js
- Все методы в сервисах (`ProfileService`, `CarrierService` и т.д.) — запросы через `HttpClient`

---

## Мобильное приложение (Flutter)

### Почему Flutter
- Попадание в Google Play и App Store
- Нативная плавность и скорость (рисует UI сам, без WebView)
- Один код → iOS + Android
- Подходит для маркетплейса: списки, карточки, формы, уведомления

### Стек

| Слой | Технология |
|---|---|
| Мобильный фреймворк | Flutter (Dart) |
| Навигация | GoRouter |
| Состояние | Riverpod |
| HTTP клиент | Dio |
| Бэкенд | NestJS REST API (тот же, что и для веба) |
| Оплата | ЮKassa Flutter SDK |
| Push-уведомления | Firebase Cloud Messaging (FCM) |

### Архитектура

```
Angular (веб)  ──┐
                  ├──► NestJS API ──► PostgreSQL
Flutter (mobile)──┘
```

Оба клиента работают с одним бэкендом. Бизнес-логика не дублируется.

### Когда делать
После миграции на NestJS — Flutter-приложение строится поверх уже готового REST API.
