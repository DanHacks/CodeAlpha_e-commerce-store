# SparkShop Backend (MVP - In-memory)

## Run
```bash
cd backend
npm i
npm run dev
```

Server: http://localhost:8081
Health: GET /health

## Notes
- This MVP uses an **in-memory** store so Postman testing works immediately.
- JWT tokens are required for most endpoints.
- Admin credentials are seeded from env/defaults:
  - Email: hydan@codealpha.com
  - Password: CodeAlpha@Admin

