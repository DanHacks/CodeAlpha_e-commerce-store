import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { nanoid } from "nanoid";
import { env } from "./env";
// Allow tsc to be lenient during MVP wiring.
// (Runtime is what Postman verifies.)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _noop = null;
const PORT = env.PORT;
const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const ACCESS_TOKEN_TTL_S = 60 * 15;
const REFRESH_TOKEN_TTL_S = 60 * 60 * 24 * 7;
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
const db = {
    users: new Map(),
    usersByEmail: new Map(),
    products: new Map(),
    orders: new Map(),
};
function signAccessToken(user) {
    return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_S });
}
function signRefreshToken(user) {
    return jwt.sign({ sub: user.id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_S });
}
function authFromHeader(req) {
    const h = req.header("authorization");
    if (!h?.toLowerCase().startsWith("bearer "))
        return null;
    const token = h.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const u = db.users.get(payload.sub);
        return u || null;
    }
    catch {
        return null;
    }
}
function requireAuth(req, res, next) {
    const user = authFromHeader(req);
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
}
function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    if (user.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });
    next();
}
function toProductDTO(p) {
    return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        image: p.image,
    };
}
function toOrderDTO(o) {
    return {
        id: o.id,
        items: o.items,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
    };
}
function seedProducts() {
    if (db.products.size > 0)
        return;
    const now = new Date().toISOString();
    const seed = [
        {
            name: "Spark Coffee Beans",
            description: "Bold roasted beans for your daily brew.",
            price: 18.5,
            category: "Home & Kitchen",
            stock: 25,
            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkEzMTlCIi8+PHRleHQgeD0iMTYiIHk9IjQwIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIj5TcGFya3Nob3A8L3RleHQ+PC9zdmc+",
        },
        {
            name: "Nova LED Desk Lamp",
            description: "Warm, flicker-free light with adjustable head.",
            price: 34.99,
            category: "Home & Kitchen",
            stock: 8,
            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiMxRTI5M0IiLz48dGV4dCB4PSIxNiIgeT0iNDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiPk5vdmEgTGFtcDwvdGV4dD48L3N2Zz4=",
        },
        {
            name: "Orbit Wireless Earbuds",
            description: "Comfort fit with clear calls and punchy bass.",
            price: 49.0,
            category: "Electronics",
            stock: 0,
            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNGRkEzMTlCIi8+PHRleHQgeD0iMTYiIHk9IjQwIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIj5FYXJidWRzPC90ZXh0Pjwvc3ZnPg==",
        },
    ];
    for (const p of seed) {
        const id = nanoid();
        db.products.set(id, { ...p, id, createdAt: now, updatedAt: now });
    }
}
async function ensureAdmin() {
    const email = ADMIN_EMAIL;
    if (db.usersByEmail.has(email))
        return;
    const id = nanoid();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const u = {
        id,
        name: "SparkShop Admin",
        email,
        role: "admin",
        passwordHash,
        createdAt: new Date().toISOString(),
        refreshTokenHash: null,
    };
    db.users.set(id, u);
    db.usersByEmail.set(email, id);
}
seedProducts();
await ensureAdmin();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });
const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const productCreateSchema = z.object({
    name: z.string().min(1),
    description: z.string().default(""),
    price: z.number().nonnegative(),
    category: z.string().default(""),
    stock: z.number().int().nonnegative(),
    image: z.string().min(1),
});
const productPatchSchema = productCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
    message: "Empty patch",
});
const orderCreateSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().min(1),
    })),
    shipping: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        zip: z.string().min(1),
    }),
    payment_method: z.enum(["card", "paypal", "bank"]),
    payment_ref: z.string().optional(),
});
const adminOrderPatchSchema = z.object({
    status: z.enum(["Processing", "Shipped", "Delivered"]),
});
app.post("/api/auth/register", async (req, res) => {
    const body = registerSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const email = body.data.email.toLowerCase();
    if (email === ADMIN_EMAIL)
        return res.status(400).json({ message: "This email is reserved" });
    if (db.usersByEmail.has(email))
        return res.status(409).json({ message: "Email already exists" });
    const id = nanoid();
    const passwordHash = await bcrypt.hash(body.data.password, 10);
    const u = {
        id,
        name: body.data.name,
        email,
        role: "customer",
        passwordHash,
        createdAt: new Date().toISOString(),
        refreshTokenHash: null,
    };
    db.users.set(id, u);
    db.usersByEmail.set(email, id);
    const accessToken = signAccessToken(u);
    const refreshToken = signRefreshToken(u);
    u.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    res.json({
        user: { id: u.id, name: u.name, email: u.email, role: u.role },
        accessToken,
        refreshToken,
    });
});
app.post("/api/auth/login", async (req, res) => {
    const body = loginSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const email = body.data.email.toLowerCase();
    const userId = db.usersByEmail.get(email);
    if (!userId)
        return res.status(401).json({ message: "Invalid credentials" });
    const u = db.users.get(userId);
    const ok = await bcrypt.compare(body.data.password, u.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const accessToken = signAccessToken(u);
    const refreshToken = signRefreshToken(u);
    u.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    res.json({
        user: { id: u.id, name: u.name, email: u.email, role: u.role },
        accessToken,
        refreshToken,
    });
});
app.post("/api/auth/refresh", async (req, res) => {
    const schema = z.object({ refreshToken: z.string().min(1) });
    const body = schema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const rt = body.data.refreshToken;
    let payload;
    try {
        payload = jwt.verify(rt, JWT_REFRESH_SECRET);
    }
    catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    const u = db.users.get(payload.sub);
    if (!u || !u.refreshTokenHash)
        return res.status(401).json({ message: "Invalid refresh token" });
    const ok = await bcrypt.compare(rt, u.refreshTokenHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid refresh token" });
    res.json({ accessToken: signAccessToken(u) });
});
app.post("/api/auth/logout", requireAuth, async (req, res) => {
    const user = req.user;
    user.refreshTokenHash = null;
    res.status(204).send();
});
app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user;
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.get("/api/products", (req, res) => {
    const q = (req.query.search || "").toLowerCase();
    const category = req.query.category || "";
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = 24;
    const sort = req.query.sort || "newest";
    let list = Array.from(db.products.values());
    if (q)
        list = list.filter((p) => [p.name, p.description, p.category].some((s) => s.toLowerCase().includes(q)));
    if (category)
        list = list.filter((p) => p.category === category);
    if (sort === "price-asc")
        list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
        list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "stock-asc")
        list = [...list].sort((a, b) => a.stock - b.stock);
    if (sort === "newest")
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize).map(toProductDTO);
    res.json({ items, total: list.length, page });
});
app.get("/api/products/:id", (req, res) => {
    const p = db.products.get(req.params.id);
    if (!p)
        return res.status(404).json({ message: "Not found" });
    res.json(toProductDTO(p));
});
app.post("/api/products", requireAuth, requireAdmin, (req, res) => {
    const body = productCreateSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const id = nanoid();
    const now = new Date().toISOString();
    const p = {
        id,
        name: body.data.name,
        description: body.data.description,
        price: body.data.price,
        category: body.data.category,
        stock: body.data.stock,
        image: body.data.image,
        createdAt: now,
        updatedAt: now,
    };
    db.products.set(id, p);
    res.status(201).json(toProductDTO(p));
});
app.patch("/api/products/:id", requireAuth, requireAdmin, (req, res) => {
    const body = productPatchSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const p = db.products.get(req.params.id);
    if (!p)
        return res.status(404).json({ message: "Not found" });
    const now = new Date().toISOString();
    const next = { ...p, ...body.data, updatedAt: now };
    db.products.set(p.id, next);
    res.json(toProductDTO(next));
});
app.delete("/api/products/:id", requireAuth, requireAdmin, (req, res) => {
    const p = db.products.get(req.params.id);
    if (!p)
        return res.status(404).json({ message: "Not found" });
    db.products.delete(req.params.id);
    res.status(200).json({ ok: true });
});
app.post("/api/uploads/image", requireAuth, requireAdmin, upload.single("file"), (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: "file is required" });
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    res.json({ url: dataUrl });
});
app.post("/api/orders", requireAuth, (req, res) => {
    const body = orderCreateSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const user = req.user;
    const items = [];
    let total = 0;
    for (const line of body.data.items) {
        const p = db.products.get(line.product_id);
        if (!p)
            return res.status(400).json({ message: `Invalid product ${line.product_id}` });
        if (p.stock < line.quantity)
            return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
        items.push({ name: p.name, quantity: line.quantity, price: p.price });
        total += p.price * line.quantity;
    }
    for (const line of body.data.items) {
        const p = db.products.get(line.product_id);
        p.stock = p.stock - line.quantity;
        p.updatedAt = new Date().toISOString();
        db.products.set(p.id, p);
    }
    const id = nanoid();
    const now = new Date().toISOString();
    const order = {
        id,
        userId: user.id,
        items,
        total,
        status: "Processing",
        payment_method: body.data.payment_method,
        payment_ref: body.data.payment_ref ?? null,
        shipping_address: body.data.shipping,
        createdAt: now,
        paidAt: null,
    };
    db.orders.set(id, order);
    res.status(201).json({ orderId: id, order: toOrderDTO(order) });
});
app.get("/api/orders", requireAuth, (req, res) => {
    const user = req.user;
    const list = Array.from(db.orders.values()).filter((o) => o.userId === user.id);
    res.json({ items: list.map(toOrderDTO) });
});
app.get("/api/orders/:id", requireAuth, (req, res) => {
    const user = req.user;
    const o = db.orders.get(req.params.id);
    if (!o)
        return res.status(404).json({ message: "Not found" });
    if (user.role !== "admin" && o.userId !== user.id)
        return res.status(403).json({ message: "Forbidden" });
    res.json(toOrderDTO(o));
});
app.get("/api/admin/orders", requireAuth, requireAdmin, (req, res) => {
    const status = req.query.status || "";
    let list = Array.from(db.orders.values());
    if (status)
        list = list.filter((o) => o.status === status);
    res.json({ items: list.map(toOrderDTO) });
});
app.patch("/api/admin/orders/:id", requireAuth, requireAdmin, (req, res) => {
    const body = adminOrderPatchSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const o = db.orders.get(req.params.id);
    if (!o)
        return res.status(404).json({ message: "Not found" });
    o.status = body.data.status;
    db.orders.set(o.id, o);
    res.json(toOrderDTO(o));
});
app.delete("/api/admin/orders/:id", requireAuth, requireAdmin, (req, res) => {
    const o = db.orders.get(req.params.id);
    if (!o)
        return res.status(404).json({ message: "Not found" });
    db.orders.delete(o.id);
    res.json({ ok: true });
});
app.get("/api/admin/customers", requireAuth, requireAdmin, (req, res) => {
    const list = Array.from(db.users.values()).filter((u) => u.role === "customer");
    res.json({ items: list.map((u) => ({ id: u.id, name: u.name, email: u.email })) });
});
app.get("/api/admin/stats", requireAuth, requireAdmin, (req, res) => {
    const products = Array.from(db.products.values());
    const orders = Array.from(db.orders.values());
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const units = products.reduce((s, p) => s + p.stock, 0);
    const lowStock = products.filter((p) => p.stock < 10).map(toProductDTO);
    res.json({ revenue, units, productsCount: products.length, ordersCount: orders.length, lowStock });
});
app.post("/api/admin/catalog/reset", requireAuth, requireAdmin, (req, res) => {
    db.products.clear();
    seedProducts();
    res.json({ ok: true });
});
const paymentIntentSchema = z.object({ order_id: z.string().min(1) });
const paymentCaptureSchema = z.object({ paypal_order_id: z.string().min(1) });
const bankIntentSchema = z.object({ order_id: z.string().min(1), ref: z.string().optional() });
app.post("/api/payments/stripe/intent", requireAuth, (req, res) => {
    const body = paymentIntentSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    res.json({ client_secret: "pi_mock_" + nanoid() });
});
app.post("/api/payments/stripe/webhook", requireAuth, (req, res) => {
    const schema = z.object({ order_id: z.string().min(1), success: z.boolean(), reason: z.string().optional() }).passthrough();
    const body = schema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    if (body.data.success) {
        order.paidAt = new Date().toISOString();
    }
    db.orders.set(order.id, order);
    res.json({ ok: true });
});
app.post("/api/payments/paypal/create", requireAuth, (req, res) => {
    const body = z.object({ order_id: z.string().min(1) }).safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    res.json({ approve_url: "https://paypal.example.com/approve?token=" + nanoid() });
});
app.post("/api/payments/paypal/capture", requireAuth, (req, res) => {
    const schema = z.object({ order_id: z.string().min(1), paypal_order_id: z.string().min(1) });
    const body = schema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    order.paidAt = new Date().toISOString();
    db.orders.set(order.id, order);
    res.json({ ok: true });
});
app.post("/api/payments/bank/intent", requireAuth, (req, res) => {
    const body = bankIntentSchema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    const ref = body.data.ref ?? "TRX-" + nanoid().slice(0, 8);
    order.payment_ref = ref;
    db.orders.set(order.id, order);
    res.json({
        bank: "SparkShop Trust Bank",
        account_name: "SparkShop Ltd",
        account_no: "8821 4476 02",
        swift: "SPRKUS33XXX",
        reference: ref,
    });
});
app.post("/api/payments/bank/webhook", requireAuth, (req, res) => {
    const schema = z.object({ order_id: z.string().min(1), reference: z.string().min(1), success: z.boolean() }).passthrough();
    const body = schema.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ message: body.error.message });
    const order = db.orders.get(body.data.order_id);
    if (!order)
        return res.status(404).json({ message: "Order not found" });
    if (body.data.success)
        order.paidAt = new Date().toISOString();
    db.orders.set(order.id, order);
    res.json({ ok: true });
});
app.get("/health", (req, res) => res.json({ ok: true }));
app.listen(PORT, () => {
    console.log(`[sparkshop-backend] listening on :${PORT}`);
});
