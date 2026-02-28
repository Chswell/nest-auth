## Backend API для системы управления графиками

Этот документ описывает **предлагаемый HTTP API** для реального backend’а, основанный на текущей фронтенд-логике (`services/*`, `hooks/*`, `types/*`).

- **Базовый URL**: `/api`
- **Формат данных**: JSON (`Content-Type: application/json`)
- **Авторизация**: `Authorization: Bearer <token>` (кроме `POST /auth/login`)

Типы ниже записаны в синтаксисе TypeScript, но это просто описание структуры JSON.

---

## 1. Auth

### 1.1. Вход

**POST** `/api/auth/login`

**Request body**

```ts
{
  "email": string;
  "password": string;
}
```

**Response 200**

```ts
{
  "token": string;        // JWT или другой access‑token
  "user": User;           // см. раздел "Базовые типы"
}
```

### 1.2. Текущий пользователь

**GET** `/api/auth/me`

**Headers**

- `Authorization: Bearer <token>`

**Response 200**

```ts
User | null
```

### 1.3. Выход

**POST** `/api/auth/logout`

Без тела запроса.

**Response 204**

```ts
// пусто
```

---

## 2. Базовые типы данных (используются в ответах/запросах)

```ts
type UserRole = "superadmin" | "admin" | "worker";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  telegram?: string;           // username без @
  storeId?: string;            // только для role === "worker"
  schedulePattern?: "2/2" | "5/2";
  scheduleStartDate?: string;  // YYYY-MM-DD
  shiftTemplate?: string;      // например "7" или "13-22"
  isNightWorker?: boolean;
}

type ScheduleStatus = "draft" | "pending_approval" | "approved" | "rejected";

interface ScheduleDay {
  date: string;  // YYYY-MM-DD
  value: string; // "7", "8-22", "", ...
}

interface EmployeeSchedule {
  employeeId: string;
  employeeName: string;
  month: string;           // YYYY-MM
  days: ScheduleDay[];
  status: ScheduleStatus;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  editedBy?: string;
  editedAt?: string;       // ISO‑8601
  rejectionReason?: string;
  isNightWorker?: boolean;
  telegram?: string;
}

type FlowerName = string;

interface InventoryItem {
  id: string;
  storeId: string;
  flowerName: FlowerName;
  pf: number;
  showcase: number;
  writeOff: number;
  bouquets: number;
}

type RouteSheetTimeSlotId = "8_11" | "11_14" | "14_17" | "17_20";

interface RouteSheetRow {
  id: string;
  slotId: RouteSheetTimeSlotId;
  newOrder: boolean;
  otherTime: boolean;
  otherTimeValue?: string;
  timeNote: boolean;
  timeNoteValue?: string;
  courier: string;
  orderNumber: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  details: string;
  paid: boolean;
  fromSite: boolean;
  amount: number | null;
  deliveryStepNotified: boolean;
  ready: boolean;
  delivered: boolean;
}

interface RouteSheet {
  id: string;
  storeId: string;
  storeName?: string;
  storeAddress?: string;
  date: string;        // YYYY-MM-DD
  createdAt: string;   // ISO‑8601
  rows: RouteSheetRow[];
}

type NotificationType =
  | "schedule_edit_by_admin"
  | "schedule_approval_request"
  | "schedule_approved"
  | "schedule_rejected"
  | "feed_post"
  | "shift_handover";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO‑8601
  read: boolean;
  recipientId?: string;
  meta?: {
    scheduleId?: string;
    employeeId?: string;
    postId?: string;
    handoverId?: string;
    storeId?: string;
  };
}

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string; // ISO‑8601
}
```

---

## 3. Магазины (Stores)

### 3.1. Список магазинов

**GET** `/api/stores`

**Response 200**

```ts
Store[]
```

### 3.2. Создать магазин

**POST** `/api/stores`

**Request body**

```ts
{
  "name": string;
  "address": string; // можно дублировать name, если адрес = название
}
```

**Response 201**

```ts
Store
```

---

## 4. Сотрудники (Employees / Users)

### 4.1. Список сотрудников

**GET** `/api/employees`

Опциональные query‑параметры:

- `role?: "worker" | "admin" | "superadmin"`
- `storeId?: string` — для фильтрации работников по точке.

**Response 200**

```ts
User[]
```

### 4.2. Получить одного сотрудника

**GET** `/api/employees/:id`

**Response 200**

```ts
User
```

### 4.3. Массовое создание сотрудников

Соответствует фронтовому `CreateEmployeesPayload`.

**POST** `/api/employees/bulk`

**Request body**

```ts
{
  "employees": {
    "name": string;
    "login": string;       // будет использован как email
    "password": string;
    "telegram"?: string;
  }[];
  "storeId"?: string;         // существующий магазин
  "newStoreName"?: string;    // если нужно создать новый магазин
  "schedulePattern"?: "2/2" | "5/2";
  "startDate"?: string;       // YYYY-MM-DD
  "shiftTemplate"?: string;   // например "7" или "13-22"
  "isNightWorker"?: boolean;
}
```

**Response 201**

```ts
User[]   // созданные сотрудники (role === "worker")
```

### 4.4. Обновление сотрудника

**PATCH** `/api/employees/:id`

**Request body**

```ts
{
  "email"?: string;
  "name"?: string;
}
```

**Response 200**

```ts
User
```

### 4.5. Удаление сотрудника

**DELETE** `/api/employees/:id`

**Response 204**

```ts
// пусто
```

---

## 5. Графики (Schedules)

### 5.1. Графики всех сотрудников за месяц

**GET** `/api/schedules`

Query‑параметры:

- `month` (обязательный): `YYYY-MM`

**Response 200**

```ts
EmployeeSchedule[]
```

### 5.2. График конкретного сотрудника за месяц

**GET** `/api/schedules/:employeeId`

Query‑параметры:

- `month` (обязательный): `YYYY-MM`

**Response 200**

```ts
EmployeeSchedule | null
```

### 5.3. Обновление графика

Соответствует `schedulesService.updateSchedule`.

**PUT** `/api/schedules/:employeeId/:month`

`month` в path в формате `YYYY-MM`.

**Request body**

```ts
{
  "days": ScheduleDay[];
}
```

Пользователь (`editedBy`) и его роль берётся с backend’a из токена.

**Response 200**

```ts
EmployeeSchedule
```

### 5.4. Запросы на согласование графика

**GET** `/api/schedule-approval-requests`

**Response 200**

```ts
{
  "id": string;
  "employeeId": string;
  "employeeName": string;
  "month": string; // YYYY-MM
  "status": "pending" | "approved" | "rejected";
  "requestedAt": string;      // ISO‑8601
  "rejectionReason"?: string;
}[]
```

### 5.5. Согласовать график

**POST** `/api/schedule-approval-requests/:id/approve`

Без тела запроса.

**Response 200**

```ts
ScheduleApprovalRequest | null
```

### 5.6. Отклонить график

**POST** `/api/schedule-approval-requests/:id/reject`

**Request body**

```ts
{
  "reason"?: string;
}
```

**Response 200**

```ts
ScheduleApprovalRequest | null
```

---

## 6. Инвентаризация (Inventory)

В коде используются типы `InventorySummary` и `InventoryFull`:

```ts
type InventorySummary = {
  id: string;
  storeId: string;
  createdAt: string; // ISO‑8601
};

type InventoryFull = InventorySummary & {
  rows: InventoryItem[];
};
```

### 6.1. Список названий цветов

**GET** `/api/inventory/flower-names`

**Response 200**

```ts
FlowerName[]   // string[]
```

### 6.2. Список инвентаризаций по магазину

**GET** `/api/inventory`

Query‑параметры:

- `storeId` (обязательный): `string`

**Response 200**

```ts
InventorySummary[]
```

### 6.3. Список всех инвентаризаций (для админа)

**GET** `/api/inventory/all`

**Response 200**

```ts
InventorySummary[]
```

### 6.4. Детали одной инвентаризации

**GET** `/api/inventory/:inventoryId`

**Response 200**

```ts
InventoryFull | null
```

### 6.5. Создать пустую инвентаризацию

**POST** `/api/inventory`

**Request body**

```ts
{
  "storeId": string;
}
```

**Response 201**

```ts
InventoryFull   // с пустым массивом rows
```

### 6.6. Сохранить строки инвентаризации

**PUT** `/api/inventory/:inventoryId`

**Request body**

```ts
{
  "storeId": string;
  "rows": {
    "id"?: string;        // если есть — обновление, если нет — новая строка
    "flowerName": string;
    "pf": number;
    "showcase": number;
    "writeOff": number;
    "bouquets": number;
  }[];
}
```

**Response 200**

```ts
InventoryFull
```

### 6.7. Удалить инвентаризацию

**DELETE** `/api/inventory/:inventoryId`

**Response 200**

```ts
InventorySummary | null
```

---

## 7. Ушедшие клиенты (Gone customers)

Типы из `gone.service`:

```ts
type GoneGender = "male" | "female" | "unknown";

type GoneReasonId = "price" | "tour" | "nonbuyer" | "notfound" | "other";

interface GoneSubRow {
  id: string;
  time: string;           // HH:MM
  floristId?: string;
  gender: GoneGender;
  compliment: boolean;
  reason: GoneReasonId | null;
  comment?: string;
  returned: boolean;
}

interface GoneDayRow {
  date: string;           // YYYY-MM-DD
  items: GoneSubRow[];
}

interface GoneMonthlyList {
  id: string;
  storeId: string;
  month: string;          // YYYY-MM
  createdAt: string;      // ISO‑8601
  days: GoneDayRow[];
}
```

### 7.1. Получить (и при необходимости создать) месячный список

**GET** `/api/gone/monthly`

Query‑параметры:

- `storeId` (обязательный): `string`
- `month` (обязательный): `YYYY-MM`

**Response 200**

```ts
GoneMonthlyList
```

### 7.2. Сохранить месячный список

**PUT** `/api/gone/monthly`

**Request body**

```ts
{
  "storeId": string;
  "month": string;       // YYYY-MM
  "days": GoneDayRow[];  // полностью перезаписывает данные за месяц
}
```

**Response 200**

```ts
GoneMonthlyList
```

### 7.3. Список работников магазина (для выбора флориста)

**GET** `/api/stores/:storeId/workers`

**Response 200**

```ts
User[]   // только сотрудники с role === "worker" для этой точки
```

---

## 8. Передача смены (Shift handover)

Типы:

```ts
interface ShiftHandoverItem {
  id: string;
  text: string;
  done: boolean;
  comment?: string;
}

interface ShiftHandover {
  id: string;
  storeId: string;
  storeName?: string;
  storeAddress?: string;
  date: string;         // YYYY-MM-DD
  createdBy: string;    // id пользователя
  createdAt: string;    // ISO‑8601
  assignedTo?: string;  // id сотрудника
  assignedToName?: string;
  items: ShiftHandoverItem[];
}
```

### 8.1. Список передач смен на дату

**GET** `/api/shift-handovers`

Query‑параметры:

- `date` (обязательный): `YYYY-MM-DD`
- `storeId?`: `string` — опционально, можно использовать для выборки по конкретной точке.

Backend по роли пользователя может:

- для admin/superadmin игнорировать `storeId` и возвращать все магазины;
- для worker — либо требовать `storeId`, либо сам брать точку пользователя.

**Response 200**

```ts
ShiftHandover[]
```

### 8.2. Создать передачу смены (админ)

**POST** `/api/shift-handovers`

**Request body**

```ts
{
  "storeId": string;
  "date": string;               // YYYY-MM-DD
  "items": { "text": string }[]; // пункты TODO, флажки done/комментарии по умолчанию false/undefined
}
```

`createdBy` и `createdByName` берутся из токена пользователя.

**Response 201**

```ts
ShiftHandover
```

### 8.3. Взять передачу на себя

**POST** `/api/shift-handovers/:id/assign`

**Request body**

```ts
{
  "userId": string;
  "userName": string;
}
```

(backend может игнорировать эти поля и брать текущего пользователя из токена)

**Response 200**

```ts
ShiftHandover | null
```

### 8.4. Обновить пункты передачи смены

**PUT** `/api/shift-handovers/:id/items`

**Request body**

```ts
{
  "items": ShiftHandoverItem[];
}
```

**Response 200**

```ts
ShiftHandover | null
```

---

## 9. Маршрутные листы (Route sheets)

### 9.1. Список маршрутных листов на дату

**GET** `/api/routesheets`

Query‑параметры:

- `date` (обязательный): `YYYY-MM-DD`

**Response 200**

```ts
{
  id: string;
  storeId: string;
  storeName?: string;
  storeAddress?: string;
  date: string;       // YYYY-MM-DD
  createdAt: string;  // ISO‑8601
}[]
```

### 9.2. Получить один маршрутный лист

**GET** `/api/routesheets/:id`

**Response 200**

```ts
RouteSheet | null
```

### 9.3. Создать маршрутный лист

**POST** `/api/routesheets`

**Request body**

```ts
{
  "storeId": string;
  "date": string; // YYYY-MM-DD
}
```

Если лист на эту дату/точку уже существует, backend может вернуть существующий.

**Response 201**

```ts
RouteSheet
```

### 9.4. Сохранить строки маршрутного листа

**PUT** `/api/routesheets/:id`

**Request body**

```ts
{
  "rows": RouteSheetRow[];
}
```

Backend должен присваивать `id` для строк, у которых он отсутствует.

**Response 200**

```ts
RouteSheet
```

---

## 10. Лента (Feed)

### 10.1. Получить посты ленты

**GET** `/api/feed/posts`

**Response 200**

```ts
FeedPost[]
```

### 10.2. Создать пост

**POST** `/api/feed/posts`

**Request body**

```ts
{
  "title": string;
  "content": string;
}
```

Автор берётся из текущего пользователя по токену.

**Response 201**

```ts
FeedPost
```

### 10.3. Удалить пост

**DELETE** `/api/feed/posts/:id`

**Response 204**

```ts
// пусто
```

---

## 11. Уведомления (Notifications)

### 11.1. Список уведомлений текущего пользователя

**GET** `/api/notifications`

**Response 200**

```ts
Notification[]
```

### 11.2. Отметить одно уведомление прочитанным

**POST** `/api/notifications/:id/read`

**Response 204**

```ts
// пусто
```

### 11.3. Отметить все уведомления прочитанными

**POST** `/api/notifications/read-all`

**Response 204**

```ts
// пусто
```

---

## 12. Дашборд (Dashboard)

### 12.1. Кто сегодня работает

Соответствует `dashboardService.getWorkersForDate`.

**GET** `/api/dashboard/workers`

Query‑параметры:

- `date` (обязательный): `YYYY-MM-DD`

**Response 200**

```ts
{
  storeId: string;
  storeName?: string;
  storeAddress?: string;
  workers: {
    id: string;
    name: string;
    telegram?: string;
  }[];
}[]
```

### 12.2. Статистика по ушедшим клиентам по причинам

Соответствует `dashboardService.getGoneStatsForDate`.

**GET** `/api/dashboard/gone-stats`

Query‑параметры:

- `date` (обязательный): `YYYY-MM-DD`

**Response 200**

```ts
{
  storeId: string;
  storeName?: string;
  storeAddress?: string;
  total: number;
  byReason: Record<
    "price" | "tour" | "nonbuyer" | "notfound" | "other",
    number
  >;
}[]
```

---

## 13. Замечания по реализации

- **Права доступа**:
  - Работник (`worker`) видит только свои данные и данные своей точки.
  - Админ/суперадмин (`admin`/`superadmin`) видят все магазины/сотрудников и могут выполнять административные действия (создание графиков, сотрудников, передач смен и т.д.).
- **Время/даты**:
  - Все даты в теле — в формате `YYYY-MM-DD` / `YYYY-MM`.
  - `createdAt`, `editedAt` и т.п. — строки в формате ISO‑8601 (`new Date().toISOString()`).
- **Ошибки**:
  - Рекомендуется использовать стандартные HTTP‑коды (400/401/403/404/409/500) и тело вида:

```ts
{
  "error": string;        // машинно‑читаемый код
  "message": string;      // человекочитаемое описание
  "details"?: unknown;    // опционально
}
```

