# Мастеро — техническая спецификация

## Обзор

Мастеро — строительный маркетплейс, соединяющий клиентов с мастерами-ремонтниками, перевозчиками и строительными магазинами. Клиент создаёт заявку (тип работы, площадь, адрес), мастера откликаются с ценой и сроками, клиент выбирает исполнителя. Отдельный тип заявок — перевозка грузов. Строительные магазины размещают каталог товаров.

**Запуск:** Чеченская Республика. Архитектура рассчитана на расширение по регионам РФ.

**Стек:** Angular · NestJS (Prisma + PostgreSQL) · JWT Auth · REST API · Ionic · Flutter

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
- Создаю заявку на перевозку груза (инструменты, материалы), выбираю перевозчика, общаюсь в чате

**Перевозчик**
- Регистрируюсь как перевозчик, прохожу онбординг
- Опционально указываю тип ТС, цену за км, мин. цену, макс. грузоподъёмность
- Вижу все открытые транспортные заявки (от клиентов и мастеров)
- Откликаюсь с предложенной ценой и типом ТС
- После выбора — общаюсь с заказчиком в чате
- Вижу список своих откликов с фильтром по статусу

**Магазин**
- Регистрируюсь как магазин, прохожу онбординг
- Заполняю профиль магазина: название, адрес, телефон, описание
- Добавляю товары: название, цена, единица (шт/м²/кг/л/уп), категория, наличие
- Редактирую и удаляю товары

---

## Функциональность (реализовано)

### Авторизация
- Регистрация: email + пароль + выбор роли (клиент / мастер / перевозчик / магазин)
- Вход, выход, сброс пароля (JWT через NestJS)
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

### Чат (клиент ↔ мастер)
- Чат по паре `(order_id, master_id)`, хранится в `messages`
- Polling каждые 2 сек, оптимистичная отправка, `read_at` при открытии
- Бейджи непрочитанных сообщений на карточках заявок (polling 10 сек)

### Транспортные заявки (клиент/мастер ↔ перевозчик)
- Создание доступно клиентам и мастерам (хранится как `client_id`)
- Маршрут, описание груза, вес, объём, дата, бюджет
- Статусы: `new → carrier_selected → completed | cancelled`
- Перевозчик видит все открытые заявки, откликается с ценой и типом ТС
- Бейджи непрочитанных откликов и сообщений на карточках заявок (polling 10 сек)
- Завершение в два шага: сначала «Груз доставлен — завершить» → потом форма оценки
- Чат между заказчиком и перевозчиком (см. «Чат транспорт»)

### Чат транспорт (заказчик ↔ перевозчик)
- Доступен после выбора перевозчика, хранится в `transport_messages`
- Ключ чата: `(order_id, carrier_id)` — по аналогии с мастер-чатом
- Polling каждые 3 сек, оптимистичная отправка, авто-сброс непрочитанных при открытии
- Бейджи на списке заявок (клиент/мастер) и на карточках откликов (перевозчик)

### Каталог магазина
- Магазин добавляет/редактирует/удаляет товары через `/store/products`
- Профиль магазина: название, адрес, описание, телефон (сохраняется в `profiles.phone`)
- Все роли видят список магазинов (`/shops`) и витрину конкретного магазина (`/shops/:id`)
- Витрина: фильтр по категориям, карточки товаров с ценой, единицей, статусом наличия
- На товарах «В наличии» — кнопка «Позвонить» (tel: ссылка на телефон магазина)

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

Seed (19 видов): укладка плитки, малярные работы, покраска стен и потолка, поклейка обоев, штукатурка и шпаклёвка, стяжка пола, укладка ламината/паркета, натяжные потолки, электромонтажные работы, сантехника, установка плинтусов, установка дверей и окон, монтаж карнизов, сборка мебели, укладка кирпича, фундаментные работы, кровельные работы, общестроительные работы, другое

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
| status | text DEFAULT 'new' (new/selected/rejected) |
| seen | boolean DEFAULT false |
| created_at | timestamptz DEFAULT now() |
| UNIQUE | (order_id, master_id) |

### `messages`
| поле | тип |
|------|-----|
| id | uuid PK |
| order_id | uuid FK → orders |
| master_id | uuid FK → profiles NULLABLE |
| sender_id | uuid FK → profiles |
| content | text NOT NULL |
| read_at | timestamptz NULLABLE |
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
| seen | boolean DEFAULT false |
| created_at | timestamptz DEFAULT now() |
| UNIQUE | (order_id, carrier_id) |

### `transport_messages`
| поле | тип |
|------|-----|
| id | text PK |
| order_id | text FK → transport_orders |
| carrier_id | text FK → profiles |
| sender_id | text FK → profiles |
| content | text NOT NULL |
| read_at | timestamptz NULLABLE |
| created_at | timestamp DEFAULT now() |

Индексы: `(order_id, carrier_id)`

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
| 019_transport_response_seen.sql | ✅ применено | seen boolean на transport_responses |
| 020_transport_messages.sql | ✅ применено | transport_messages — чат перевозчик ↔ заказчик |

---

## Авторизация и доступ (NestJS Guards)

Supabase RLS не используется — доступ контролируется на уровне NestJS:

| Guard | назначение |
|-------|-----------|
| `JwtAuthGuard` | глобальный — все роуты требуют JWT, кроме помеченных `@Public()` |
| `RoleGuard` | проверяет `user.role` для защищённых разделов |
| `AdminGuard` | `is_admin = true` для `/admin/*` |

Бизнес-правила (владелец заявки, участник чата) проверяются внутри сервисов через `ForbiddenException`.

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
    │   ├── my-responses/
    │   ├── transport-orders-list/
    │   ├── transport-order-create/
    │   └── transport-order-detail/
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
| `/master/transport-orders` | MasterTransportOrdersListComponent | master | authGuard, roleGuard |
| `/master/transport-orders/new` | MasterTransportOrderCreateComponent | master | authGuard, roleGuard |
| `/master/transport-orders/:id` | MasterTransportOrderDetailComponent | master | authGuard, roleGuard |
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

## NestJS API (база URL: `/api`, порт 3001)

### Авторизация
| метод | путь | описание |
|-------|------|----------|
| POST | `/auth/register` | регистрация → `{ token, user }` |
| POST | `/auth/login` | вход → `{ token, user }` |
| POST | `/auth/forgot-password` | сброс пароля |

### Профили
| метод | путь | описание |
|-------|------|----------|
| GET | `/profiles/me` | свой профиль + carrier_profile/store_profile/master_rates |
| PATCH | `/profiles/me` | обновить имя, телефон, район |
| GET | `/profiles/:id` | профиль по ID |
| PATCH | `/profiles/me/carrier-profile` | обновить профиль перевозчика |
| POST | `/master-rates` | добавить/обновить ставку мастера |
| DELETE | `/master-rates/:workTypeId` | удалить ставку |

### Заявки на ремонт
| метод | путь | описание |
|-------|------|----------|
| GET | `/orders` | все открытые заявки (для мастера) |
| GET | `/orders/my` | заявки клиента |
| GET | `/orders/:id` | детали заявки |
| POST | `/orders` | создать заявку |
| PATCH | `/orders/:id/select-master` | выбрать мастера |
| PATCH | `/orders/:id/complete` | завершить заявку |
| PATCH | `/orders/:id/rate` | оставить рейтинг |
| DELETE | `/orders/:id` | удалить заявку |
| GET | `/orders/master-stats` | статистика мастеров (рейтинг, кол-во заявок) |

### Отклики мастера
| метод | путь | описание |
|-------|------|----------|
| POST | `/responses` | создать отклик |
| GET | `/responses/my` | свои отклики |
| GET | `/responses/by-order/:orderId` | отклики по заявке |
| GET | `/responses/unseen-counts` | непросмотренные отклики по заявкам клиента |
| POST | `/responses/order/:orderId/seen` | пометить отклики заявки просмотренными |

### Чат (ремонт)
| метод | путь | описание |
|-------|------|----------|
| GET | `/messages/order/:orderId/master/:masterId` | загрузить сообщения |
| POST | `/messages/order/:orderId/master/:masterId` | отправить сообщение |
| POST | `/messages/order/:orderId/master/:masterId/read` | пометить прочитанными |
| GET | `/messages/unread` | количество непрочитанных по заявкам |

### Транспортные заявки
| метод | путь | описание |
|-------|------|----------|
| GET | `/transport-orders` | все открытые (для перевозчика) |
| GET | `/transport-orders/my` | свои заявки (клиент/мастер) |
| GET | `/transport-orders/:id` | детали |
| POST | `/transport-orders` | создать |
| PATCH | `/transport-orders/:id/select-carrier` | выбрать перевозчика |
| PATCH | `/transport-orders/:id/complete` | завершить |
| PATCH | `/transport-orders/:id/rate` | оценить |

### Отклики перевозчика
| метод | путь | описание |
|-------|------|----------|
| POST | `/transport-responses` | создать отклик |
| GET | `/transport-responses/my` | свои отклики |
| GET | `/transport-responses/by-order/:orderId` | отклики по заявке |
| GET | `/transport-responses/unseen-counts` | непросмотренные отклики |
| POST | `/transport-responses/order/:orderId/seen` | пометить просмотренными |

### Чат (транспорт)
| метод | путь | описание |
|-------|------|----------|
| GET | `/transport-messages/order/:orderId/carrier/:carrierId` | загрузить сообщения |
| POST | `/transport-messages/order/:orderId/carrier/:carrierId` | отправить |
| POST | `/transport-messages/order/:orderId/carrier/:carrierId/read` | пометить прочитанными |
| GET | `/transport-messages/unread` | количество непрочитанных |

### Магазины и товары
| метод | путь | описание |
|-------|------|----------|
| GET | `/store/all` | все магазины |
| GET | `/store/:id` | витрина магазина + товары |
| GET | `/store/profile` | свой профиль магазина |
| POST/PATCH | `/store/profile` | сохранить профиль |
| GET | `/products/my` | свои товары |
| POST | `/products` | добавить товар |
| PATCH | `/products/:id` | обновить |
| DELETE | `/products/:id` | удалить |

### Прочее
| метод | путь | описание |
|-------|------|----------|
| GET | `/work-types` | список видов работ |
| POST | `/complaints` | подать жалобу |
| POST | `/uploads/photo` | загрузить фото → `{ url }` |

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
| Чат для перевозчиков | ✅ реализован — `transport_messages`, ключ `(order_id, carrier_id)` |
| Ставки перевозчика | Опциональный профиль; цена всегда указывается в отклике |
| Магазин — покупка в приложении | Только контакт: кнопка «Позвонить» на товаре открывает tel: ссылку |
| Магазин — профиль | Отдельная страница `/store/profile`, не через `/profile` |
| Транспорт — кто может заказать | Клиент и мастер (оба хранятся как `client_id` в `transport_orders`) |
| Завершение транспортной заявки | Два шага: сначала «Завершить», потом форма оценки (не одновременно) |
| Empty state иллюстрации | Freepik pana/bro SVG на всех пустых экранах — сайт и Flutter. `empty-orders.svg` (каменщик), `empty-transport.svg` (грузовик), `empty-shops.svg` (магазин). Все роли охвачены. |

---

## Следующие шаги

- [x] Роль перевозчика ✅
- [x] Роль строительного магазина ✅
- [x] Responsive UI на Angular ✅
- [x] Миграция с Supabase на NestJS — единый API для веба и мобилки ✅
- [x] База данных подключена (PostgreSQL через Prisma, схема применена) ✅
- [x] Чат перевозчик ↔ заказчик с уведомлениями ✅
- [x] Мастер может заказывать перевозки ✅
- [x] Телефон магазина + кнопка звонка на товарах ✅
- [x] Сквозное тестирование: полный цикл клиент+мастер+перевозчик+магазин пройден ✅
- [x] Ionic-приложение (Angular + Ionic 8) — протестировано на реальном телефоне ✅
- [x] Flutter-приложение — вход/регистрация работают на Android ✅
- [ ] Тест функциональности Flutter: создать заказ, откликнуться, чат
- [ ] Release APK Flutter (flutter build apk --release) для раздачи
- [x] Деплой на VPS (Nginx + PM2 + PostgreSQL + Certbot) ✅
- [ ] Онлайн-оплата (ЮKassa) — после деплоя

---

## Вне MVP

| фича | статус |
|------|--------|
| Роль перевозчика | ✅ реализовано |
| Роль строительного магазина | ✅ реализовано |
| Мобильная версия (responsive) | ✅ реализовано |
| Онлайн-оплата | ⏳ после Flutter-релиза |
| Email-уведомления | NestJS + nodemailer/Resend (триггер: новый отклик, выбор) |
| Портфолио мастера | важно для доверия |
| iOS / Android (Ionic) | ✅ реализовано 2026-05-31 |
| iOS / Android (Flutter) | ✅ вход/регистрация работают 2026-06-03 |

---

## Расширение после MVP

- **Email:** NestJS сервис (nodemailer или Resend SDK) — триггеры: новый отклик, выбран мастер/перевозчик, завершение заявки.
- **Оплата:** ЮKassa (основной провайдер для РФ), поле `payment_status` в `orders` и `transport_orders`, эскроу-флоу. Вебхуки обрабатываются на NestJS бэкенде (секретный ключ не может быть на фронте). Реализовывать после Flutter-релиза.
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

## NestJS Backend — архитектура

```
backend/src/
├── auth/               — регистрация, вход, JWT стратегия
├── profiles/           — профили пользователей
├── master-rates/       — ставки мастера
├── work-types/         — виды работ
├── orders/             — заявки на ремонт
├── responses/          — отклики мастеров
├── messages/           — чат клиент ↔ мастер
├── transport-orders/   — транспортные заявки
├── transport-responses/— отклики перевозчиков
├── transport-messages/ — чат заказчик ↔ перевозчик
├── carrier-profiles/   — профили перевозчиков
├── store/              — профили магазинов
├── products/           — товары магазина
├── uploads/            — загрузка фото (локально в /uploads)
├── complaints/         — жалобы
├── admin/              — управление пользователями
├── common/             — jwt.guard, role.guard, snake-case interceptor
└── prisma/             — PrismaService
```

**Snake-case interceptor** — автоматически конвертирует camelCase ответы в snake_case для фронтенда.

---

## Мобильное приложение (Ionic) ✅ реализовано 2026-05-31

### Стек

| Слой | Технология |
|---|---|
| Фреймворк | Ionic 8 + Angular 20 (NgModule) |
| HTTP клиент | Angular HttpClient (тот же ApiService что в вебе) |
| Бэкенд | NestJS REST API — тот же, что и для веба |
| Тема | Тёмно-фиолетовая / светлая (переключается в профиле) |
| Доступ с телефона | Cloudflare Tunnel (без VPN, без одной сети) |

### Расположение

```
C:\Users\ADMIN\Documents\Мастеро\mobile\
```

### Запуск

```bash
# Frontend (порт 4201)
cd mobile
node node_modules/@angular/cli/bin/ng.js serve --port 4201 --host 0.0.0.0 --disable-host-check

# Доступ с телефона через туннель
/tmp/cloudflared.exe tunnel --url http://localhost:4201   # frontend
/tmp/cloudflared.exe tunnel --url http://localhost:3001   # backend
```

### Страницы

| Таб | Страницы |
|-----|----------|
| Клиент — Заявки | список заявок, создание, детали + отклики + чат |
| Клиент — Перевозка | список транспортных заявок, создание, детали + отклики + чат |
| Клиент — Магазины | список магазинов, телефон для звонка |
| Мастер — Заказы | лента открытых заказов, детали, отклик, чат |
| Мастер — Отклики | список своих откликов |
| Перевозчик — Грузы | лента открытых заявок, детали, отклик |
| Перевозчик — Отклики | список своих откликов |
| Магазин — Товары | список товаров, добавление, удаление |
| Все роли — Профиль | редактирование, переключатель темы, выход |

### Архитектура

```
Angular (веб, порт 4200)  ──┐
                             ├──► NestJS API (порт 3001) ──► PostgreSQL
Ionic (мобилка, порт 4201) ──┘
```

Все Angular-сервисы (`ApiService`, `AuthService`, `OrderService`, `CarrierService`, `ChatService`, `StoreService`) скопированы из веб-проекта без изменений. Переписан только UI на Ionic-компоненты.

### Цветовая схема

- Шапка / табы: `#1f2937` (тёмно-серый)
- Кнопки действий: `#15803d` (тёмно-зелёный)
- Тёмный фон: `#0f0a1e` (тёмно-фиолетовый), карточки `#1a1135`
- Светлый фон: `#f4f5f8`, карточки белые

---

## Мобильное приложение (Flutter) ✅ реализовано 2026-06-03

### Стек

| Слой | Технология |
|---|---|
| Мобильный фреймворк | Flutter 3.44.0 / Dart 3.12.0 |
| Навигация | GoRouter 13 |
| Состояние | Riverpod 2 |
| HTTP клиент | Dio 5 + PrettyDioLogger |
| Бэкенд | NestJS REST API (тот же, что и для веба) |
| Хранение токена | flutter_secure_storage |

### Расположение

```
C:\Users\ADMIN\Documents\Мастеро\mastero_flutter\
C:\mastero_flutter\   ← junction (обход ошибки кириллицы в пути)
```

### Запуск

```bash
adb reverse tcp:3001 tcp:3001   # пробросить порт бэкенда на телефон
cd C:\mastero_flutter
C:\dev\flutter\bin\flutter.bat run -d 32a18edd   # RMX3472, Android 14
```

### Архитектура

```
Angular (веб, порт 4200)    ──┐
Ionic  (мобилка, порт 4201) ──┼──► NestJS API (порт 3001) ──► PostgreSQL
Flutter (APK на Android)    ──┘
```

Все три клиента работают с одним бэкендом. Бизнес-логика не дублируется.

### Страницы

| Роль | Экраны |
|------|--------|
| Клиент | Мои заказы, создание заказа, детали + отклики, создать транспортный заказ |
| Мастер | Лента заказов, детали + отклик, мои отклики |
| Перевозчик | Лента грузов, детали + отклик, мои отклики |
| Магазин | Товары, добавление/редактирование |
| Все | Профиль, выход |

### Решённые проблемы

| проблема | решение |
|----------|---------|
| Кириллица в пути ломает Gradle | junction `C:\mastero_flutter` + `android.overridePathCheck=true` |
| Gradle 9.1 + AGP 8.1 несовместимы | обновлены AGP 8.11.1 + Kotlin 2.2.20 |
| NDK отсутствует | NDK 28.2.13676358 скачан вручную |
| Flutter engine JARs не найдены | локальный Maven репо `flutter_maven_local` |
| Login: 404 на все запросы | base URL был `localhost:3001` → исправлено на `localhost:3001/api` |
| Login: "Ошибка входа" после 200 OK | поле `access_token` → исправлено на `token` |
| Login: crash при парсинге профиля | `/profiles/me` не возвращал `email` → добавлен `user: { select: { email: true } }` |
