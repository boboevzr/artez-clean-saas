# Claude Code Instructions

## Project Overview (ARTEZ — химчистка, Узбекистан)
Языки интерфейса: RU + UZ (всё делать на двух языках).

Структура (общий репозиторий, git-сабмодули):
- `artez_api/` — backend: FastAPI + asyncpg (PostgreSQL). `main.py` (~5400 строк, ~208 эндпоинтов), `database.py` (~3200 строк). Railway: `artez-api`.
- `artez_bot/artez_bot/` — Telegram-бот: aiogram (`bot.py` ~2420 строк). Railway: `ARTEZ-BOT`.
- Фронтенд (статика, деплой через GitHub Actions `deploy-frontend.yml`): `index.html` (лендинг), `admin.html` (админка), `staff.html` (кабинет сотрудника/CRM), `agent.html`, плюс `terms/privacy/partner-rules/location_picker.html`. PWA: `sw.js`, `staff-manifest.json`, web-push (`pywebpush`).

## Database (PostgreSQL, ~32 таблицы)
- Пользователи/персонал: `users`, `staff`, `staff_personal`
- CRM: `leads`, `lead_calls`, `lead_reminders`, `crm_clients`, `contacts`, `site_contacts`
- Заказы: `orders`, `order_items`, `order_payments`, `order_photos`, `order_item_media`, `order_activity`
- Прайс/каталог: `prices`, `units`, `plans`
- Логистика: `routes`, `route_orders`
- Касса: `cash_shifts`, `cash_handovers`
- Чат/уведомления: `chat_sessions`, `chat_messages`, `chat_templates`, `agent_notifications`, `washer_notifications`, `push_subscriptions`
- Telegram/SMS: `sms_codes`, `tg_phone_links`, `tg_status_messages`
- Системные: `settings`, `config`

## Response Style (Экономия лимита)
- Be extremely concise. Avoid greetings, pleasantries, or polite concluding remarks.
- Do NOT rewrite or mirror unchanged code blocks. Output only the modified lines or the exact fix.
- Do NOT explain the theory, logic, or code steps unless explicitly requested by the user.
- Never implement features or styles outside the explicit specification (avoid scope creep).

## Telegram Architecture (ВАЖНО — не повторять ошибку)

### Webhook схема
Telegram зарегистрирован ОДИН webhook → **artez_bot** (aiogram, Railway: `ARTEZ-BOT`).
`artez_api` имеет свои `/api/tg/webhook` и `/api/telegram/webhook` эндпоинты, но Telegram их НЕ вызывает напрямую.

### Правило: где писать обработчики callback-кнопок
**Все** inline-кнопки Telegram (callback_query) обрабатываются в `artez_bot/artez_bot/bot.py` через `@dp.callback_query(...)`.

| Тип кнопки | Где обработчик |
|---|---|
| `take_lead_*` — взять лид | `bot.py` |
| `accept_*`, `reject_*` — заказ из группы | `bot.py` |
| `rp:{id}:take/undo/deliver` — маршрут водителя | `bot.py` |
| Любые будущие inline-кнопки | `bot.py` |

`artez_api` может **отправлять** сообщения с кнопками через `BOT_TOKEN` напрямую (HTTP к api.telegram.org), но **обрабатывать** нажатия не может — callback идёт в бот.

### База данных бота
`artez_bot/artez_bot/database.py` — отдельный пул подключений к той же PostgreSQL.
При добавлении новых функций работы с заказами/лидами из бота — добавлять функции сюда, а не делать HTTP-запросы к artez_api.

### Группы Telegram
- Группа водителей `ARTEZ — Доставка`: ID менялся с `-5434866533` → `-1004327266702` (группа стала супергруппой). Если ID изменится снова — обновить в Настройки → Telegram → Группа водителей.

## Яндекс Карты в staff.html (ВАЖНО)

### API-ключ
Берётся из `/api/settings/site` → поле `yandex_maps_key` (публичный эндпоинт).
Загрузчик `_loadYmaps(cb)` сам делает этот запрос перед первой инициализацией. Хардкод `270b3869...` — только фолбек.

### Где используется (только staff.html, в admin.html карты пока не трогать)
| Форма | Функция кнопки | Переменные карты |
|---|---|---|
| Новая заявка / Редакт. заявка (modalOrder) | `pickLocation()` | `_locYmap`, `_locYmarker` |
| Новый лид / Редакт. лид (modalLead) | `ldPickLocation()` | `_ldLocYmap`, `_ldLocYmarker` |
| Редакт. заявка (staffOrderEditOverlay) | `staffPickLocation()` | `_soeYmap`, `_soeYmarker` |

### Поведение карты при клике «📍 Указать»
1. Если координаты уже сохранены → карта открывается на них.
2. Если координат нет → карта сразу открывается на городе **филиала сотрудника** (`currentStaff.branch`, читается из `or_branch` / `ld_branch` / `soe_branch`), через 600 мс плавный `panTo` к геолокации пользователя.

### Филиалы (центры городов)
```js
_STAFF_BRANCH_CENTERS = { zarafshan: [41.5714, 64.1953], navoi: [40.1032, 65.3791] }
```

### Полноэкранный режим
Кнопка «⛶ Во весь экран» → `position:fixed; inset:0; z-index:10000`.
В полноэкранном режиме появляются кнопки **✅ Готово** и **✕ Закрыть** (оба закрывают fullscreen).
Сброс fullscreen-состояния — в `clearOrderForm()` и `_resetLeadModal()` и `staffCloseOrderEdit()`.

### Сброс карты при закрытии модалки
`clearOrderForm()` → `_locYmap.destroy()`, сброс inline-стилей `locMapWrap/locMapInner`.
`_resetLeadModal()` → `_ldLocYmap.destroy()`, сброс `ldLocMapWrap/ldLocMapInner`.
`staffCloseOrderEdit()` → `_soeYmap.destroy()`, сброс `soeLocMapWrap/soeLocMapInner`.

## Автопоиск клиентов по телефону (staff.html)

Функция `acInput(el, dropId, prefix)` — поиск по `/api/contacts/search?q=...` при вводе ≥2 символов.

### Правила
- Автопоиск работает **только в поле Телефон** (лиды: `ld_phone→ac_ld`, заявки: `or_phone→ac_or`).
- Поле **Имя** (`ld_name`, `or_name`) — без `oninput`, автопоиска нет.
- Для роли **`agent`** автопоиск отключён полностью (`if (currentStaff?.role === 'agent') return;` в начале `acInput`).
- Дропдаун `ac_or` расположен внутри ac-wrap поля `or_phone` (не `or_name`).
- Форма нового клиента (`nc_phone`, `nc_name`) — своя отдельная логика, не менять под эти правила.

## Права доступа к позициям заказа и замерам (staff.html)

### Кнопки в карточке позиции (`_reRenderItems`)
| Статус заказа | Admin | Менеджер (не washer) | Мойщик |
|---|---|---|---|
| До мойки / Мойка | ✏️ 🗑️ | ✏️ 🗑️ (если `can_edit_items`) | 📐 (своя позиция) |
| После мойки (упаковка→доставка) | ✏️ 🗑️ | 👁 просмотр | — |
| Доставлен / Отменён | 👁 просмотр | 👁 просмотр | — |

### Логика `_editLockedByStatus`
- **Admin**: блокировка только при `delivered` / `cancelled`
- **Остальные**: блокировка с `packing` и далее

### Кнопки «Добавить позицию» и «Создать пустые»
- **Admin**: скрываются только при `delivered` / `cancelled`
- **Остальные**: скрываются начиная с `drying`

### Модал замера `staffOpenMeasure` — `_smCanEdit`
- **Admin**: редактирование до `delivered`/`cancelled`; кнопка «💾 Сохранить»
- **Мойщик** (`can_measure`): редактирование только своих позиций, статус `washing`, `measure_status = pending/rejected`; кнопка «📤 Сдать на проверку»
- **Менеджер** (`can_approve_measure`): просмотр + кнопки «Утвердить/Отклонить» при `submitted`
- **Остальные**: только просмотр

### ✏️ vs `staffOpenMeasure` vs `staffOpenItemForm`
- Admin и washing-фаза → `staffOpenMeasure`
- Остальные фазы, не-admin → `staffOpenItemForm`
- 👁 кнопка (locked) → `staffOpenMeasure` в read-only

## Deployment & Automation (Автоматизация деплоя)
- Ask for commit/push confirmation only once per session (at the first commit). After the user confirms once, commit and push freely for the rest of the session without asking again.
- Use standard branch: `main`.
- Infrastructure architecture context:
  - Repository: `https://github.com`
  - GitHub Actions handle automated CI/CD builds.
  - Production Bot: `ARTEZ-BOT` on Railway (triggered automatically via GitHub integration).
  - Production Site/API: `artez-api` on Railway (triggered automatically via GitHub integration).
- Never run manual deployment scripts if GitHub Push can trigger the Railway build.
