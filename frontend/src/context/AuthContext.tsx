import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

// Hard-coded super admin credentials (frontend mock).
// In production this MUST move to a secure backend.
export const ADMIN_EMAIL = "hydan@codealpha.com";
export const ADMIN_PASSWORD = "CodeAlpha@Admin";

export type Role = "admin" | "customer";
export type User = { id: string; name: string; email: string; role: Role };
export type Order = {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  createdAt: string;
};

type AuthCtx = {
  user: User | null;
  orders: Order[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  deleteOrder: (id: string) => void;
  refreshOrders: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("hk_user") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try { return JSON.parse(localStorage.getItem("hk_orders") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("hk_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("hk_orders", JSON.stringify(orders)); }, [orders]);

  const login = async (email: string, password: string) => {
    if (!email || !password) return false;
    try {
      const r = await (await import("@/lib/api")).api.post<{ accessToken: string; user: User; refreshToken: string }>(
        "/api/auth/login",
        { email, password },
        { skipAuth: true }
      );
      localStorage.setItem("access_token", r.accessToken);
      setUser(r.user);
      toast.success(r.user.role === "admin" ? "Welcome, Admin" : "Welcome back!");
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) return false;
    try {
      const r = await (await import("@/lib/api")).api.post<{ accessToken: string; user: User; refreshToken: string }>(
        "/api/auth/register",
        { name, email, password },
        { skipAuth: true }
      );
      localStorage.setItem("access_token", r.accessToken);
      setUser(r.user);
      toast.success("Account created");
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Register failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      const { api } = await import("@/lib/api");
      await api.post("/api/auth/logout", {}, { skipAuth: false });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
      setOrders([]);
      toast("Signed out");
    }
  };

  const addOrder: AuthCtx["addOrder"] = (o) => {
    // Checkout now writes directly to backend.
    // Keep method to avoid UI breakage if any page still uses it.
    const order: Order = { ...o, id: "ord_" + Date.now(), createdAt: new Date().toISOString(), status: "Processing" };
    setOrders((c) => [order, ...c]);
    return order;
  };

  const updateOrderStatus: AuthCtx["updateOrderStatus"] = (id, status) => {
    // Admin pages call backend directly; keep local update for UI responsiveness fallback.
    setOrders((c) => c.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order marked as ${status}`);
  };
  const deleteOrder: AuthCtx["deleteOrder"] = (id) => {
    setOrders((c) => c.filter((o) => o.id !== id));
    toast.success("Order removed");
  };

  const refreshOrders = async () => {
    try {
      const { api } = await import("@/lib/api");
      const r = await api.get<{ items: Order[] }>("/api/orders");
      setOrders(r.items);
    } catch {
      // Keep existing orders on failure (no UX change).
    }
  };

  return (
    <Ctx.Provider
      value={{ user, orders, isAdmin: user?.role === "admin", login, register, logout, addOrder, updateOrderStatus, deleteOrder, refreshOrders }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
