# NexBill Backend — API Documentation

**Audience:** Frontend engineers integrating against the NexBill backend.
**Base URL (local):** `http://localhost:4000`
**Framework:** NestJS 11 + Prisma 6 (PostgreSQL)
**Auth:** JWT Bearer tokens
**Last generated:** 2026-09-06 (from source at commit `a8d8cb0`)

> This document was generated directly from the backend source code (controllers, services, DTOs, Prisma schema) — every request/response shape, validation rule, and error condition listed here reflects the actual implementation, not a spec. If backend code changes, regenerate or update this doc.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Getting Started](#2-getting-started)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Global Conventions](#4-global-conventions)
5. [Error Handling](#5-error-handling)
6. [Data Models (Prisma Schema)](#6-data-models-prisma-schema)
7. [API Reference](#7-api-reference)
   - [7.1 Auth](#71-auth)
   - [7.2 Users](#72-users)
   - [7.3 Business Profile](#73-business-profile)
   - [7.4 Settings](#74-settings)
   - [7.5 Products](#75-products)
   - [7.6 Customers](#76-customers)
   - [7.7 Expenses](#77-expenses)
   - [7.8 Invoices](#78-invoices)
   - [7.9 Reports](#79-reports)
   - [7.10 Exports](#710-exports)
   - [7.11 Dashboard](#711-dashboard)
   - [7.12 Backups](#712-backups)
   - [7.13 System](#713-system)
   - [7.14 Health / Root](#714-health--root)
8. [Complete Role Permission Matrix](#8-complete-role-permission-matrix)
9. [File Download Endpoints Cheat Sheet](#9-file-download-endpoints-cheat-sheet)
10. [Known Gotchas & Implementation Notes](#10-known-gotchas--implementation-notes)
11. [Frontend Integration Guide](#11-frontend-integration-guide)

---

## 1. Overview & Architecture

NexBill is a **multi-tenant** billing/invoicing SaaS backend. Every organization (tenant) has its own users, products, customers, invoices, expenses, and settings. Data is isolated per-organization at the database query level — there is no way for one organization's token to read or write another organization's data.

**Modules → Route prefixes:**

| Module | Route prefix | Purpose |
|---|---|---|
| Auth | `/auth` | Login, org registration, current-user identity |
| Users | `/users` | Team member management within an org |
| Business | `/business` | Business profile, logo, invoice tax preview |
| Settings | `/settings` | Tax config, invoice numbering config, regional settings |
| Products | `/products` | Product/inventory catalog, stock adjustments |
| Customers | `/customers` | Customer directory |
| Expenses | `/expenses` | Expense tracking |
| Invoices | `/invoices` | Invoice creation, listing, PDF generation |
| Reports | `/reports` | Analytics, GST summary, CSV/XLSX/PDF exports |
| Exports | `/exports` | Admin-only bulk data exports |
| Dashboard | `/dashboard` | KPI widgets for the home dashboard |
| Backups | `/backups` | Database backup/restore (pg_dump/pg_restore) |
| System | `/system` | Server health metrics, DB maintenance |
| Root | `/` | Liveness check (no auth) |

There is **no global route prefix** (e.g. no `/api/v1`) and **no API versioning** — paths in this document are exact.

---

## 2. Getting Started

**Local server:** `http://localhost:4000` (port is hardcoded in `main.ts`, not read from `PORT` env at bootstrap).

**CORS:** Restricted to `origin: 'http://localhost:3000'` with `credentials: true`. If the frontend runs on a different origin/port, the backend's CORS config must be updated — requests from any other origin will be blocked by the browser.

**Content type:** All request/response bodies are `application/json` **except**:
- File uploads (`POST /business/logo`) — `multipart/form-data`.
- File downloads (invoice PDFs, reports, backups) — binary/streamed responses (see [§9](#9-file-download-endpoints-cheat-sheet)).

**Static assets:** Anything under `/uploads/**` (e.g. uploaded logos) is served **publicly, without authentication** — `GET http://localhost:4000/uploads/logos/<file>` works with no `Authorization` header. Do not put anything sensitive there.

**Typical integration flow:**
1. `POST /auth/register-org` (one-time, to create a tenant + its first ADMIN) **or** get invited via `POST /users` by an existing ADMIN/MANAGER.
2. `POST /auth/login` → receive `access_token`.
3. Store the token (e.g. memory + httpOnly-safe storage strategy of your choice) and attach `Authorization: Bearer <token>` to every subsequent request.
4. `GET /auth/me` to hydrate the logged-in user's profile/role on app load.
5. Build UI conditionally on `role` (ADMIN / MANAGER / CASHIER) per the [role matrix](#8-complete-role-permission-matrix) — the backend also enforces this server-side, but hiding unavailable actions client-side avoids confusing 403s.

---

## 3. Authentication & Authorization

### 3.1 Mechanism

- **Scheme:** JWT Bearer token, issued by `POST /auth/login`.
- **Header:** `Authorization: Bearer <access_token>` on every protected request.
- **Token lifetime:** `expiresIn: 60 * 60 * 24` seconds → **24 hours** (`JwtModule.register` in `auth.module.ts`). There is **no refresh token** — when a token expires, the user must log in again.
- **Token payload (signed, not encrypted — do not put secrets in it):**
  ```json
  { "sub": "<userId>", "role": "ADMIN|MANAGER|CASHIER", "organizationId": "<orgId>", "iat": ..., "exp": ... }
  ```
- **On every request**, `JwtStrategy.validate()` re-fetches the user from the database by `(id, organizationId)` — it does **not** trust the role embedded in the token payload for authorization beyond identifying the user. It also checks `user.isActive` and throws `401 Unauthorized ("Account is deactivated")` if the account was deactivated after the token was issued. This means deactivating a user takes effect **immediately**, even on their still-valid token — good for security, but means the frontend must handle a 401 mid-session gracefully (redirect to login).
- **Injected user object** (`@CurrentUser()` in every controller): `{ id, role, organizationId }` — this is the source of truth for all authorization/scoping decisions, always derived from the live DB record, never from client input.

### 3.2 Roles

Three roles, defined by the `Role` enum: **`ADMIN`**, **`MANAGER`**, **`CASHIER`**. There is no concept of custom/multiple roles per user — one role per user.

General intent (see [§8](#8-complete-role-permission-matrix) for the exact per-endpoint matrix):
- **ADMIN** — full control: user management, all settings, backups, system maintenance, all reports/exports, business profile.
- **MANAGER** — day-to-day operations: products, customers, expenses, invoices, most settings/reports, but not backups/system/user-role-changes/user-deactivation.
- **CASHIER** — point-of-sale duties: create invoices, view/download invoice PDFs, browse products/customers; blocked from settings, reports, expenses, backups, system, most user management.

### 3.3 Authorization enforcement layers

1. **`JwtAuthGuard`** — requires a valid, non-expired JWT for an active user. Missing/invalid/expired token → `401 Unauthorized`.
2. **`RolesGuard` + `@Roles('ADMIN', ...)`** — only applied where explicitly decorated. If a route has no `@Roles(...)`, **any authenticated role** can call it. Role not in the allowed list → `403 Forbidden`.
3. **Service-layer checks** — a few endpoints (notably in Users) have finer-grained business rules enforced in the service itself rather than via `@Roles` (e.g. "managers can only create cashiers", "you cannot deactivate yourself"). These throw `403 Forbidden` or `400 Bad Request` with specific messages — see the [Users API](#72-users) section.
4. **Multi-tenant scoping** — every query implicitly filters by `organizationId` from the JWT-derived user. Referencing another org's resource ID returns `404 Not Found`, never `403` (the record is invisible, not merely forbidden).

### 3.4 Registering a new organization (tenant onboarding)

`POST /auth/register-org` creates a brand-new `Organization` **and** its first `ADMIN` user in a single transaction. This is the entry point for a new customer signing up — there is no separate "create organization" step for existing users, and no self-service invite-by-email flow (users are added by an ADMIN/MANAGER via `POST /users` once the org exists).

---

## 4. Global Conventions

### 4.1 Validation

Every request body/query is passed through a global `ValidationPipe({ whitelist: true, transform: true })`:
- **`whitelist: true`** — any field not declared on the DTO is **silently stripped** before it reaches the handler (not an error). Don't rely on extra fields being ignored gracefully by the server logic — they simply never arrive.
- **`transform: true`** — query string values are coerced to the DTO's declared types (e.g. `"2"` → `2` for a `@Type(() => Number)` field). Path params (`@Param()`) are **not** auto-transformed unless explicitly typed.
- Validation failures return `400 Bad Request` with an array of human-readable messages (see [§5](#5-error-handling)).

### 4.2 Pagination

Several list endpoints (Products, Invoices, Backups) share a common pagination contract:

**Query params (`PaginationQueryDto`):**
| Param | Type | Default | Rule |
|---|---|---|---|
| `page` | number | `1` | integer, `>= 1` |
| `pageSize` | number | `20` | integer, `>= 1` |

**Response shape (`PaginatedResult<T>`):**
```json
{
  "data": [ /* array of T */ ],
  "total": 137,
  "page": 1,
  "pageSize": 20
}
```
`total` is the full matching count, independent of the current page — use it to compute total pages (`Math.ceil(total / pageSize)`).

> Not every list endpoint is paginated — Customers, Expenses, and Dashboard's recent-transactions/top-products use plain arrays with their own limit semantics. Check each endpoint below.

### 4.3 Date range filtering

Several report/analytics endpoints share `DateRangeQueryDto`:

| Param | Type | Rule |
|---|---|---|
| `from` | string | optional, ISO-8601 (`@IsISO8601`) |
| `to` | string | optional, ISO-8601 (`@IsISO8601`) |

Both are optional and independent — omit both for "all time", or supply one/both to bound the range. They typically filter on `createdAt` (invoices) or `incurredAt` (expenses).

Trend-bucketed endpoints (Dashboard, Reports) instead use `TrendRangeQueryDto`:

| Param | Type | Default | Allowed values |
|---|---|---|---|
| `range` | string | `"daily"` | `"daily"` \| `"weekly"` \| `"monthly"` |

Window sizes: `daily` = last 14 days, `weekly` = last 8 weeks (Monday-anchored), `monthly` = last 12 calendar months — all ending "now", including zero-value buckets.

### 4.4 Numeric/Decimal serialization — **important**

Prisma `Decimal` fields (money, rates, percentages — e.g. `price`, `cost`, `subtotal`, `total`, `taxAmount`, `gstRate`, `discountPercent`) serialize over JSON as **strings**, not native numbers, in most raw-Prisma-object responses (e.g. `"499.00"`). Some service methods explicitly `Number(...)`-cast Decimals before returning (e.g. Dashboard, Invoice Preview) — those come back as real JSON numbers.

**Frontend rule of thumb:** always wrap money/rate fields from the API in `Number(value)` before doing arithmetic or formatting, regardless of whether the field currently looks like a number or a string in a given response — this keeps your code correct even if the backend's serialization behavior shifts.

`Backup.sizeBytes` is a Prisma `BigInt` and will similarly serialize as a string.

### 4.5 What "no `@Roles`" means

Throughout this document, an endpoint listed as **"Any authenticated role"** has `JwtAuthGuard` applied but no `RolesGuard`/`@Roles` — meaning ADMIN, MANAGER, and CASHIER can all call it (still requires a valid token).

---

## 5. Error Handling

The backend uses Nest's **default** exception filter (no custom global filter is registered) — every thrown `HttpException` produces this shape:

```json
{
  "statusCode": 400,
  "message": "Human readable message, or an array of messages for validation errors",
  "error": "Bad Request"
}
```

**Common status codes you'll encounter:**

| Status | Meaning | Typical cause |
|---|---|---|
| `400 Bad Request` | Validation failure, or a business rule violation | Malformed body, insufficient stock, starting-number already locked, etc. |
| `401 Unauthorized` | Missing/invalid/expired JWT, or invalid login credentials, or account deactivated | No `Authorization` header, expired token, wrong password |
| `403 Forbidden` | Authenticated, but role/ownership rule blocks the action | CASHIER hitting an ADMIN-only route, self-deactivation attempt |
| `404 Not Found` | Resource doesn't exist **in the caller's organization** | Wrong ID, or ID belongs to another tenant |
| `409 Conflict` | Uniqueness constraint violated | Duplicate product SKU within the same org |
| `500 Internal Server Error` | Unhandled exception | e.g. `pg_restore`/`pg_dump` process failure, DB error during `VACUUM ANALYZE` |

**Validation error example** (`class-validator` messages, one per failed constraint):
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**Note on inconsistent semantics:** A few "not found" conditions in the Users module throw `BadRequestException` (400) instead of `NotFoundException` (404) — e.g. `PATCH /users/:id/role` with a non-existent `id` returns `400 "User not found in your organization"`, not 404. Don't assume 404 for every "not found" case; check the specific endpoint documentation below.

---

## 6. Data Models (Prisma Schema)

Simplified view of the core entities (see `prisma/schema.prisma` for the authoritative source). All models with an `organizationId` are tenant-scoped.

```
Organization (id, name, slug*, createdAt)
  └─ User (id, name, email, password[hash], role, isActive, sessionTimeoutMinutes, createdAt)
       ├─ NotificationPreference (1:1)
       └─ StockAdjustment[] (audit trail, 1:many as author)
  └─ Product (id, name, sku, category, price, cost, stock, minStock, gstRate, isActive, createdAt, updatedAt)
       ├─ InvoiceItem[]
       └─ StockAdjustment[] (audit trail)
  └─ Customer (id, name, phone?, email?, address?, createdAt)
       └─ Invoice[]
  └─ Invoice (id, invoiceNumber, subtotal, discountPercent, discountAmount, taxAmount, total, paymentMethod, createdAt, customerId?, cashierId)
       └─ InvoiceItem[] (id, productName, sku, category, unitPrice, unitCost, quantity, taxRate, taxAmount, lineTotal, productId, invoiceId)
  └─ Expense (id, category, amount, note?, incurredAt, createdAt)
  └─ InvoiceConfig (1:1) (prefix, nextNumber, footerNote?)
  └─ BusinessProfile (1:1) (name, gstin?, pan?, state?, stateCode?, address?, phone?, email?, logoUrl?)
  └─ TaxConfig (1:1) (gstEnabled, cgstEnabled, sgstEnabled, igstEnabled, defaultGstRate)
  └─ RegionalSettings (1:1) (language, currency, dateFormat)
  └─ Backup[] (id, type, status, sizeBytes?, filePath?, errorMessage?, createdAt, completedAt?)
  └─ BackupSchedule (1:1) (frequency, time, retentionCount)

Enums:
  Role           = ADMIN | MANAGER | CASHIER
  PaymentMethod  = CASH | UPI | CARD
  BackupType     = FULL | INCREMENTAL
  BackupStatus   = PENDING | RUNNING | COMPLETED | FAILED
```

`*` `Organization.slug` is globally unique and is the tenant identifier used at login (`organizationSlug` in the login request) — think of it as a "workspace URL slug".

---

## 7. API Reference

### 7.1 Auth

Base path: `/auth`. No class-level guard — each route opts in individually.

#### `POST /auth/login` — Log in
- **Auth:** None (public).
- **Body** (`LoginDto`):
  ```json
  { "email": "user@example.com", "password": "string", "organizationSlug": "acme-inc" }
  ```
  - `email`: required, `@IsEmail`
  - `password`: required, `@IsNotEmpty`
  - `organizationSlug`: required, `@IsNotEmpty` — the tenant's slug (not shown to the user unless you build a workspace picker; typically captured via subdomain or a login-page field)
- **Response 200:**
  ```json
  { "access_token": "eyJhbGciOi..." }
  ```
- **Errors:**
  - `403 Forbidden` — `"Your account has been deactivated"` (checked before the "user exists" check, so a deactivated user gets this message even with correct credentials).
  - `401 Unauthorized` — `"Invalid credentials"` (wrong email/org combo, or wrong password).

#### `GET /auth/me` — Get current user identity
- **Auth:** Bearer token required.
- **Response 200:**
  ```json
  {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@acme.com",
    "role": "ADMIN",
    "organization": { "id": "uuid", "name": "Acme Inc", "slug": "acme-inc" }
  }
  ```
- **Errors:** `401 Unauthorized` — `"User not found"` if the user record vanished after token issuance (edge case).
- **Use case:** call this on app boot / after login to hydrate global auth state (name, role, org display name) — do not decode the JWT payload on the frontend for display purposes, always hit this endpoint for fresh data.

#### `POST /auth/register-org` — Register a new organization + admin
- **Auth:** None (public).
- **Body** (`RegisterOrganizationDto`):
  ```json
  {
    "organizationName": "Acme Inc",
    "organizationSlug": "acme-inc",
    "adminName": "Jane Doe",
    "adminEmail": "jane@acme.com",
    "password": "secret123"
  }
  ```
  - `organizationName`: required, `@IsNotEmpty`
  - `organizationSlug`: required, `@IsNotEmpty` (no format/uniqueness validation at the DTO level — uniqueness enforced in the service)
  - `adminName`: required, `@IsNotEmpty`
  - `adminEmail`: required, `@IsEmail`
  - `password`: required, `@MinLength(6)`
- **Response 201:**
  ```json
  { "message": "Organization registered successfully", "organizationId": "uuid" }
  ```
  Note: this does **not** return an `access_token` — the frontend must redirect to the login page (or call `/auth/login` itself) after registration; the new admin is not auto-logged-in.
- **Errors:** `400 Bad Request` — `"Organization already exists"` if `organizationSlug` is already taken.
- **Side effects:** creates the `Organization` row and the first `User` (role `ADMIN`, password bcrypt-hashed) atomically in one DB transaction.

---

### 7.2 Users

Base path: `/users`. Class-level `@UseGuards(JwtAuthGuard)` — every route requires a valid token; some additionally require specific roles (noted per-endpoint; a couple are enforced in the service layer rather than via `@Roles`).

#### `POST /users` — Create a team member
- **Auth:** Bearer token. No `@Roles` guard on the route — **but the service enforces a permission matrix internally**:
  - `CASHIER` caller → `403 Forbidden` — `"You cannot create users"`.
  - `MANAGER` caller creating anything other than `role: "CASHIER"` → `403 Forbidden` — `"Managers can only create cashiers"`.
  - `ADMIN` caller → no restriction, can create any role.
- **Body** (`CreateUserDto`):
  ```json
  { "name": "John Cashier", "email": "john@acme.com", "password": "secret123", "role": "CASHIER" }
  ```
  - `name`: required, `@IsNotEmpty`
  - `email`: required, `@IsEmail`
  - `password`: required, `@MinLength(6)`
  - `role`: required, `@IsEnum(Role)` → `"ADMIN" | "MANAGER" | "CASHIER"`
- **Response 201:** the created user row —
  ```json
  {
    "id": "uuid", "name": "John Cashier", "email": "john@acme.com",
    "password": "<bcrypt hash>",
    "role": "CASHIER", "createdAt": "2026-09-06T...", "isActive": true,
    "sessionTimeoutMinutes": 30, "organizationId": "uuid"
  }
  ```
  ⚠️ **The bcrypt password hash is included in this response** (no field selection is applied on create). The frontend must not display or log this field. Treat it as a known backend quirk to work around, not a contract to rely on.
- **Errors:** `400 Bad Request` — `"User already exists in this organization"` if the email is already used within the same org (emails are unique **per-organization**, not globally — the same email can exist in two different orgs).
- New users are always created inside the **caller's own** organization (not client-specifiable).

#### `GET /users` — List team members
- **Auth:** Bearer token + Roles: **ADMIN, MANAGER**.
- **Response 200:** array, ordered by `createdAt desc`:
  ```json
  [ { "id": "uuid", "name": "Jane", "email": "jane@acme.com", "role": "ADMIN", "isActive": true } ]
  ```

#### `PATCH /users/:id/role` — Change a user's role
- **Auth:** Bearer token. No `@Roles` guard — enforced in service: **ADMIN only**.
- **Path param:** `id` — target user's UUID.
- **Body** (`UpdateUserRoleDto`): `{ "role": "ADMIN" | "MANAGER" | "CASHIER" }` (required, `@IsEnum(Role)`).
- **Response 200:** `{ "id", "name", "email", "role" }`.
- **Errors:**
  - `403 Forbidden` — `"Only ADMIN can edit user roles"`.
  - `400 Bad Request` — `"User not found in your organization"` (note: 400, not 404).
  - `403 Forbidden` — `"You cannot change your own role"` — an ADMIN cannot demote/change themself via this endpoint.

#### `PATCH /users/:id/deactivate` — Deactivate a user
- **Auth:** Bearer token. No `@Roles` guard — enforced in service: **ADMIN only**.
- **Path param:** `id` — target user's UUID.
- **Response 200:** `{ "id", "name", "email", "role", "isActive": false }`.
- **Errors:**
  - `403 Forbidden` — `"Only ADMIN can deactivate users"`.
  - `400 Bad Request` — `"User not found in your organization"`.
  - `403 Forbidden` — `"You cannot deactivate yourself"`.
- **Effect:** an active JWT for that user is rejected on its **very next request** (checked live in `JwtStrategy`), not just on next login.
- **Note:** there is no "reactivate" endpoint — deactivation is currently one-way via this API (would require direct DB access or a future endpoint to undo).

#### `GET /users/me/notification-preferences` — Get my notification settings
- **Auth:** Bearer token, any role.
- **Response 200** (auto-created with defaults on first access):
  ```json
  {
    "id": "uuid", "lowStockAlerts": true, "dailySalesSummary": true,
    "newTransactionAlerts": false, "systemUpdates": true, "userId": "uuid"
  }
  ```

#### `PUT /users/me/notification-preferences` — Update my notification settings
- **Auth:** Bearer token, any role.
- **Body** (`UpdateNotificationPreferencesDto`), all optional booleans — omit a field to leave it unchanged:
  ```json
  { "lowStockAlerts": true, "dailySalesSummary": false, "newTransactionAlerts": true, "systemUpdates": true }
  ```
- **Response 200:** same shape as the GET above, reflecting the update.

#### `PUT /users/me/security-settings` — Update my session timeout preference
- **Auth:** Bearer token, any role.
- **Body** (`UpdateSecuritySettingsDto`): `{ "sessionTimeoutMinutes": 30 }` — required, integer, `@Min(5)`, `@Max(1440)`.
- **Response 200:** `{ "id": "uuid", "sessionTimeoutMinutes": 30 }`.
- ⚠️ **This setting is currently cosmetic** — it is persisted but not yet wired into actual JWT expiry or session-timeout logic (JWTs always expire after the fixed 24h server-side `expiresIn`). Don't build UI copy that implies this actively controls logout timing yet.

#### `POST /users/me/change-password` — Change my password
- **Auth:** Bearer token, any role.
- **Body** (`ChangePasswordDto`): `{ "currentPassword": "old", "newPassword": "new-secret" }` — `currentPassword` required `@IsNotEmpty`, `newPassword` required `@MinLength(6)`.
- **Response 200:** `{ "message": "Password updated successfully" }`.
- **Errors:** `400 Bad Request` — `"Current password is incorrect"`.

---

### 7.3 Business Profile

Base path: `/business`. Class-level `@UseGuards(JwtAuthGuard)`; every endpoint also has explicit `@Roles`.

#### `GET /business/profile` — Get business profile
- **Auth:** Bearer token + Roles: **ADMIN, MANAGER**.
- **Response 200** (auto-created, defaulting `name` to the org's name, if none exists yet):
  ```json
  {
    "id": "uuid", "name": "Acme Inc", "gstin": null, "pan": null,
    "state": null, "stateCode": null, "address": null, "phone": null,
    "email": null, "logoUrl": null, "updatedAt": "2026-09-06T...", "organizationId": "uuid"
  }
  ```

#### `PUT /business/profile` — Update business profile
- **Auth:** Bearer token + Roles: **ADMIN only**.
- **Body** (`UpdateBusinessProfileDto`), all optional:
  ```json
  { "name": "Acme Inc", "gstin": "22AAAAA0000A1Z5", "pan": "AAAAA0000A", "state": "Maharashtra", "stateCode": "27", "address": "...", "phone": "...", "email": "billing@acme.com" }
  ```
  Only `email` has format validation (`@IsEmail` when present); everything else is a free-text string. Upsert semantics — omitted fields are left untouched on an existing profile.
- **Response 200:** same shape as GET, updated.

#### `POST /business/logo` — Upload business logo
- **Auth:** Bearer token + Roles: **ADMIN only**.
- **Content-Type:** `multipart/form-data`, file field name **`file`**.
- **Constraints:**
  - Max size: **2 MB**. Larger files are rejected by Multer before reaching the handler.
  - Allowed types: `image/png`, `image/jpeg`, `image/jpg` only (checked by MIME type). Anything else → `400 Bad Request — "Only PNG or JPG logos are allowed"`.
  - Stored server-side as `uploads/logos/<random-uuid>.<ext>` (original filename discarded — no collision or path-traversal risk).
- **Response 200:** `{ "logoUrl": "/uploads/logos/<uuid>.png" }`
  - This path is **publicly servable** (no auth) at `http://localhost:4000/uploads/logos/<uuid>.png` — use it directly as an `<img src>`.
- **Errors:** `400 Bad Request — "No file uploaded"` if the `file` field is missing.

#### `GET /business/invoice-preview` — Sample tax computation preview
- **Auth:** Bearer token + Roles: **ADMIN only**.
- **Purpose:** Lets a settings screen show a live "here's how a ₹1000 line item would be taxed" preview using the exact same tax engine as real invoices, so the preview can never drift from production behavior.
- **Response 200** (numbers, not strings):
  ```json
  {
    "sampleUnitPrice": 1000, "sampleQuantity": 1, "taxableValue": 1000,
    "cgstAmount": 90, "sgstAmount": 90, "igstAmount": 0,
    "totalTax": 180, "total": 1180
  }
  ```
  ⚠️ `cgstAmount`/`sgstAmount`/`igstAmount` are each independently gated by their own `TaxConfig` toggle — if none are enabled, all three are `0` even though `totalTax` is still computed and nonzero. Don't assume `cgstAmount + sgstAmount + igstAmount === totalTax` in the UI; render `totalTax` as the authoritative figure.

---

### 7.4 Settings

Base path: `/settings`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)`; every endpoint has explicit `@Roles`.

#### `GET /settings/tax-config` — Get tax configuration
- **Auth:** Roles: **ADMIN only**.
- **Response 200** (auto-created with defaults if missing):
  ```json
  { "id": "uuid", "gstEnabled": true, "cgstEnabled": false, "sgstEnabled": false, "igstEnabled": false, "defaultGstRate": "18.00", "updatedAt": "...", "organizationId": "uuid" }
  ```

#### `PUT /settings/tax-config` — Update tax configuration
- **Auth:** Roles: **ADMIN only**.
- **Body** (`UpdateTaxConfigDto`), all optional:
  ```json
  { "gstEnabled": true, "cgstEnabled": true, "sgstEnabled": true, "igstEnabled": false, "defaultGstRate": 18 }
  ```
  `defaultGstRate`: `@IsNumber`, `@Min(0)`. Booleans: `@IsBoolean`.
- **Response 200:** same shape as GET, updated.
- **Note:** This config's toggles feed `GET /business/invoice-preview`, but real invoice creation (`POST /invoices`) currently computes a single blended tax line, not a separate CGST/SGST/IGST split — see [§10](#10-known-gotchas--implementation-notes).

#### `GET /settings/invoice-config` — Get invoice numbering & footer config
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Response 200:**
  ```json
  { "id": "uuid", "prefix": "INV-", "nextNumber": 1001, "footerNote": null, "updatedAt": "...", "organizationId": "uuid" }
  ```

#### `PUT /settings/invoice-config` — Update invoice numbering & footer config
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`UpdateInvoiceConfigDto`), all optional:
  ```json
  { "prefix": "INV-", "footerNote": "Thank you for your business!", "startingNumber": 5000 }
  ```
  - `startingNumber` is a **write-only input** — it sets the persisted `nextNumber` field but is not itself a stored/returned field name (response shows `nextNumber`, not `startingNumber`).
- **Response 200:** the `InvoiceConfig` row (with `nextNumber` reflecting any `startingNumber` you set).
- **Errors:** `400 Bad Request — "Starting number can only be set before any invoice has been created"` — once the org has created at least one invoice, `startingNumber` can no longer be changed (guards against renumbering collisions / duplicate invoice numbers). `prefix`/`footerNote` can always be edited regardless.

#### `GET /settings/regional` — Get regional settings
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Response 200:**
  ```json
  { "id": "uuid", "language": "en-IN", "currency": "INR", "dateFormat": "DD/MM/YYYY", "updatedAt": "...", "organizationId": "uuid" }
  ```

#### `PUT /settings/regional` — Update regional settings
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`UpdateRegionalSettingsDto`), all optional strings, **no enum/format restriction** — any string is accepted for `language`/`currency`/`dateFormat` (the frontend is responsible for presenting a fixed picklist; the backend won't reject an unsupported value):
  ```json
  { "language": "en-IN", "currency": "INR", "dateFormat": "DD/MM/YYYY" }
  ```
- **Response 200:** same shape as GET, updated.

---

### 7.5 Products

Base path: `/products`. Class-level `@UseGuards(JwtAuthGuard)`.

Every product response includes a **computed** `status` field (not stored): `"out-of-stock"` (`stock === 0`), `"low-stock"` (`0 < stock <= minStock`), otherwise `"in-stock"`.

**Role-based field visibility:** `CASHIER` never sees the `cost` field on any product read (list/get/lookup) — it's stripped server-side, not just hidden in the UI. `ADMIN`/`MANAGER` see `cost` everywhere, including on create/update/delete responses and CSV exports (regardless of caller role for the export endpoint).

#### `GET /products` — List products (paginated, filterable)
- **Auth:** Any authenticated role.
- **Query params** (`ProductQueryDto extends PaginationQueryDto`):

  | Param | Type | Default | Notes |
  |---|---|---|---|
  | `page` | number | `1` | |
  | `pageSize` | number | `20` | |
  | `search` | string | — | matches `name` OR `sku`, case-insensitive `contains` |
  | `category` | string | — | exact match |
  | `status` | `"in-stock"|"low-stock"|"out-of-stock"` | — | filters on the **computed** status (see perf note below) |
  | `sortBy` | `"name"|"price"|"stock"|"category"|"createdAt"` | `"createdAt"` | |
  | `sortDir` | `"asc"|"desc"` | `"desc"` | |

  Only active (`isActive: true`) products in the caller's org are ever returned.
- **Response 200:** `PaginatedResult<Product>` where each item is (ADMIN/MANAGER shape shown):
  ```json
  { "id", "name", "sku", "category", "price", "cost", "stock", "minStock", "gstRate", "isActive", "createdAt", "updatedAt", "status" }
  ```
- **Performance note:** when `status` is supplied, filtering happens in application memory (all matching rows are loaded, filtered by computed status, then sliced) rather than in SQL — fine for typical SMB catalog sizes, but be aware very large catalogs + a `status` filter could be slower than other query combinations.

#### `GET /products/categories` — Distinct categories with counts
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Response 200:** `[ { "name": "Electronics", "count": 42 } ]` (active products only).

#### `GET /products/lookup` — Look up a product by exact SKU/barcode
- **Auth:** Any authenticated role.
- **Query param:** `barcode` (string) — exact match against `sku`.
- **Response 200:** single product object (role-dependent shape) + `status`.
- **Errors:** `404 Not Found — "Product not found"`.
- ⚠️ `barcode` is read as a raw query param with no validation — an omitted/empty value is not explicitly rejected, so always send it when calling this endpoint.

#### `GET /products/export` — Export active products as CSV
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Response 200:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="products.csv"`. Columns: `sku, name, category, price, cost, stock, minStock, gstRate, status`, ordered by `name asc`.

#### `GET /products/:id` — Get single product
- **Auth:** Any authenticated role.
- **Response 200:** product object (role-dependent shape) + `status`.
- **Errors:** `404 Not Found — "Product not found"` (also thrown if inactive or in another org).

#### `POST /products` — Create product
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`CreateProductDto`):
  ```json
  { "name": "Widget A", "sku": "WID-001", "category": "Hardware", "price": 499.00, "cost": 300.00, "stock": 100, "minStock": 10, "gstRate": 18 }
  ```
  - `name`, `sku`, `category`: required, non-empty strings
  - `price`, `cost`: required, `@IsNumber`, `@Min(0)`
  - `stock`, `minStock`: required, `@IsInt`, `@Min(0)`
  - `gstRate`: **optional** — if omitted, defaults to the org's `TaxConfig.defaultGstRate` (or `18` if no tax config exists yet)
- **Response 201:** created product (full shape, incl. `cost`) + `status`.
- **Errors:** `409 Conflict — "A product with this SKU already exists"` — SKU uniqueness is enforced **per organization** (the same SKU can exist across different orgs).

#### `PATCH /products/:id` — Update product
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`UpdateProductDto` — all `CreateProductDto` fields, all optional): send only the fields you want to change. Note `gstRate` is **not** auto-defaulted here (only on create) — omitting it simply leaves the existing rate unchanged.
- **Response 200:** updated product (full shape) + `status`.
- **Errors:** `404 Not Found`, `409 Conflict` (SKU collision).

#### `DELETE /products/:id` — Deactivate (soft-delete) product
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Behavior:** Sets `isActive: false`. The row and its full history (invoice items, stock adjustments referencing it) are preserved — it simply disappears from list/get/lookup/export going forward. There is no hard-delete endpoint and no "restore" endpoint.
- **Response 200:** the now-inactive product object.
- **Errors:** `404 Not Found` (also returned if already inactive).

#### `POST /products/:id/stock-adjustment` — Adjust stock level
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`StockAdjustmentDto`):
  ```json
  { "delta": -5, "reason": "Damaged in transit" }
  ```
  - `delta`: required, `@IsInt`, `@NotEquals(0)` — positive to add, negative to remove.
  - `reason`: required, non-empty — free-text audit note.
- **Behavior:** Atomically updates `product.stock` and inserts a permanent `StockAdjustment` audit row (`{ productId, userId: caller, delta, reason, createdAt }`). This audit trail is what powers the Dashboard's "low stock trend" calculation — direct edits bypassing this endpoint (there are none exposed, but worth knowing) would not be reflected there.
- **Response 200:** updated product (full shape) + `status`.
- **Errors:**
  - `404 Not Found — "Product not found"`.
  - `400 Bad Request — "Stock adjustment would result in negative stock"` — if `stock + delta < 0`.

---

### 7.6 Customers

Base path: `/customers`. Class-level `@UseGuards(JwtAuthGuard)`. No role restrictions — any authenticated role can search/create customers.

#### `GET /customers` — Search customers
- **Auth:** Any authenticated role.
- **Query param:** `search` (string, optional, raw — not DTO-validated) — matches `name`, `phone`, or `email` (case-insensitive `contains`, OR'd together). Omit for the full list.
- **Behavior:** **Not paginated.** Hard-capped to the first **20** matches (ordered by `name asc`) — there is no `total`/`page` in the response and no way to fetch beyond the 20th match via this endpoint currently. If you need exhaustive customer data (e.g. for an export), this endpoint is not suitable as-is.
- **Response 200:** plain array:
  ```json
  [ { "id", "name", "phone", "email", "address", "createdAt", "organizationId" } ]
  ```

#### `POST /customers` — Create customer
- **Auth:** Any authenticated role.
- **Body** (`CreateCustomerDto`):
  ```json
  { "name": "Ravi Kumar", "phone": "+91-9876543210", "email": "ravi@example.com", "address": "..." }
  ```
  - `name`: required, non-empty.
  - `phone`, `address`: optional, free text, no format check.
  - `email`: optional, `@IsEmail` if present.
- **Response 201:** created customer, same shape as list items.
- **Errors:** none specific — there's no uniqueness constraint on customers (duplicate names/phones/emails are allowed).

---

### 7.7 Expenses

Base path: `/expenses`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', 'MANAGER')` — **CASHIER is blocked (403) from all expense endpoints.**

#### `GET /expenses` — List expenses
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Query params** (`ExpenseQueryDto`): `from?`, `to?` — both optional ISO-8601, filter on `incurredAt`.
- **Behavior:** **Not paginated** — returns the full matching array, ordered `incurredAt desc`. For an org with a large expense history and no date filter, this can be a large payload; always pass `from`/`to` when building a bounded view (e.g. "this month").
- **Response 200:**
  ```json
  [ { "id", "category", "amount", "note", "incurredAt", "createdAt", "organizationId" } ]
  ```

#### `POST /expenses` — Create expense
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Body** (`CreateExpenseDto`):
  ```json
  { "category": "Rent", "amount": 15000.00, "note": "September rent", "incurredAt": "2026-09-01T00:00:00.000Z" }
  ```
  - `category`: required, non-empty.
  - `amount`: required, `@IsNumber`, `@Min(0.01)` — must be positive.
  - `note`: optional, free text.
  - `incurredAt`: optional ISO-8601 — if omitted, defaults to "now" (DB default).
- **Response 201:** created expense, same shape as list items.

---

### 7.8 Invoices

Base path: `/invoices`. Class-level `@UseGuards(JwtAuthGuard)`.

#### `POST /invoices` — Create an invoice (checkout / point-of-sale)
- **Auth:** Any authenticated role (ADMIN, MANAGER, **and CASHIER** — this is the core POS action).
- **Body** (`CreateInvoiceDto`):
  ```json
  {
    "customerId": "uuid-or-omit-for-walk-in",
    "items": [
      { "productId": "uuid", "quantity": 2 },
      { "productId": "uuid", "quantity": 1 }
    ],
    "discountPercent": 10,
    "paymentMethod": "CASH"
  }
  ```
  - `customerId`: optional — omit for a walk-in/anonymous sale.
  - `items`: required array, `@ArrayMinSize(1)`; each item needs `productId` (UUID) and `quantity` (integer, `@Min(1)`). Duplicate `productId` entries are automatically merged (quantities summed) before processing.
  - `discountPercent`: optional, `0`–`100`, default `0`.
  - `paymentMethod`: required — `"CASH" | "UPI" | "CARD"`.
  - **You do not send prices or product names** — the server always re-reads `unitPrice`, `unitCost`, `gstRate`, `sku`, `category`, `name` fresh from the database at the moment of invoicing, scoped to the caller's org and only for active products. Client-supplied pricing is never trusted.
- **Response 201:**
  ```json
  {
    "id": "uuid", "invoiceNumber": "INV-1002",
    "subtotal": "1000.00", "discountPercent": "10.00", "discountAmount": "100.00",
    "taxAmount": "162.00", "total": "1062.00",
    "paymentMethod": "CASH", "createdAt": "2026-09-06T...",
    "organizationId": "uuid", "customerId": "uuid|null", "cashierId": "uuid",
    "items": [
      {
        "id": "uuid", "productName": "Widget A", "sku": "WID-001", "category": "Hardware",
        "unitPrice": "500.00", "unitCost": "300.00", "quantity": 2,
        "taxRate": "18.00", "taxAmount": "162.00", "lineTotal": "1062.00",
        "invoiceId": "uuid", "productId": "uuid"
      }
    ],
    "customer": { "id", "name", "phone", "email", "address", "createdAt", "organizationId" } // or null
  }
  ```
- **Tax calculation logic (per line, then summed for invoice totals):**
  1. `lineSubtotal = unitPrice × quantity`
  2. `discountAmount = lineSubtotal × discountPercent / 100`
  3. `taxableValue = lineSubtotal − discountAmount`
  4. `taxAmount = taxableValue × gstRate / 100`
  5. `lineTotal = taxableValue + taxAmount`

  All rounded to 2 decimal places. Invoice-level `subtotal`/`discountAmount`/`taxAmount`/`total` are the sums of each line's corresponding value. **Note:** this is a single blended tax line per item (not a CGST/SGST/IGST split), even though `TaxConfig` has separate toggles for those — see [§10](#10-known-gotchas--implementation-notes).
- **Invoice numbering:** Auto-generated per organization as `{prefix}{sequentialNumber}` (e.g. `INV-1002`), atomically incremented — never client-supplied, never reused, safe under concurrent requests.
- **Stock handling:** Decremented atomically and safely under concurrency (a conditional update that only succeeds if enough stock remains). If insufficient, the entire invoice creation (including the invoice-number increment) is rolled back.
- **Errors:**
  - `404 Not Found — "Customer not found"` (bad/foreign `customerId`).
  - `404 Not Found — "One or more products were not found"` (bad/foreign/inactive `productId`).
  - `400 Bad Request — "Insufficient stock for {productName}"`.
  - Standard `400` validation errors for malformed input.

#### `GET /invoices` — List invoices (paginated)
- **Auth:** Roles: **ADMIN, MANAGER** (CASHIER forbidden — 403; cashiers can create and view/download individual PDFs but not browse the full invoice list).
- **Query params** (`InvoiceQueryDto extends PaginationQueryDto`): `page`, `pageSize`, plus optional `from`/`to` (ISO-8601, filtering `createdAt`).
- **Response 200:** `PaginatedResult<Invoice>` — same invoice shape as the create response, ordered `createdAt desc`.

#### `GET /invoices/:id` — Get single invoice
- **Auth:** Roles: **ADMIN, MANAGER**.
- **Response 200:** invoice object (same shape as create), with `items` and `customer` included.
- **Errors:** `404 Not Found — "Invoice not found"`.

#### `GET /invoices/:id/pdf` — Download invoice PDF
- **Auth:** Any authenticated role (including CASHIER — useful for handing a customer a receipt at POS).
- **Response 200:** binary PDF stream.
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="<invoiceNumber>.pdf"`
  - Contains: org name, invoice number, date, customer name (or "Walk-in"), payment method, itemized table, subtotal/discount/tax/total.
- **Frontend handling:** request with `responseType: 'blob'` (axios) or `.blob()` (fetch), then `URL.createObjectURL(blob)` to trigger a download or open in a new tab — **do not** attempt to parse this as JSON.
- **Errors:** `404 Not Found — "Invoice not found"` (returned as normal JSON before any PDF bytes are streamed, safe to handle as a standard error).

---

### 7.9 Reports

Base path: `/reports`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', 'MANAGER')` — **every endpoint requires ADMIN or MANAGER** (CASHIER → 403 on all of Reports).

#### `GET /reports/summary-stats` — KPI summary with period-over-period change
- **Query params** (`TrendRangeQueryDto`): `range?` — `"daily"|"weekly"|"monthly"`, default `"daily"`.
- **Response 200:**
  ```json
  {
    "totalRevenue": 45230.50, "totalRevenueChangePercent": 12.4,
    "totalOrders": 87, "totalOrdersChangePercent": -3.1,
    "avgOrderValue": 519.89, "avgOrderValueChangePercent": 15.9,
    "newCustomers": 6, "newCustomersChangePercent": 20.0
  }
  ```
  `*ChangePercent` compares the current window to the immediately preceding equal-length window. `revenue` = `subtotal − discountAmount` (post-discount, pre-tax).

#### `GET /reports/revenue-expenses` — Revenue vs. expenses trend
- **Query params:** `TrendRangeQueryDto` (`range?`).
- **Response 200:** array, oldest-first, one entry per bucket (including empty ones):
  ```json
  [ { "period": "2026-08-24", "revenue": 1520.0, "expenses": 300.0 } ]
  ```
  `period` format: `YYYY-MM-DD` for daily/weekly buckets, `YYYY-MM` for monthly.

#### `GET /reports/sales-by-category` — Sales grouped by category
- **Query params:** `DateRangeQueryDto` (`from?`, `to?`).
- **Response 200:** `[ { "category": "Electronics", "sales": 12000.0 } ]` — `sales` = sum of `lineTotal`.

#### `GET /reports/gst-summary` — GST/tax summary
- **Query params:** `DateRangeQueryDto` (`from?`, `to?`).
- **Response 200:**
  ```json
  {
    "grossSales": 100000.0, "returns": 0, "netSales": 95000.0,
    "gstCollected": 17100.0, "inputTaxCredit": 0, "netGstPayable": 17100.0
  }
  ```
  `returns` and `inputTaxCredit` are always `0` — there's no refund/void model or purchase-invoice model in the schema yet, so these are honest placeholders, not bugs.

#### `GET /reports/export` — Export invoice report (CSV or XLSX)
- **Query params** (`ExportReportQueryDto extends DateRangeQueryDto`): `format` — **required**, `"csv" | "xlsx"`; plus optional `from`/`to`.
- **Response 200:** binary/text file, one row per invoice — columns: Invoice #, Date, Customer, Subtotal, Discount, Tax, Total, Payment Method.
  - `format=xlsx` → `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename `report.xlsx`.
  - `format=csv` → `Content-Type: text/csv`, filename `report.csv`.
- **Errors:** `400 Bad Request` if `format` missing/invalid.

#### `POST /reports/gst/generate` — Generate GST summary PDF
- **Query params:** `DateRangeQueryDto` (`from?`, `to?`) — note: filters are query params even though the verb is `POST`; no request body is read.
- **Response 200:** `Content-Type: application/pdf`, filename `gst-report.pdf` — a formatted report of the same 6 fields as `GET /reports/gst-summary`.

---

### 7.10 Exports

Base path: `/exports`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` — **strictly ADMIN-only**, stricter than Reports (which also allows MANAGER). These are thin wrappers that reuse Reports/Products service logic — no separate implementation.

#### `GET /exports/sales` — Export sales as XLSX
- **Query params:** `DateRangeQueryDto` (`from?`, `to?`).
- **Response 200:** identical output to `GET /reports/export?format=xlsx`, filename `sales.xlsx`.

#### `GET /exports/inventory` — Export product inventory as CSV
- **Query params:** none.
- **Response 200:** `Content-Type: text/csv`, filename `inventory.csv`. All active products, always including `cost` (regardless of caller role — this export endpoint is ADMIN-only anyway) plus computed `status`.

#### `GET /exports/tax-reports` — Export GST summary as PDF
- **Query params:** `DateRangeQueryDto` (`from?`, `to?`).
- **Response 200:** identical output to `POST /reports/gst/generate`, filename `gst-report.pdf` (same content, different HTTP verb: `GET` here vs `POST` on Reports).

---

### 7.11 Dashboard

Base path: `/dashboard`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', 'MANAGER')` — **all dashboard endpoints require ADMIN or MANAGER** (CASHIER → 403).

#### `GET /dashboard/stats` — Today's KPI summary vs. yesterday
- **No query params.**
- **Response 200:**
  ```json
  {
    "todaysSales": 12345.67, "todaysSalesChangePercent": 4.21,
    "netProfit": 3210.50, "netProfitChangePercent": -1.5,
    "expenses": 987.0, "expensesChangePercent": 0,
    "lowStockCount": 3, "lowStockDelta": 1
  }
  ```
  - Windows are **UTC calendar days** (today = 00:00 UTC to now; yesterday = the prior UTC day).
  - `netProfit` = `(subtotal − discountAmount)` minus cost-of-goods-sold minus expenses, for that day.
  - `lowStockDelta` = today's low-stock product count minus yesterday's reconstructed count (can be negative). This reconstruction uses the `StockAdjustment` audit trail plus today's invoice items — it's an approximation, documented as such in the code.

#### `GET /dashboard/sales-trend` — Sales bucketed over time
- **Query params:** `TrendRangeQueryDto` (`range?`, default `"daily"`).
- **Response 200:** `[ { "period": "2026-08-24", "sales": 1520.0 } ]` — same bucket format as `reports/revenue-expenses`.

#### `GET /dashboard/sales-by-category` — Revenue share by category
- **Query params:** `TrendRangeQueryDto` (`range?`) — used only to set the window's start cutoff; results are **not** bucketed by time.
- **Response 200:** `[ { "category": "Electronics", "sharePercent": 63.42 } ]` — percentages should sum to ~100 across the array.

#### `GET /dashboard/recent-transactions` — Latest invoices widget
- **Query params:** `limit` (optional, plain query string, parsed as `Number(limit) || 5` — default `5`, no upper bound enforced).
- **Response 200:**
  ```json
  [ { "id", "invoiceNumber", "customerName": "Walk-in", "amount": 250.0, "paymentMethod": "CASH", "status": "PAID", "createdAt": "..." } ]
  ```
  ⚠️ `status` is a **hardcoded literal `"PAID"`** for every row — the schema has no variable invoice status field yet, so don't build UI that implies other states (e.g. "pending", "void") are possible from this field today.

#### `GET /dashboard/top-products` — Best sellers by revenue
- **Query params:** `range?` (`TrendRangeQueryDto`, default `"daily"`), `limit?` (plain query string, default `5`).
- **Response 200:** `[ { "productId", "name": "Widget A", "unitsSold": 42, "revenue": 4200.0 } ]`, sorted by revenue descending.

---

### 7.12 Backups

Base path: `/backups`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` — **strictly ADMIN-only** throughout. Backup files live server-side under `storage/backups/` and are never served as static assets — only reachable through these authenticated routes.

#### `GET /backups/schedule` — Get the org's backup schedule config
- **Response 200** (auto-created with defaults `{ frequency: "daily", time: "02:00" }` if none exists):
  ```json
  { "organizationId": "uuid", "frequency": "daily", "time": "02:00", "retentionCount": 7, "updatedAt": "..." }
  ```

#### `PUT /backups/schedule` — Update the org's backup schedule config
- **Body** (`UpdateBackupScheduleDto`) — **effectively a full replace**, not a partial patch, despite the `PUT`/service being an upsert:
  ```json
  { "frequency": "weekly", "time": "03:30", "retentionCount": 14 }
  ```
  - `frequency`: **required**, `@IsIn(['daily','weekly','monthly'])`.
  - `time`: **required**, must match 24-hour `HH:mm` (regex-validated).
  - `retentionCount`: optional integer, `>= 1`.
- **Response 200:** updated schedule row.
- ⚠️ **This schedule is currently not enforced by any cron job** — there is no scheduler in the backend that reads this config and actually triggers backups automatically. It's persisted for reference/future use; **actual backups only happen when `POST /backups` is explicitly called.** Don't build UI copy implying "backups will now run automatically" without flagging this to the backend team if automatic scheduling is expected to work today.

#### `GET /backups` — List backups (paginated)
- **Query params:** `PaginationQueryDto` (`page`, `pageSize`).
- **Response 200:** `PaginatedResult<Backup>`:
  ```json
  {
    "data": [
      { "id", "organizationId", "type": "FULL", "status": "COMPLETED", "sizeBytes": "104857600", "errorMessage": null, "createdAt": "...", "completedAt": "..." }
    ],
    "total": 1, "page": 1, "pageSize": 20
  }
  ```
  `filePath` is **never** included in any Backups response (list, get, or create) — it's used internally only for download/restore. `sizeBytes` is a `BigInt`, serialized as a string.

#### `POST /backups` — Trigger a new backup
- **Body** (`CreateBackupDto`): `{ "type": "FULL" | "INCREMENTAL" }` — required.
- **Behavior:** **Asynchronous.** Returns immediately with a `PENDING` backup row; the actual `pg_dump` runs in the background. **Poll `GET /backups/:id`** to observe the transition `PENDING → RUNNING → COMPLETED` (populates `sizeBytes`/`completedAt`) or `→ FAILED` (populates `errorMessage`).
- **Response 201:** the newly created `Backup` row, `status: "PENDING"`.
- ⚠️ `INCREMENTAL` currently runs the **exact same full dump** as `FULL` under the hood — true incremental backups aren't implemented yet. Don't build UI messaging that promises smaller/faster incremental backups today.

#### `GET /backups/:id` — Get single backup status
- **Response 200:** single `Backup` object (same shape as list items, `filePath` omitted).
- **Errors:** `404 Not Found — "Backup not found"`.

#### `GET /backups/:id/download` — Download the backup dump file
- **Response 200:** binary file stream, filename `<id>.dump` (raw PostgreSQL custom-format dump — not human-readable, meant for `pg_restore`).
- **Errors:**
  - `404 Not Found — "Backup not found"`.
  - `400 Bad Request — "Backup is not ready for download"` — if `status !== "COMPLETED"`.

#### `POST /backups/:id/restore` — ⚠️ Restore the database from a backup (DESTRUCTIVE)
- **Behavior:** **Synchronous** — the request blocks until `pg_restore` completes. Runs `pg_restore --clean --if-exists` against the **live, entire physical database** the backend is connected to.
- **This is irreversible and affects the whole shared Postgres instance, not just the calling organization's data** — since NexBill is multi-tenant on a single database, restoring a backup taken for one org's benefit will reset **every** organization's data to that backup's point in time. There is no confirmation step, dry-run, or "backup before restore" safety net on the server — **the frontend must implement a strong confirmation UX** (e.g. type-to-confirm, admin re-auth) before calling this.
- **Response 200 (success):** `{ "message": "Database restored successfully" }`.
- **Errors:**
  - `404 Not Found — "Backup not found"`.
  - `400 Bad Request — "Backup is not ready for restore"` — if `status !== "COMPLETED"`.
  - `500 Internal Server Error` — if the `pg_restore` process itself fails (no structured error message; treat any 500 here as "restore failed, check server logs").

---

### 7.13 System

Base path: `/system`. Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` — **all ADMIN-only.**

#### `GET /system/health` — Live server resource metrics
- **Response 200:**
  ```json
  { "cpuPercent": 12.5, "memoryPercent": 63.42, "storagePercent": 45.1, "networkPercent": 2.37 }
  ```
  All are live-sampled percentages (0–100). `networkPercent` is capped at 100 and may be inaccurate in virtualized/containerized environments where link speed isn't reliably reported (falls back to an assumed 100 Mbps).
- **Use case:** an admin-only "system status" panel — not a public health-check (see [§7.14](#714-health--root) for that).

#### `POST /system/optimize-db` — Run `VACUUM ANALYZE`
- **No body.**
- **Behavior:** **Synchronous** — runs `VACUUM ANALYZE` against the whole database and blocks until done. Can take noticeable time on a large database; the frontend should show a loading/in-progress state and expect a potentially slow response rather than assuming something is broken.
- **Response 200:** `{ "message": "Database optimization (VACUUM ANALYZE) completed" }`.

#### `POST /system/clear-cache` — Clear cache
- **No body.**
- **Behavior:** **No-op** — there is no cache layer (Redis, in-memory, etc.) currently wired into the app, so this honestly reports that there's nothing to clear rather than faking success.
- **Response 200:** `{ "message": "No cache layer is currently configured; nothing to clear." }`.
- Note: `.env` defines `REDIS_HOST`/`REDIS_PORT`, suggesting Redis integration is planned but not yet implemented — don't wire real cache-invalidation UX around this endpoint until that changes.

---

### 7.14 Health / Root

#### `GET /` — Liveness check
- **Auth:** None — fully public, no guards at all.
- **Response 200:** plain text body (not JSON): `Hello World!`
- **Use case:** basic "is the server process up and routing" smoke test (e.g. load balancer health check, uptime monitor) — it is **not** a structured health payload. For real resource metrics, use `GET /system/health` (ADMIN-only, JSON).

---

## 8. Complete Role Permission Matrix

✅ = allowed · ❌ = `403 Forbidden` · — = not applicable (public or self-service)

| Endpoint | Public | ADMIN | MANAGER | CASHIER |
|---|:---:|:---:|:---:|:---:|
| `POST /auth/login` | ✅ | — | — | — |
| `POST /auth/register-org` | ✅ | — | — | — |
| `GET /auth/me` | | ✅ | ✅ | ✅ |
| `POST /users` (create user) | | ✅ (any role) | ✅ (cashier only) | ❌ |
| `GET /users` | | ✅ | ✅ | ❌ |
| `PATCH /users/:id/role` | | ✅ | ❌ | ❌ |
| `PATCH /users/:id/deactivate` | | ✅ | ❌ | ❌ |
| `GET/PUT /users/me/*` (own prefs/password) | | ✅ | ✅ | ✅ |
| `GET /business/profile` | | ✅ | ✅ | ❌ |
| `PUT /business/profile` | | ✅ | ❌ | ❌ |
| `POST /business/logo` | | ✅ | ❌ | ❌ |
| `GET /business/invoice-preview` | | ✅ | ❌ | ❌ |
| `GET/PUT /settings/tax-config` | | ✅ | ❌ | ❌ |
| `GET/PUT /settings/invoice-config` | | ✅ | ✅ | ❌ |
| `GET/PUT /settings/regional` | | ✅ | ✅ | ❌ |
| `GET /products`, `GET /products/:id`, `GET /products/lookup` | | ✅ | ✅ | ✅ (no `cost`) |
| `GET /products/categories`, `GET /products/export` | | ✅ | ✅ | ❌ |
| `POST/PATCH/DELETE /products*`, stock-adjustment | | ✅ | ✅ | ❌ |
| `GET/POST /customers` | | ✅ | ✅ | ✅ |
| `GET/POST /expenses` | | ✅ | ✅ | ❌ |
| `POST /invoices` (create) | | ✅ | ✅ | ✅ |
| `GET /invoices`, `GET /invoices/:id` | | ✅ | ✅ | ❌ |
| `GET /invoices/:id/pdf` | | ✅ | ✅ | ✅ |
| `GET /reports/*`, `POST /reports/gst/generate` | | ✅ | ✅ | ❌ |
| `GET /exports/*` | | ✅ | ❌ | ❌ |
| `GET /dashboard/*` | | ✅ | ✅ | ❌ |
| `GET/POST /backups/*` (all) | | ✅ | ❌ | ❌ |
| `GET /system/*`, `POST /system/*` | | ✅ | ❌ | ❌ |
| `GET /` | ✅ | — | — | — |

---

## 9. File Download Endpoints Cheat Sheet

None of these are JSON — request them with a **blob-aware** HTTP client configuration, never plain `fetch(...).json()`.

| Endpoint | Method | Content-Type | Filename |
|---|---|---|---|
| `/invoices/:id/pdf` | GET | `application/pdf` | `{invoiceNumber}.pdf` |
| `/reports/export?format=xlsx` | GET | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `report.xlsx` |
| `/reports/export?format=csv` | GET | `text/csv` | `report.csv` |
| `/reports/gst/generate` | POST | `application/pdf` | `gst-report.pdf` |
| `/exports/sales` | GET | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `sales.xlsx` |
| `/exports/inventory` | GET | `text/csv` | `inventory.csv` |
| `/exports/tax-reports` | GET | `application/pdf` | `gst-report.pdf` |
| `/products/export` | GET | `text/csv` | `products.csv` |
| `/backups/:id/download` | GET | (octet-stream) | `{id}.dump` |

**Recommended frontend pattern (axios):**
```js
const res = await api.get('/invoices/abc123/pdf', {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob',
});
const url = URL.createObjectURL(res.data);
const a = document.createElement('a');
a.href = url;
a.download = 'invoice.pdf'; // or read from Content-Disposition
a.click();
URL.revokeObjectURL(url);
```
**Recommended frontend pattern (fetch):**
```js
const res = await fetch('/invoices/abc123/pdf', {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) { /* handle JSON error body */ }
const blob = await res.blob();
// ...same download-link approach as above
```

---

## 10. Known Gotchas & Implementation Notes

These are real, verified behaviors of the current backend implementation that frontend developers should design around (not hypothetical edge cases):

1. **`POST /users` response includes the bcrypt password hash.** No field selection is applied on create. Never render/log the `password` field from this specific response.
2. **Some "not found" errors return `400`, not `404`** (Users module role/deactivate endpoints) — check message text, not just status code, if you need to distinguish "not found" from "validation failed".
3. **No refresh tokens.** JWTs are valid for a fixed 24 hours; there's no silent-refresh endpoint. Plan your session-expiry UX (e.g. redirect to login on any `401`) accordingly.
4. **`sessionTimeoutMinutes` (Users → security settings) is stored but not enforced** — it doesn't currently shorten/lengthen actual JWT validity. Avoid UI copy that implies otherwise.
5. **CGST/SGST/IGST split is not implemented in real invoices.** `POST /invoices` computes one blended `taxAmount` per line using the product's `gstRate`; the separate cgst/sgst/igst toggles in `TaxConfig` only affect the `/business/invoice-preview` sample calculation, not actual invoice tax breakdown.
6. **`GET /dashboard/recent-transactions` always reports `status: "PAID"`** — there is no variable invoice status (paid/pending/void) in the data model yet.
7. **Backup schedule (`/backups/schedule`) is not cron-enforced.** Saving a schedule does not cause backups to run automatically — only explicit `POST /backups` calls create a backup today.
8. **`INCREMENTAL` backups run a full dump internally** — there's no real incremental/differential backup logic yet; expect the same time/size cost as `FULL`.
9. **`POST /backups/:id/restore` is whole-database, whole-instance, and irreversible.** Because all organizations share one Postgres database, restoring affects every tenant, not just the org that owns the backup being restored. Gate this heavily in the UI (confirmation dialog, maybe a typed confirmation phrase) — the backend has no built-in safety net for this action.
10. **`POST /system/optimize-db` is synchronous and can be slow** on a large database — show a loading state, don't assume a fast round-trip.
11. **Decimal fields often serialize as strings** (e.g. `"499.00"`), BigInt fields too (`Backup.sizeBytes`) — always `Number(...)`-coerce before arithmetic/formatting on the frontend.
12. **`GET /customers` is capped at 20 results and is not paginated** — don't build an "infinite scroll" or page-2 experience against it as-is; it's designed for a quick search-as-you-type autocomplete, not a full directory browser.
13. **`GET /expenses` is not paginated** — always pass `from`/`to` in production usage to keep the payload bounded.
14. **Uploaded logos (`/uploads/**`) are publicly accessible with no authentication** — don't rely on obscurity for anything sensitive placed there; currently only logos are stored there, which is appropriate for public display anyway.
15. **CORS currently allows only `http://localhost:3000`.** If the frontend's dev/staging/prod origin differs, the backend config needs a corresponding update or requests will be silently blocked by the browser (visible as a CORS error in devtools, not a clean API error).

---

## 11. Frontend Integration Guide

**Suggested API client setup (axios example):**
```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  // do NOT set a default Content-Type here — let axios set multipart boundaries for file uploads automatically
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredToken();
      redirectToLogin(); // token missing/expired/account deactivated mid-session
    }
    return Promise.reject(err);
  },
);
```

**Role-gating UI (client-side convenience only — the server enforces the real rule; see [§8](#8-complete-role-permission-matrix)):**
```js
const canManageUsers = currentUser.role === 'ADMIN';
const canCreateNonCashier = currentUser.role === 'ADMIN';
const canViewReports = ['ADMIN', 'MANAGER'].includes(currentUser.role);
```

**Money formatting helper (handles the Decimal-as-string quirk, [§4.4](#44-numericdecimal-serialization--important)):**
```js
const formatCurrency = (value, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(value));
```

**Pagination helper:**
```js
async function fetchPage(url, page = 1, pageSize = 20, extraParams = {}) {
  const { data } = await api.get(url, { params: { page, pageSize, ...extraParams } });
  return data; // { data, total, page, pageSize }
}
```

**Checklist before wiring a new screen against this API:**
- [ ] Confirm the endpoint's required role(s) in [§8](#8-complete-role-permission-matrix) and hide/disable the action for other roles.
- [ ] Confirm whether the endpoint is paginated, array-only, or single-object (§4.2, and per-endpoint notes) — don't assume `{ data, total }` everywhere.
- [ ] Coerce any Decimal/BigInt-looking field with `Number(...)` before formatting or math.
- [ ] For file-producing endpoints, use blob-based requests per [§9](#9-file-download-endpoints-cheat-sheet).
- [ ] Handle `401` globally (redirect to login) and surface `400`/`403`/`404`/`409` messages from `err.response.data.message` in the UI.
