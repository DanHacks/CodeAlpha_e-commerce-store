import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, ADMIN_EMAIL } from "../db.js";
import type { AuthPayload, User } from "../types.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const ACCESS_SECRET  = process.env.JWT_SECRET || "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_TTL  = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

const signAccess  = (p: AuthPayload) => jwt.sign(p, ACCESS_SECRET,  { expiresIn: ACCESS_TTL });
const signRefresh = (p: AuthPayload) => jwt.sign(p, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

// Ensure admin exists on first call
async function ensureAdmin() {
  if (db.users.find((u) => u.email === ADMIN_EMAIL)) return;
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "CodeAlpha@Admin", 10);
  db.users.push({
    id: "u_admin", name: "Hydan Koech", email: ADMIN_EMAIL,
    passwordHash, role: "admin", createdAt: new Date().toISOString(),
  });
}

const safe = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    await ensureAdmin();
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body);

    if (db.users.find((u) => u.email === body.email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user: User = {
      id: "u_" + Date.now(),
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const payload: AuthPayload = { sub: user.id, role: user.role, email: user.email };
    res.status(201).json({
      user: safe(user),
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
  } catch (e) { next(e); }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    await ensureAdmin();
    const { email, password } = z.object({
      email: z.string().email(), password: z.string().min(1),
    }).parse(req.body);

    const user = db.users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const payload: AuthPayload = { sub: user.id, role: user.role, email: user.email };
    res.json({
      user: safe(user),
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
  } catch (e) { next(e); }
});

// POST /api/auth/refresh
authRouter.post("/refresh", (req, res) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as AuthPayload;
    res.json({ accessToken: signAccess({ sub: payload.sub, role: payload.role, email: payload.email }) });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /api/auth/logout — stateless JWT, client just drops tokens
authRouter.post("/logout", (_req, res) => res.status(204).end());

// GET /api/auth/me
authRouter.get("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user!.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: safe(user) });
});
