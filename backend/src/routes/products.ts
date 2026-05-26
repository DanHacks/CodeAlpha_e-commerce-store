import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { Product } from "../types.js";

export const productsRouter = Router();

// GET /api/products — public, supports ?search=&category=&sort=&page=&limit=
productsRouter.get("/", (req, res) => {
  const { search = "", category, sort = "newest", page = "1", limit = "24" } = req.query as Record<string, string>;
  let list = db.products.slice();
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }
  if (category) list = list.filter((p) => p.category === category);
  if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "newest")     list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const total = list.length;
  res.json({ data: list.slice((p - 1) * l, p * l), page: p, limit: l, total });
});

// GET /api/products/:id — public
productsRouter.get("/:id", (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ data: product });
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  stock: z.number().int().nonnegative(),
  image: z.string().url().or(z.string().startsWith("data:")),
  images: z.array(z.string()).optional(),
});

// POST /api/products — admin
productsRouter.post("/", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const now = new Date().toISOString();
    const product: Product = { id: "p_" + Date.now(), createdAt: now, updatedAt: now, ...body };
    db.products.unshift(product);
    res.status(201).json({ data: product });
  } catch (e) { next(e); }
});

// PATCH /api/products/:id — admin
productsRouter.patch("/:id", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const body = productSchema.partial().parse(req.body);
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    db.products[idx] = { ...db.products[idx], ...body, updatedAt: new Date().toISOString() };
    res.json({ data: db.products[idx] });
  } catch (e) { next(e); }
});

// DELETE /api/products/:id — admin
productsRouter.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: "Product not found" });
  res.status(204).end();
});
