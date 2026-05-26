// In-memory store. Swap for Postgres in production.
import type { Product, Order, User } from "./types.js";

export const db = {
  users:    [] as User[],
  products: [] as Product[],
  orders:   [] as Order[],
  categories: [] as string[],
};

// Seed admin (password hash is computed lazily in routes/auth)
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hydan@codealpha.com";
