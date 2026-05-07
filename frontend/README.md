# SparkShop ⚡

A modern e-commerce MVP built with **React + Vite + TypeScript + Tailwind**. Features a full storefront, cart, multi-method checkout (Card / PayPal / Binance Pay), customer dashboard, and a complete super-admin console with sidebar navigation, image uploads, and CRUD product management.

> **Author:** Hydan Koech
> **Branding:** orange (`#F97316`) + deep navy (`#1E293B`), 3D SparkShop logo used as both favicon and in-app brand mark.

---

## ✨ Features

### Storefront
- Hero landing page with curated product grid
- Search + category filtering
- Product detail page with quantity selector
- Cart with persistent localStorage state
- **Checkout with 3 payment methods**: Credit/Debit Card (number + expiry + CVV), PayPal (email redirect), Binance Pay (USDT transfer)
- Checkout state machine: `form → processing → success | error`
- About + Contact pages
- Customer dashboard with order history
- Auth (login / register) — mocked, frontend only

### Super Admin Console
Sidebar layout (collapsible) with five sections:
1. **Overview** — KPI cards, revenue, low-stock alerts
2. **Products** — full CRUD, search/filter/sort, image upload (file → base64) or URL paste
3. **Orders** — advance status, reset, delete, status filters
4. **Customers** — mocked customer roster
5. **Settings** — store profile + danger zone (catalog reset)

Admin-only routes are protected by `<AdminRoute>`.

### 🔐 Super Admin Credentials
```
Email:    hydan@codealpha.com
Password: CodeAlpha@Admin
```

### 💳 Payment test cases (frontend simulation)
| Method      | Trigger failure with                |
|-------------|-------------------------------------|
| Card        | any card number ending in `0000`    |
| PayPal      | email starting with `fail@`         |
| Binance Pay | Pay ID equal to `fail`              |

---

## 🧱 Tech Stack
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 (semantic HSL design tokens)
- shadcn/ui (Radix primitives) + lucide-react icons
- React Router v6, TanStack Query, Sonner toasts

## 🚀 Run locally
```bash
bun install     # or npm install
bun run dev     # or npm run dev
```
Visit http://localhost:8080. No environment variables required for the MVP — all state is mocked and persisted in `localStorage`.

## 📁 Project structure
```
src/
├── assets/                # Logo + hero imagery
├── components/            # Layout, Navbar, Footer, ProductCard, AdminLayout, AdminRoute
├── context/               # AuthContext, CartContext, ProductsContext
├── data/products.ts       # Seed catalog
├── lib/upload.ts          # Mocked image upload service
├── pages/                 # Storefront pages
│   └── admin/             # Overview, Products, Orders, Customers, Settings
└── index.css              # Design tokens
```

## 🌍 Deployment
Static SPA. Build with `bun run build` and deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages).

---

# 🛣️ Backend Roadmap & API Guide

This section is the spec to follow when migrating SparkShop from mocked frontend state to a real backend. The frontend already calls these endpoints conceptually via context providers — wire each provider to the matching REST routes below.

## Suggested stack
- **Runtime:** Node.js + Express (or NestJS / FastAPI)
- **DB:** PostgreSQL with Row Level Security
- **Auth:** JWT (access + refresh)
- **File storage:** S3-compatible bucket (AWS S3 / Cloudflare R2) for product images
- **Payments:** Stripe (cards), PayPal Orders v2, Binance Pay merchant API
- **Validation:** Zod (TS) or Pydantic (Py)

## Environment variables (server)
```
DATABASE_URL=postgres://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STORAGE_BUCKET_URL=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
BINANCE_PAY_API_KEY=...
BINANCE_PAY_API_SECRET=...
ADMIN_EMAIL=hydan@codealpha.com
```

## Data model (Postgres)
```sql
users           (id, name, email UNIQUE, password_hash, created_at)
user_roles      (id, user_id FK, role ENUM('admin','customer'))
products        (id, name, description, price NUMERIC, category, stock INT,
                 image_url, created_at, updated_at)
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
| GET    | `/api/products`       | public   | `?search=&category=&sort=&page=` |
| GET    | `/api/products/:id`   | public   | — |
| POST   | `/api/products`       | admin    | `{ name, description, price, category, stock, image_url }` |
| PATCH  | `/api/products/:id`   | admin    | partial product |
| DELETE | `/api/products/:id`   | admin    | — |
| POST   | `/api/uploads/image`  | admin    | `multipart/form-data` → `{ url }` |

### Orders
| Method | Path                       | Auth      | Body / Notes |
|--------|----------------------------|-----------|--------------|
| POST   | `/api/orders`              | customer  | `{ items:[{product_id,quantity}], shipping, payment_method }` → creates order in `pending` |
| GET    | `/api/orders`              | customer  | own orders only |
| GET    | `/api/orders/:id`          | customer/admin | RLS enforced |
| GET    | `/api/admin/orders`        | admin     | all orders, supports `?status=` |
| PATCH  | `/api/admin/orders/:id`    | admin     | `{ status: 'Processing'|'Shipped'|'Delivered' }` |
| DELETE | `/api/admin/orders/:id`    | admin     | — |

### Payments
| Method | Path                              | Notes |
|--------|-----------------------------------|-------|
| POST   | `/api/payments/stripe/intent`     | `{ order_id }` → returns `client_secret` for Stripe Elements |
| POST   | `/api/payments/stripe/webhook`    | Stripe → mark order `paid` / `failed` |
| POST   | `/api/payments/paypal/create`     | `{ order_id }` → returns PayPal `approve_url` |
| POST   | `/api/payments/paypal/capture`    | `{ paypal_order_id }` → captures and updates order |
| POST   | `/api/payments/binance/create`    | `{ order_id }` → returns `qrcode_url` + `prepay_id` |
| POST   | `/api/payments/binance/webhook`   | Binance Pay → confirm payment & update order |

### Admin / Customers
| Method | Path                       | Auth  |
|--------|----------------------------|-------|
| GET    | `/api/admin/customers`     | admin |
| GET    | `/api/admin/stats`         | admin → KPIs (revenue, units, low-stock) |

## Frontend → backend mapping
| Frontend file                  | Replace mocked logic with                 |
|--------------------------------|-------------------------------------------|
| `context/AuthContext.tsx`      | `/api/auth/*`                             |
| `context/ProductsContext.tsx`  | `/api/products` (CRUD)                    |
| `context/CartContext.tsx`      | keep client-side; persist server-side optionally |
| `pages/Checkout.tsx`           | `/api/orders` then provider-specific create/capture |
| `pages/admin/Orders.tsx`       | `/api/admin/orders` + PATCH               |
| `lib/upload.ts`                | `POST /api/uploads/image` (multipart)     |

## Implementation order (recommended)
1. **DB schema** — provision Postgres, create tables, enable RLS.
2. **Auth** — register/login + JWT, wire `AuthContext`.
3. **Products CRUD + image upload** — wire admin panel.
4. **Orders** — create + list endpoints, wire dashboard.
5. **Stripe (cards)** — payment intent + webhook.
6. **PayPal Orders v2** — create + capture flow.
7. **Binance Pay** — order create + webhook signature verification.
8. **Admin stats endpoint** — replace overview KPIs.
9. **Hardening** — rate limiting, input validation (Zod), audit logs.

## 📜 License
MIT — © 2026 **Hydan Koech**
