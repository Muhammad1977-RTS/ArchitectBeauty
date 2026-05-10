# DESIGN SYSTEM — Мастеро

> **Правило для AI:** Этот файл — единственный источник истины по дизайну. При генерации любого UI-кода, стилей или компонентов строго следуй правилам ниже. Если что-то здесь не описано — спроси, не придумывай.

---

## 1. Философия

«Тёплая мастерская» — профессиональный маркетплейс мастеров-ремонтников с ощущением надёжности и человечности. Не холодный SaaS, не кричащий marketplace. Тёплые материальные тона (дерево, металл, терракота) + чёткая структура.

**Принципы:**
- Тепло, но не агрессивно — ни одного яркого неона
- Профессионально, но не стерильно — живые тона, не серый корпоратив
- Русскоязычная аудитория — кириллица читается комфортно

---

## 2. Цветовые токены

```css
/* Вставлять в :root {} в styles.scss */

--color-primary:        #1E3A5F;   /* тёмно-синий — доверие, надёжность */
--color-primary-hover:  #16304F;   /* тёмнее на hover */
--color-accent:         #C86A3A;   /* терракота — тепло, ремесло */
--color-accent-light:   #F5E8DF;   /* светлый фон под акцентные элементы */
--color-bg:             #F7F4F0;   /* тёплый пергамент */
--color-surface:        #FFFFFF;   /* карточки, модалки */
--color-text:           #1A1A1A;   /* основной текст */
--color-text-secondary: #6B6560;   /* вспомогательный — тёплый серый */
--color-border:         #E0DBD5;   /* границы — бежевый */
--color-border-strong:  #C8C2BA;   /* акцентные границы */
--color-error:          #C13515;   /* ошибки */
--color-success:        #2D7A5F;   /* успех — зелёный с теплотой */
```

**Нельзя использовать:** `#FF5A5F`, `#00A699` (Airbnb-цвета — удалены навсегда).

**Фиксированные цвета уведомлений (не менять):**
- Бейдж непрочитанных сообщений: `#E53935` (красный)
- Бейдж новых откликов: `#F57C00` (оранжевый)

---

## 3. Типографика

**Шрифт:** Golos Text — подключён через Google Fonts, оптимизирован для кириллицы.

```html
<!-- index.html — уже подключено -->
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font: 'Golos Text', system-ui, -apple-system, sans-serif;
```

**Иерархия размеров:**

| Элемент | Размер | Вес | line-height |
|---------|--------|-----|-------------|
| Заголовок страницы (H1) | 32px | 700 | 1.25 |
| Заголовок секции (H2) | 28px | 700 | 1.25 |
| Подзаголовок карточки | 22px | 600 | 1.35 |
| Заголовок карточки | 17px | 600 | 1.4 |
| Основной текст | 15px | 400 | 1.6 |
| Вспомогательный текст | 13px | 400 | 1.5 |
| Бейдж / метка | 12px | 500 | 1 |

**Логотип в навбаре:** 20px / 700 / `letter-spacing: -0.3px`.

**Ударение:** буква «е» в слове «Мастеро» оформляется через `<span class="accent-e">е</span>`. Класс рисует **мастерок (кельму) вертикально** над буквой: ромб-лопасть сверху + тонкая ручка снизу, оба терракотового цвета `var(--color-accent)`. Элемент прижат вплотную к букве. Уникальный знак бренда — инструмент из ниши как диакритика. Использовать везде, где отображается название бренда.

---

## 4. Логотип

**Иконка:** SVG-арка (архитектурный пролёт + базовая линия). Два цвета — синий и терракота.

```html
<!-- Навбар (26×28) -->
<svg width="26" height="28" viewBox="0 0 26 28" fill="none">
  <path d="M1 22L1 11Q13 1 25 11L25 22" stroke="#1E3A5F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="13" y1="6" x2="13" y2="13" stroke="#1E3A5F" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="13" cy="16" r="2.5" fill="#1E3A5F"/>
  <line x1="1" y1="26" x2="25" y2="26" stroke="#C86A3A" stroke-width="2.5" stroke-linecap="round"/>
</svg>

<!-- Auth-страницы (34×38) -->
<svg width="34" height="38" viewBox="0 0 34 38" fill="none">
  <path d="M2 30L2 15Q17 2 32 15L32 30" stroke="#1E3A5F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="17" y1="9" x2="17" y2="18" stroke="#1E3A5F" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="17" cy="22" r="3.5" fill="#1E3A5F"/>
  <line x1="2" y1="35" x2="32" y2="35" stroke="#C86A3A" stroke-width="2.5" stroke-linecap="round"/>
</svg>
```

**Правила:**
- Никогда не заменять emoji (🏗️, 🏠, 🔨 и т.п.) в роли логотипа
- SVG всегда монохромный + акцент; только два цвета: `#1E3A5F` и `#C86A3A`
- Логотип должен работать на белом фоне (`--color-surface`) и на пергаментном (`--color-bg`)

---

## 5. Переменные геометрии

```css
--radius-card:  16px;   /* карточки, модалки */
--radius-btn:   12px;   /* кнопки */
--radius-input: 10px;   /* поля ввода */

--shadow-card:  0 2px 16px rgba(0,0,0,.07);
--shadow-hover: 0 6px 28px rgba(0,0,0,.12);
```

---

## 6. Кнопки

### `.btn-primary` — основное действие
```css
background: var(--color-primary);   /* #1E3A5F */
color: #fff;
border-radius: var(--radius-btn);
font-size: 15px; font-weight: 600;
hover: background #16304F; box-shadow: 0 4px 14px rgba(30,58,95,.30);
```

### `.btn-accent` — призыв к действию с теплотой
```css
background: var(--color-accent);    /* #C86A3A */
color: #fff;
hover: background #b05c30; box-shadow: 0 4px 14px rgba(200,106,58,.35);
```

### `.btn-secondary` — вторичное действие
```css
background: none;
border: 1.5px solid var(--color-border);
color: var(--color-text);
hover: border-color var(--color-primary); color var(--color-primary);
```

### `.btn-sm`
```css
padding: 7px 16px; font-size: 13px; border-radius: 9px;
```

---

## 7. Карточки

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 20px;
  transition: box-shadow .15s;
  &:hover { box-shadow: var(--shadow-hover); }
}
```

---

## 8. Поля ввода

```css
.form-input {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: 14px;
  &:focus { border-color: var(--color-primary); }
  &.ng-invalid.ng-touched { border-color: var(--color-error); }
}
```

Метки полей: 13.5px / 500. Ошибки: `var(--color-error)` / 12px.

---

## 9. Бейджи статусов

```css
.status-new             { background: #EDF5FF; color: #1565C0; }
.status-master_selected { background: #FFF3E0; color: #E65100; }
.status-completed       { background: #E8F5E9; color: #2E7D32; }
```

Бейдж непрочитанных сообщений: `background #E53935`, `color #fff` — красный фиксированный.
Бейдж новых откликов: `background #F57C00`, `color #fff` — оранжевый фиксированный.

---

## 10. Роли пользователей

Выбор роли в регистрации — SVG-иконки с `color: var(--color-accent)`, не emoji.
Бейдж с ролью (`.role-badge`, `.role-badge-sm`): фон `var(--color-accent-light)`, граница `#E8C9B5`, текст `var(--color-accent)`.
Текст ролей: «Клиент» / «Мастер» — без emoji.

---

## 11. Навбар

- Высота: 64px, фон `--color-surface`, нижняя граница `--color-border`
- Логотип: SVG-арка + «Мастеро» 20px / 700
- Ссылки: 14px / 500; hover → `--color-text` + `--color-bg` фон
- Активная ссылка: `color: var(--color-primary)`
- Кнопка выхода: вторичная, hover → `border-color --color-primary`

---

## 12. Страницы

### Лендинг `/`
- Hero с большим заголовком (48px mobile: 34px) и двумя CTA
- Секция «Как это работает» (3 шага с нумерованными карточками)
- Сетка категорий работ (chips/pill)
- CTA-секция внизу
- Авторизованные пользователи → автоматически перенаправляются на `/client/orders` или `/master/orders`

### Авторизация `/auth/login`, `/auth/register`
- Центрированная карточка max-width 420px
- Логотип (SVG 34×32) + название вверху карточки
- После регистрации → `/onboarding`

### Онбординг `/onboarding`
- 3 шага: Имя+телефон → Город/район → Готово
- Прогресс-бар из точек (done=зелёный, active=синий, pending=серый)
- Финальный экран разный для клиента и мастера
- Клиент → CTA «Создать первую заявку» (`/client/orders/new`)
- Мастер → CTA «Найти первый заказ» (`/master/orders`)

---

## 13. Правила для AI при генерации кода

1. **Цвета** — только через CSS-переменные из раздела 2. Никаких `#FF5A5F`, `#00A699`.
2. **Шрифт** — `'Golos Text'` уже подключён; не добавлять другие шрифты.
3. **Логотип** — только SVG-арка из раздела 4. Emoji в роли логотипа — запрещены.
4. **Иконки в UI** — SVG inline или lucide-style stroke icons. Не emoji в функциональных элементах.
5. **Кнопки** — использовать существующие классы (`.btn-primary`, `.btn-accent`, `.btn-secondary`, `.btn-sm`). Не создавать новые кнопочные классы.
6. **Новые страницы** — использовать `.main-content` как обёртку (padding + max-width 1100px).
7. **Auth-страницы** — использовать `.auth-page` + `.auth-card`.
8. **Радиусы и тени** — только через переменные (`--radius-card`, `--shadow-card` и т.д.).
9. **Hover-состояния** кнопок — тень цвета основного фона кнопки с opacity .30–.35.
10. **Responsive** — breakpoint 600px (мобильный), 800px (планшет).
