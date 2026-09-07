<div align="center">

# NexBill

**A multi-tenant billing & invoicing platform for small businesses**

Next.js 16 · React 19 · TypeScript · TanStack Query · NestJS · Prisma · PostgreSQL

</div>

---

## Overview

NexBill is a role-aware billing dashboard covering invoicing, inventory, expenses, and GST-ready reporting for multi-tenant organizations. This repository is the **frontend** — a Next.js App Router application that talks to a separate NestJS/Prisma/PostgreSQL API over a typed REST client.

Every organization (tenant) is fully isolated at the data layer, and every screen renders conditionally based on the signed-in user's role (`ADMIN`, `MANAGER`, `CASHIER`), with the backend re-enforcing every permission server-side.

## Features

| Module | Route | What it does |
|---|---|---|
| **Dashboard** | `/dashboard` | KPI widgets, revenue charts, recent transactions, top products |
| **Billing** | `/billing` | Invoice creation, customer picker, PDF generation, payment tracking |
| **Inventory** | `/inventory` | Product catalog, stock adjustments |
| **Accounting** | `/accounting` | Expense tracking |
| **Reports** | `/reports` | Analytics, GST summaries, CSV/XLSX/PDF exports |
| **Users** | `/users` | Team management — invite, edit, deactivate |
| **Settings** | `/settings` | Business profile, tax config, invoice numbering, regional & security settings |
| **Utilities** | `/utilities` | Database backup & restore |

Access to each route is gated by role via [`config/route-access.ts`](config/route-access.ts):

```ts
"/dashboard":  ["ADMIN", "MANAGER"]
"/billing":    ["ADMIN", "MANAGER", "CASHIER"]
"/inventory":  ["ADMIN", "MANAGER"]
"/users":      ["ADMIN"]
"/reports":    ["ADMIN", "MANAGER"]
"/accounting": ["ADMIN"]
"/utilities":  ["ADMIN"]
"/settings":   ["ADMIN", "MANAGER", "CASHIER"]
```

## Tech Stack

**Core**
- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) with [Radix UI](https://www.radix-ui.com) primitives (shadcn-style component layer in `components/ui`)

**Data & State**
- [TanStack Query](https://tanstack.com/query) for server state, caching, and mutations
- [Axios](https://axios-http.com) as the HTTP client, wrapped in a single interceptor-driven instance
- React Context (`AuthContext`) for session/role state

**UI & Visualization**
- [Recharts](https://recharts.org) for dashboard and report charts
- [Lucide](https://lucide.dev) icons, [Sonner](https://sonner.emilkowal.ski) toasts, `next-themes` for dark mode

**Backend (separate repo)**
- NestJS 11 + Prisma 6 on PostgreSQL, JWT Bearer auth, multi-tenant data isolation

## Project Structure

```
app/
├── (dashboard)/            Route group — one folder per module
│   ├── dashboard/          accounting/  billing/  inventory/
│   ├── reports/  settings/ users/       utilities/
│   └── layout.tsx          Shared authenticated shell (nav, guards)
├── 403/                    Unauthorized-access page
├── layout.tsx              Root layout, providers
└── page.tsx                Login / entry point

components/
├── <feature>/              Feature-scoped components (billing/, inventory/, ...)
├── common/                 Shared non-primitive components (e.g. PaginationBar)
└── ui/                     Design-system primitives (button, dialog, card, ...)

context/
└── AuthContext.tsx         Session state, current user, role

lib/
├── api/                    One typed client module per backend domain
│   ├── client.ts           Axios instance, auth header injection, 401 handling
│   └── invoices.ts, users.ts, products.ts, ...
└── auth.ts                 Session token get/set/clear helpers

hooks/queries/              TanStack Query hooks, one per domain (use-invoices, use-users, ...)
config/route-access.ts      Role → allowed routes map
types/                      Shared TypeScript types, mirrored to API domains
```

**Design principle:** every backend domain gets a matching `lib/api/*.ts` client, `hooks/queries/use-*.ts` hook, and `types/*.ts` type file — new features extend this triplet rather than introducing a new pattern.

## Getting Started

### Prerequisites

- Node.js 20+
- The NexBill backend running locally (default `http://localhost:4000`) — a NestJS/Prisma/PostgreSQL service maintained in a separate repository

### Installation

```bash
git clone <this-repo-url>
cd nexbill-app
npm install
```

### Environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login page; authenticate against a running backend instance to reach the dashboard.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Authentication & Sessions

1. User submits credentials on `/` → backend issues a JWT (`access_token`, 24h lifetime, no refresh token).
2. The token is persisted via `lib/auth.ts` and attached as `Authorization: Bearer <token>` to every request by the Axios interceptor in `lib/api/client.ts`.
3. `AuthContext` hydrates the current user/role on app load.
4. On any `401` response, the interceptor clears the session and redirects to `/` — there is no silent refresh, so an expired token always routes back to login.
5. Route-level UI is gated by role via `config/route-access.ts`; this is a UX convenience only — the backend independently enforces every permission.

## Contributing

This is a private, actively developed project. If you have access to the repo:

1. Create a feature branch from `main`
2. Keep changes scoped to one module/domain per PR where possible
3. Run `npm run lint` before opening a PR
4. Follow the existing `api client → query hook → types` pattern when adding a new domain

## License

Proprietary — all rights reserved.
