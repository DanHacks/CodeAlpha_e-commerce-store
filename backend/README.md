# SparkShop Backend — Node + TypeScript API

REST API that powers the SparkShop storefront and admin console.
Built with **Node.js**, **TypeScript**, **Express**, **Zod**, and **JWT** auth.

> **Author:** Hydan Koech
> **License:** MIT

---

## 🚀 Quick start

```bash
cd backend
npm install          # or bun install
cp .env.example .env
npm run dev          # tsx watch on http://localhost:4000
```

Health check:
```bash
curl http://localhost:4000/health
```

Build for production:
```bash
npm run build && npm start
```

---

## 📁 Folder structure

```
backend/
├── src/
│   ├── index.ts                # express bootstrap
│   ├── db.ts                   # in-memory store (swap for Postgres)
│   ├── types.ts                # shared TS types
│   ├── middleware/
│   │   ├── auth.ts             # requireAuth + requireRole
│   │   └── error.ts            # JSON error handler
│   └── routes/
│       ├── auth.ts             # register / login / refresh / me
│       ├── products.ts         # public read, admin write
│       ├── categories.ts       # admin CRUD
│       ├── orders.ts           # customer create + list
│       ├── payments.ts         # 7 providers (see below)
│       ├── uploads.ts          # multipart image upload(s)
│       └── admin.ts            # admin orders, customers, KPI stats
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🔐 Authentication

All protected routes use `Authorization: Bearer <accessToken>`.
Login or register to receive both `accessToken` (15 min) and `refreshToken` (7 days).
Roles: `customer` and `admin`. The admin user is bootstrapped on first request
from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.

---

## 📡 REST endpoints

### Auth · `/api/auth`
| Method | Path        | Auth | Body |
|--------|-------------|------|------|
| POST   | `/register` | —    | `{ name, email, password }` |
| POST   | `/login`    | —    | `{ email, password }` |
| POST   | `/refresh`  | —    | `{ refreshToken }` |
| POST   | `/logout`   | user | — |
| GET    | `/me`       | user | — |

### Products · `/api/products`
| Method | Path           | Auth   | Notes |
|--------|----------------|--------|-------|
| GET    | `/`            | public | `?search=&category=&sort=&page=&limit=` |
| GET    | `/:id`         | public | — |
| POST   | `/`            | admin  | `{ name, description, price, category, stock, image, images[] }` |
| PATCH  | `/:id`         | admin  | partial update |
| DELETE | `/:id`         | admin  | — |

### Categories · `/api/categories`
| Method | Path           | Auth  |
|--------|----------------|-------|
| GET    | `/`            | public |
| POST   | `/`            | admin |
| PATCH  | `/:name`       | admin (rename) |
| DELETE | `/:name?reassignTo=` | admin |

### Orders · `/api/orders`
| Method | Path     | Auth     |
|--------|----------|----------|
| POST   | `/`      | customer |
| GET    | `/`      | user (own orders) |
| GET    | `/:id`   | owner or admin |

### Payments · `/api/payments`
Each provider has an intent/create step and a confirmation (webhook or capture):

| Method | Path                       | Provider |
|--------|----------------------------|----------|
| POST   | `/stripe/intent`           | Card (Stripe) |
| POST   | `/stripe/webhook`          | Card (Stripe) |
| POST   | `/paypal/create`           | PayPal |
| POST   | `/paypal/capture`          | PayPal |
| POST   | `/wallet/intent`           | Apple Pay / Google Pay (`wallet`) |
| POST   | `/crypto/intent`           | USDT / BTC / ETH / BNB |
| POST   | `/crypto/confirm`          | Crypto |
| POST   | `/mpesa/stkpush`           | M-Pesa (Safaricom Daraja) |
| POST   | `/mpesa/callback`          | M-Pesa |
| POST   | `/bank/intent`             | Manual bank transfer |
| POST   | `/bank/webhook`            | Bank reconciliation |
| POST   | `/admin/confirm`           | Admin manual mark-as-paid |

### Admin · `/api/admin`
| Method | Path           | Auth  |
|--------|----------------|-------|
| GET    | `/orders`      | admin (`?status=`) |
| PATCH  | `/orders/:id`  | admin (status update) |
| DELETE | `/orders/:id`  | admin |
| GET    | `/customers`   | admin |
| GET    | `/stats`       | admin (KPI: revenue, units, low/out of stock) |

### Uploads · `/api/uploads`
| Method | Path       | Auth  | Field |
|--------|------------|-------|-------|
| POST   | `/image`   | admin | `file`  (single image, ≤5MB) |
| POST   | `/images`  | admin | `files` (up to 5 images) |

---

## 🧪 Sample requests

```bash
# Register a customer
curl -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Asha","email":"asha@example.com","password":"secret123"}'

# Log in as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"hydan@codealpha.com","password":"CodeAlpha@Admin"}'

# Create a product (admin token)
curl -X POST http://localhost:4000/api/products \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"name":"Test","price":19,"category":"Home","stock":5,"description":"","image":"https://x/y.jpg"}'

# Customer creates an order
curl -X POST http://localhost:4000/api/orders \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"items":[{"productId":"p_123","quantity":1}],"paymentMethod":"mpesa","shipping":{"name":"Asha","address":"1 Riverside","city":"Nairobi","zip":"00100","country":"Kenya"}}'
```

---

## 🛣️ Production roadmap

1. Replace `db.ts` with **PostgreSQL** + a query builder (Kysely / Drizzle) and add migrations.
2. Replace the data-URL image hack in `uploads.ts` with S3 / Cloudflare R2 + signed URLs.
3. Wire real provider SDKs: `stripe`, `@paypal/checkout-server-sdk`, Safaricom Daraja, Binance Pay.
4. Verify webhook signatures (Stripe, M-Pesa, Bank, Binance) before mutating state.
5. Add **rate limiting** (`express-rate-limit`), **helmet**, request logging (`pino-http`).
6. Persist refresh tokens with rotation + revocation table for proper logout-everywhere.
7. Add an audit-log table for admin mutations.
8. Add automated tests (`vitest` + `supertest`).
