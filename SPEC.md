# Мастеро — техническая спецификация

## Обзор

Мастеро — строительный маркетплейс, соединяющий клиентов с мастерами-ремонтниками. Клиент создаёт заявку (тип работы, площадь, адрес), мастера откликаются с ценой и сроками, клиент выбирает исполнителя. Стороны общаются напрямую через встроенный чат.

**Запуск:** Чеченская Республика. Архитектура рассчитана на расширение по регионам РФ.

**Стек:** Angular · Supabase Auth + PostgreSQL · Supabase Storage · Supabase Realtime

**Дизайн-система:** [DESIGN.md](DESIGN.md) — единственный источник истины по UI.

---

## Пользовательские истории

**Клиент**
- Регистрируюсь как клиент, прохожу онбординг (имя, телефон, район)
- Создаю заявку: тип работы, площадь, адрес, описание, фото
- Вижу список своих заявок с фильтром по статусу
- Просматриваю отклики мастеров: цена, срок, комментарий
- Выбираю мастера — общаюсь с ним в чате
- Отмечаю работу завершённой

**Мастер**
- Регистрируюсь как мастер, прохожу онбординг (имя, телефон, район)
- Указываю ставки за м² для каждой специализации в профиле
- Вижу все открытые заявки клиентов
- Откликаюсь: цена авторасчётом (площадь × ставка), добавляю комментарий и срок
- После выбора клиентом — общаюсь с ним в чате
- Вижу список своих откликов

---

## Функциональность (реализовано)

### Авторизация
- Регистрация: email + пароль + выбор роли (клиент / мастер)
- Вход, выход, сброс пароля (Supabase Auth)
- После регистрации → `/onboarding` (3-шаговый флоу)

### Онбординг (`/onboarding`)
- Шаг 1: имя + телефон
- Шаг 2: город / район
- Шаг 3: экран «Готово» с CTA по роли (клиент → создать заявку; мастер → найти заказ)
- Сохраняет данные в `profiles` через ProfileService

### Профили
- Клиент: имя, телефон, город/район
- Мастер: то же + таблица ставок (тип работы → ₽/м²)
- Редактирование в любое время через `/profile`

### Заявки (клиент)
- Создание: тип работы (список из `work_types`), площадь (м²), адрес, описание, фото (до 5)
- Список с фильтром по статусу + бейдж непрочитанных сообщений и новых откликов
- Детальный просмотр с откликами мастеров

### Просмотр заявок (мастер)
- Лента всех открытых заявок (статус `new`)
- Карточка: тип работы, площадь, район, дата
- Нельзя откликнуться дважды

### Отклики
- Предложенная цена: авторасчёт (площадь × ставка) или ручной ввод
- Комментарий, срок выполнения (дней)

### Выбор мастера и завершение
- Клиент сравнивает отклики и выбирает мастера → статус `master_selected`
- Кнопка «Завершить» → статус `completed`

### Чат
- Realtime-чат по паре `(order_id, master_id)` через Supabase Realtime
- Бейджи непрочитанных сообщений: на карточках заявок и в навбаре мастера
- Счётчик обновляется в реальном времени

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
| role | enum('client','master') NOT NULL |
| name | text NOT NULL |
| phone | text |
| city_district | text |
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

---

## Row Level Security

| таблица | правило |
|---------|---------|
| profiles | SELECT — любой авторизованный; UPDATE — только свой профиль |
| master_rates | SELECT — любой авторизованный; INSERT/UPDATE/DELETE — только свой master_id |
| orders | SELECT(new) — любой авторизованный; INSERT — только клиент; UPDATE — только владелец |
| responses | SELECT — владелец заявки + сам мастер; INSERT — только мастер, статус = 'new' |
| messages | SELECT/INSERT — участники чата (клиент заявки или мастер отклика) |

---

## Архитектура Angular

```
src/app/
├── core/
│   ├── guards/       auth.guard, role.guard
│   ├── models/       types.ts
│   └── services/
│       ├── auth.service.ts
│       ├── profile.service.ts
│       ├── order.service.ts
│       ├── response.service.ts
│       ├── chat.service.ts
│       └── storage.service.ts
├── shared/
│   └── components/
│       └── nav/      nav.ts, nav.html
└── features/
    ├── home/         home.ts, home.html          (лендинг, /)
    ├── onboarding/   onboarding.ts, onboarding.html
    ├── auth/
    │   ├── login/
    │   └── register/
    ├── profile/      profile-edit.ts, profile-edit.html
    ├── client/
    │   ├── orders-list/
    │   ├── order-create/
    │   └── order-detail/
    └── master/
        ├── orders-browse/
        ├── order-detail/
        └── my-responses/
```

### Маршруты

| путь | компонент | роль | guard |
|------|-----------|------|-------|
| `/` | HomeComponent | — | — |
| `/onboarding` | OnboardingComponent | — | authGuard |
| `/auth/login` | LoginComponent | — | — |
| `/auth/register` | RegisterComponent | — | — |
| `/profile` | ProfileEditComponent | оба | authGuard |
| `/client/orders` | ClientOrdersListComponent | client | authGuard, roleGuard |
| `/client/orders/new` | OrderCreateComponent | client | authGuard, roleGuard |
| `/client/orders/:id` | ClientOrderDetailComponent | client | authGuard, roleGuard |
| `/master/orders` | MasterOrdersBrowseComponent | master | authGuard, roleGuard |
| `/master/orders/:id` | MasterOrderDetailComponent | master | authGuard, roleGuard |
| `/master/responses` | MasterMyResponsesComponent | master | authGuard, roleGuard |
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

// Создать отклик
supabase
  .from('responses')
  .insert({ order_id, master_id, proposed_price, comment, estimated_days })

// Выбрать мастера (клиент)
supabase
  .from('orders')
  .update({ status: 'master_selected', selected_master_id: masterId })
  .eq('id', orderId).eq('client_id', currentUserId)

// Авторасчёт цены
const rate = await supabase
  .from('master_rates')
  .select('rate_per_sqm')
  .eq('master_id', masterId).eq('work_type_id', workTypeId).single()
const price = order.area_sqm * (rate.data?.rate_per_sqm ?? 0)

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

---

## Вне MVP

| фича | причина отложить |
|------|-----------------|
| Отзывы и рейтинги | нужна история завершённых заказов |
| Онлайн-оплата | платёжный шлюз = юрлицо + интеграция |
| Email-уведомления | Supabase webhook → Edge Function → Resend; не блокирует MVP |
| Панель администратора | нужна после верификации мастеров |
| Портфолио мастера | важно для доверия, добавить в следующей итерации |
| iOS / Android приложение | PWA достаточно для MVP |
| Перевозчики / Строймагазины | отдельные бизнес-модели, после валидации ядра |

---

## Расширение после MVP

- **Отзывы:** таблица `reviews(order_id, author_id, target_id, rating, text)` + avg_rating в профиле
- **Email:** Supabase Database Webhook → Edge Function → Resend (3 триггера: новый отклик, выбран мастер, новая заявка по специализации)
- **Оплата:** ЮKassa / Stripe, поле `payment_status` в `orders`, эскроу-флоу
- **Регионы:** поле `region` в `profiles` и `orders`, фильтр в ленте

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
