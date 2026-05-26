# SparkShop ⚡

A modern e-commerce MVP with a **React + Vite + TypeScript + Tailwind** storefront and a **Node + TypeScript + Express** REST backend. Features a full storefront, cart, **7 global payment methods**, automatic currency detection by device location, multi-photo product galleries, customer dashboard, and a complete super-admin console with sidebar navigation, image uploads, and CRUD product management.

> **Author:** Hydan Koech
> **Branding:** orange (`#F97316`) + deep navy (`#1E293B`), 3D SparkShop logo used as both favicon and in-app brand mark.

---

## ✨ Features

### Storefront
- Hero landing page with curated product grid (36 seeded items)
- Search + category filtering
- **Product detail page with photo gallery** (main image + up to 5 showcase photos with thumbnail switcher)
- Cart with persistent localStorage state
- **Checkout with 7 global payment methods**:
  Credit/Debit Card · PayPal · Apple Pay · Google Pay · Crypto (USDT/BTC/ETH/BNB) · M-Pesa · Bank Transfer
- Checkout state machine: `form → processing → success | error`
- **Auto currency** based on device locale + timezone (USD, EUR, GBP, NGN, KES, ZAR, INR, JPY, …) with manual override in the navbar
- About + Contact pages
- Customer dashboard with order history
- Auth: customers register/log in and land on their dashboard; admin logs in with reserved credentials and lands on the admin console

### Super Admin Console
Sidebar layout (collapsible) with six sections:
1. **Overview** — KPI cards, revenue, low-stock alerts, recent orders
2. **Products** — full CRUD, search/filter/sort, **main photo + showcase gallery (multi-upload, drag-drop)**, set-as-main / remove per photo
3. **Categories** — create, rename, delete (with reassignment), optimistic UI
4. **Orders** — advance status, reset, delete, status filters
5. **Customers** — customer roster with order count + lifetime spend
6. **Settings** — store profile + danger zone (catalog reset)

Admin-only routes are protected by `<AdminRoute>`.

### 🔐 Super Admin Credentials
```
Email:    hydan@codealpha.com
Password: CodeAlpha@Admin
```

### 💳 Payment test cases (frontend simulation)
| Method        | Trigger failure with                |
|---------------|-------------------------------------|
| Card          | any card number ending in `0000`    |
| PayPal        | email starting with `fail@`         |
| Bank Transfer | transfer reference equal to `fail`  |
| Crypto        | transaction hash equal to `fail`    |
| M-Pesa        | phone number ending in `0000`       |
| Apple/Google Pay | device prompt — always succeeds in MVP |

---

## 🧱 Tech Stack

**Frontend**
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 (semantic HSL design tokens)
- shadcn/ui (Radix primitives) + lucide-react icons
- React Router v6, TanStack Query, Sonner toasts

**Backend** (`./backend`)
- Node.js + TypeScript + Express 4
- JWT auth (access + refresh) with role-based middleware
- Zod request validation
- Multer for multipart image upload

## 🚀 Run locally

```bash
# Frontend
bun install     # or npm install
bun run dev     # http://localhost:8080

# Backend (separate terminal)
cd backend
npm install
cp .env.example .env
npm run dev     # http://localhost:4000
```

No env vars required for the frontend MVP — all state is mocked and persisted in `localStorage`.

## 📁 Project structure
```
.
├── src/                       # Frontend (React + Vite)
│   ├── assets/                # Logo + hero imagery
│   ├── components/            # Layout, Navbar, Footer, ProductCard, AdminLayout, AdminRoute
│   ├── context/               # Auth, Cart, Products, Currency
│   ├── data/products.ts       # Seed catalog (36 items, multi-image support)
│   ├── lib/upload.ts          # Image upload service (swap with /api/uploads)
│   ├── pages/                 # Storefront pages
│   │   └── admin/             # Overview, Products, Categories, Orders, Customers, Settings
│   └── index.css              # Design tokens
└── backend/                   # Node + TypeScript REST API (see backend/README.md)
    ├── src/
    │   ├── index.ts           # Express bootstrap
    │   ├── db.ts              # In-memory store (swap for Postgres)
    │   ├── middleware/        # auth (JWT + roles), error handler
    │   └── routes/            # auth, products, categories, orders, payments, uploads, admin
    ├── package.json
    └── tsconfig.json
```

## 🌍 Deployment
Static SPA frontend (`bun run build` → `dist/`), Node API (`cd backend && npm run build && npm start`) deployable to any Node host (Render, Railway, Fly, AWS).

---

# 🛣️ Backend Roadmap & API Guide

This section is the spec to follow when wiring the frontend to the real backend. The frontend already calls these endpoints conceptually via context providers — wire each provider to the matching REST routes below. A working reference implementation lives in [`backend/`](./backend).

## Suggested stack
- **Runtime:** Node.js + Express (or NestJS / FastAPI)
- **DB:** PostgreSQL with Row Level Security
- **Auth:** JWT (access + refresh)
- **File storage:** S3-compatible bucket (AWS S3 / Cloudflare R2) for product images
- **Payments:** Stripe (cards + Apple/Google Pay), PayPal Orders v2, Binance Pay or on-chain (crypto), Safaricom Daraja (M-Pesa), manual bank transfer reconciliation
- **Validation:** Zod (TS) or Pydantic (Py)

## Environment variables (server)
See [`backend/.env.example`](./backend/.env.example) for the full list.

## Data model (Postgres)
```sql
users           (id, name, email UNIQUE, password_hash, created_at)
user_roles      (id, user_id FK, role ENUM('admin','customer'))
products        (id, name, description, price NUMERIC, category, stock INT,
                 image_url, image_urls TEXT[], created_at, updated_at)
categories      (id, name UNIQUE)
orders          (id, user_id FK, total NUMERIC, status ENUM, payment_method,
                 payment_ref, shipping_address JSONB, created_at)
order_items     (id, order_id FK, product_id FK, name, price, quantity)
payments        (id, order_id FK, provider, provider_ref, status, raw JSONB)
```

## REST API endpoints

### Auth
| Method | Path                  | Body / Notes                       | Returns |
|--------|-----------------------|------------------------------------|---------|
| POST   | `/api/auth/register`  | `{ name, email, password }`        | `{ user, accessToken, refreshToken }` |
| POST   | `/api/auth/login`     | `{ email, password }`              | `{ user, accessToken, refreshToken }` |
| POST   | `/api/auth/refresh`   | `{ refreshToken }`                 | `{ accessToken }` |
| POST   | `/api/auth/logout`    | invalidate refresh token           | `204` |
| GET    | `/api/auth/me`        | Bearer token                       | `{ user }` |

### Products (public read, admin write)
| Method | Path                  | Auth     | Body |
|--------|-----------------------|----------|------|
| GET    | `/api/products`       | public   | `?search=&category=&sort=&page=&limit=` |
| GET    | `/api/products/:id`   | public   | — |
| POST   | `/api/products`       | admin    | `{ name, description, price, category, stock, image, images[] }` |
| PATCH  | `/api/products/:id`   | admin    | partial product |
| DELETE | `/api/products/:id`   | admin    | — |
| POST   | `/api/uploads/image`  | admin    | `multipart/form-data` (field `file`) → `{ url }` |
| POST   | `/api/uploads/images` | admin    | `multipart/form-data` (field `files`, ≤5) → `{ urls[] }` |

### Categories
| Method | Path                          | Auth   |
|--------|-------------------------------|--------|
| GET    | `/api/categories`             | public |
| POST   | `/api/categories`             | admin  |
| PATCH  | `/api/categories/:name`       | admin (rename) |
| DELETE | `/api/categories/:name?reassignTo=` | admin |

### Orders
| Method | Path                       | Auth      | Body / Notes |
|--------|----------------------------|-----------|--------------|
| POST   | `/api/orders`              | customer  | `{ items:[{productId,quantity}], shipping, paymentMethod }` → creates order in `pending` |
| GET    | `/api/orders`              | customer  | own orders only |
| GET    | `/api/orders/:id`          | owner/admin | RLS enforced |
| GET    | `/api/admin/orders`        | admin     | all orders, supports `?status=` |
| PATCH  | `/api/admin/orders/:id`    | admin     | `{ status }` |
| DELETE | `/api/admin/orders/:id`    | admin     | — |

### Payments
| Method | Path                              | Provider |
|--------|-----------------------------------|----------|
| POST   | `/api/payments/stripe/intent`     | Card (Stripe) — `{ orderId }` returns `clientSecret` |
| POST   | `/api/payments/stripe/webhook`    | Stripe → mark order `paid` / `failed` |
| POST   | `/api/payments/paypal/create`     | PayPal — returns `approveUrl` |
| POST   | `/api/payments/paypal/capture`    | PayPal — captures + updates order |
| POST   | `/api/payments/wallet/intent`     | Apple Pay / Google Pay (`wallet`) |
| POST   | `/api/payments/crypto/intent`     | USDT / BTC / ETH / BNB → address + amount |
| POST   | `/api/payments/crypto/confirm`    | Crypto — verifies tx hash |
| POST   | `/api/payments/mpesa/stkpush`     | M-Pesa STK push |
| POST   | `/api/payments/mpesa/callback`    | M-Pesa callback |
| POST   | `/api/payments/bank/intent`       | Returns bank instructions + reference code |
| POST   | `/api/payments/bank/webhook`      | Banking provider → mark paid |
| POST   | `/api/payments/admin/confirm`     | Admin manual mark-as-paid |

### Admin / Customers
| Method | Path                       | Auth  |
|--------|----------------------------|-------|
| GET    | `/api/admin/customers`     | admin |
| GET    | `/api/admin/stats`         | admin → KPIs (revenue, units, low/out of stock) |

## Frontend → backend mapping
| Frontend file                  | Replace mocked logic with                 |
|--------------------------------|-------------------------------------------|
| `context/AuthContext.tsx`      | `/api/auth/*`                             |
| `context/ProductsContext.tsx`  | `/api/products` + `/api/categories` (CRUD)|
| `context/CartContext.tsx`      | keep client-side; persist server-side optionally |
| `pages/Checkout.tsx`           | `/api/orders` then provider-specific create/capture |
| `pages/admin/Orders.tsx`       | `/api/admin/orders` + PATCH               |
| `lib/upload.ts`                | `POST /api/uploads/image` (multipart)     |

## Implementation order (recommended)
1. **DB schema** — provision Postgres, create tables, enable RLS.
2. **Auth** — register/login + JWT, wire `AuthContext`.
3. **Products CRUD + image upload** (single + multi) — wire admin panel.
4. **Orders** — create + list endpoints, wire dashboard.
5. **Stripe (cards)** — payment intent + webhook.
6. **PayPal Orders v2** — create + capture flow.
7. **Apple Pay / Google Pay** — Stripe Payment Request API wrapper.
8. **Crypto** — Binance Pay or on-chain verification (USDT/BTC/ETH/BNB).
9. **M-Pesa** — Safaricom Daraja STK push + callback.
10. **Bank Transfer** — generate per-order reference, reconcile via webhook or admin confirmation.
11. **Admin stats endpoint** — replace overview KPIs.
12. **Hardening** — rate limiting, input validation (Zod), webhook signature verification, audit logs.

> **Full backend reference + sample curl requests:** see [`backend/README.md`](./backend/README.md).

## 📜 License
MIT — © 2026 **Hydan Koech**
