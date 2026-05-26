import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const categoriesRouter = Router();

// GET /api/categories — public
categoriesRouter.get("/", (_req, res) => {
  const inUse = Array.from(new Set(db.products.map((p) => p.category).filter(Boolean)));
  const all = Array.from(new Set([...inUse, ...db.categories])).sort();
  res.json({ data: all });
});

// POST /api/categories — admin
categoriesRouter.post("/", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    if (db.categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: "Category already exists" });
    }
    db.categories.push(name);
    res.status(201).json({ data: name });
  } catch (e) { next(e); }
});

// PATCH /api/categories/:name — admin (rename)
categoriesRouter.patch("/:name", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const old = req.params.name;
    db.products = db.products.map((p) => (p.category === old ? { ...p, category: name } : p));
    db.categories = db.categories.map((c) => (c === old ? name : c));
    res.json({ data: name });
  } catch (e) { next(e); }
});

// DELETE /api/categories/:name — admin (optional ?reassignTo=)
categoriesRouter.delete("/:name", requireAuth, requireRole("admin"), (req, res) => {
  const old = req.params.name;
  const reassign = (req.query.reassignTo as string) || "";
  db.products = db.products.map((p) => (p.category === old ? { ...p, category: reassign } : p));
  db.categories = db.categories.filter((c) => c !== old);
  res.status(204).end();
});
