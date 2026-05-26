import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const paymentsRouter = Router();

// Helper — locate order owned by the caller
function findOrderForUser(orderId: string, userId: string) {
  return db.orders.find((o) => o.id === orderId && o.userId === userId);
}

// ─── STRIPE (cards) ─────────────────────────────────────────────────────────
// POST /api/payments/stripe/intent — returns Stripe payment intent client_secret
paymentsRouter.post("/stripe/intent", requireAuth, (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    // TODO: const intent = await stripe.paymentIntents.create({ amount: order.total*100, currency: 'usd' });
    res.json({ clientSecret: `pi_mock_${order.id}_secret`, amount: order.total, currency: "usd" });
  } catch (e) { next(e); }
});

// POST /api/payments/stripe/webhook — Stripe → mark paid/failed
paymentsRouter.post("/stripe/webhook", (req, res) => {
  // TODO: verify req.headers['stripe-signature'] with STRIPE_WEBHOOK_SECRET
  const { orderId, status } = req.body || {};
  const order = db.orders.find((o) => o.id === orderId);
  if (order) order.status = status === "succeeded" ? "paid" : "failed";
  res.json({ received: true });
});

// ─── PAYPAL ─────────────────────────────────────────────────────────────────
paymentsRouter.post("/paypal/create", requireAuth, (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ paypalOrderId: `PAYPAL_${order.id}`, approveUrl: `https://www.paypal.com/checkoutnow?token=${order.id}` });
  } catch (e) { next(e); }
});

paymentsRouter.post("/paypal/capture", requireAuth, (req, res, next) => {
  try {
    const { paypalOrderId } = z.object({ paypalOrderId: z.string() }).parse(req.body);
    const id = paypalOrderId.replace(/^PAYPAL_/, "");
    const order = db.orders.find((o) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = "paid"; order.paymentRef = paypalOrderId;
    res.json({ data: order });
  } catch (e) { next(e); }
});

// ─── APPLE PAY / GOOGLE PAY (wraps Stripe Payment Request API) ──────────────
paymentsRouter.post("/wallet/intent", requireAuth, (req, res, next) => {
  try {
    const { orderId, wallet } = z.object({
      orderId: z.string(),
      wallet: z.enum(["applepay", "googlepay"]),
    }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ wallet, clientSecret: `pi_mock_${order.id}_${wallet}_secret`, amount: order.total, currency: "usd" });
  } catch (e) { next(e); }
});

// ─── CRYPTO (Binance Pay / on-chain) ────────────────────────────────────────
paymentsRouter.post("/crypto/intent", requireAuth, (req, res, next) => {
  try {
    const { orderId, coin } = z.object({
      orderId: z.string(),
      coin: z.enum(["USDT", "BTC", "ETH", "BNB"]),
    }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const addresses: Record<string, string> = {
      USDT: "TXJ7n9aB4kQ2vL8mP5oR1nE6dF3sC0uW9z",
      BTC:  "bc1qsparkshop8n7m6q5w4e3r2t1y0p9o8i7u6y5t4",
      ETH:  "0x9F4eA1c7B8d2C3a4E5f6A7b8C9d0E1f2A3b4C5d6",
      BNB:  "bnb1sparkshop9k8j7h6g5f4d3s2a1q0w9e8r7t6y5u",
    };
    res.json({ coin, address: addresses[coin], amount: order.total, memo: order.id });
  } catch (e) { next(e); }
});

paymentsRouter.post("/crypto/confirm", requireAuth, (req, res, next) => {
  try {
    const { orderId, txHash } = z.object({ orderId: z.string(), txHash: z.string().min(8) }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    // TODO: verify on chain or via Binance Pay API
    order.status = "paid"; order.paymentRef = txHash;
    res.json({ data: order });
  } catch (e) { next(e); }
});

// ─── M-PESA (Safaricom STK push) ────────────────────────────────────────────
paymentsRouter.post("/mpesa/stkpush", requireAuth, (req, res, next) => {
  try {
    const { orderId, phone } = z.object({ orderId: z.string(), phone: z.string().regex(/^\+?\d{9,15}$/) }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    // TODO: call Safaricom Daraja API
    res.json({ checkoutRequestId: `MPESA_${order.id}`, phone, amount: order.total });
  } catch (e) { next(e); }
});

paymentsRouter.post("/mpesa/callback", (req, res) => {
  const { orderId, resultCode, mpesaReceiptNumber } = req.body || {};
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = resultCode === 0 ? "paid" : "failed";
    order.paymentRef = mpesaReceiptNumber;
  }
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ─── BANK TRANSFER ──────────────────────────────────────────────────────────
paymentsRouter.post("/bank/intent", requireAuth, (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
    const order = findOrderForUser(orderId, req.user!.sub);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({
      bank: "SparkShop Trust Bank",
      accountName: "SparkShop Ltd",
      accountNumber: "8821 4476 02",
      swift: "SPRKUS33XXX",
      reference: order.id,
      amount: order.total,
    });
  } catch (e) { next(e); }
});

paymentsRouter.post("/bank/webhook", (req, res) => {
  // TODO: verify signature with BANK_WEBHOOK_SECRET
  const { orderId, reference } = req.body || {};
  const order = db.orders.find((o) => o.id === orderId);
  if (order) { order.status = "paid"; order.paymentRef = reference; }
  res.json({ received: true });
});

// ─── ADMIN MANUAL CONFIRMATION ──────────────────────────────────────────────
paymentsRouter.post("/admin/confirm", requireAuth, requireRole("admin"), (req, res, next) => {
  try {
    const { orderId, ref } = z.object({ orderId: z.string(), ref: z.string().optional() }).parse(req.body);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = "paid"; if (ref) order.paymentRef = ref;
    res.json({ data: order });
  } catch (e) { next(e); }
});
