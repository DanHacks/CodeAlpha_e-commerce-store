# TODO

## Frontend↔Backend wiring (no UI/UX changes)
- [x] Create `frontend/src/lib/api.ts` with base URL + JWT bearer attach + error normalization

- [x] Update `frontend/src/context/AuthContext.tsx` to use backend `/api/auth/*` and `/api/auth/me`

- [ ] Update `frontend/src/context/ProductsContext.tsx` to fetch from `/api/products` and `/api/products/:id`


- [x] Update `frontend/src/pages/Checkout.tsx` to POST `/api/orders`

- [x] Update `frontend/src/pages/Dashboard.tsx` to GET `/api/orders`



- [ ] Update `frontend/src/lib/upload.ts` to POST `/api/uploads/image`
- [ ] Wire admin pages data calls to backend admin endpoints (logic only)
- [ ] Start backend + frontend and smoke test: auth, product listing, product details, checkout, dashboard, admin order update

