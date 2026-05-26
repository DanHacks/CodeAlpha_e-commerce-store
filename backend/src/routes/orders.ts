import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { Order } from "../types.js";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  shipping: z.object({
    name: z.string().min(1), address: z.string().min(1),
    city: z.string().min(1), zip: z.string().min(1),
    country: z.string().optional(),
  }),
  paymentMethod: z.enum(["card", "paypal", "bank", "applepay", "googlepay", "crypto", "mpesa"]),
});

// POST /api/orders — customer creates a pending order
ordersRouter.post("/", requireAuth, requireRole("customer", "admin"), (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const items = body.items.map((it) => {
      const product = db.products.find((p) => p.id === it.productId);
      if (!product) throw Object.assign(new Error(`Product ${it.productId} not found`), { status: 404 });
      if (product.stock < it.quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 400 });
      return { productId: product.id, name: product.name, price: product.price, quantity: it.quantity };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: Order = {
      id: "o_" + Date.now(),
      userId: req.user!.sub,
      items, total, status: "pending",
      paymentMethod: body.paymentMethod,
      shipping: body.shipping,
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);
    res.status(201).json({ data: order });
  } catch (e) { next(e); }
});

// GET /api/orders — current user's orders
ordersRouter.get("/", requireAuth, (req, res) => {
  const list = db.orders.filter((o) => o.userId === req.user!.sub);
  res.json({ data: list });
});

// GET /api/orders/:id — owner or admin
ordersRouter.get("/:id", requireAuth, (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user!.sub && req.user!.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json({ data: order });
});
