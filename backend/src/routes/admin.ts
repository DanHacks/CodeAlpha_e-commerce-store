import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { OrderStatus } from "../types.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

// GET /api/admin/orders
adminRouter.get("/orders", (req, res) => {
  const { status } = req.query as { status?: OrderStatus };
  let list = db.orders.slice();
  if (status) list = list.filter((o) => o.status === status);
  res.json({ data: list });
});

// PATCH /api/admin/orders/:id — update status
adminRouter.patch("/orders/:id", (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "failed"]),
    }).parse(req.body);
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = status;
    res.json({ data: order });
  } catch (e) { next(e); }
});

// DELETE /api/admin/orders/:id
adminRouter.delete("/orders/:id", (req, res) => {
  const before = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== req.params.id);
  if (db.orders.length === before) return res.status(404).json({ error: "Order not found" });
  res.status(204).end();
});

// GET /api/admin/customers
adminRouter.get("/customers", (_req, res) => {
  const list = db.users
    .filter((u) => u.role === "customer")
    .map((u) => {
      const orders = db.orders.filter((o) => o.userId === u.id);
      return {
        id: u.id, name: u.name, email: u.email, createdAt: u.createdAt,
        orders: orders.length,
        spent: orders.reduce((s, o) => s + o.total, 0),
      };
    });
  res.json({ data: list });
});

// GET /api/admin/stats — KPIs
adminRouter.get("/stats", (_req, res) => {
  const revenue = db.orders.filter((o) => o.status !== "cancelled" && o.status !== "failed")
    .reduce((s, o) => s + o.total, 0);
  const units = db.orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
  const lowStock = db.products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = db.products.filter((p) => p.stock === 0).length;
  res.json({
    data: {
      revenue, units, lowStock, outOfStock,
      products: db.products.length,
      customers: db.users.filter((u) => u.role === "customer").length,
      orders: db.orders.length,
    },
  });
});
