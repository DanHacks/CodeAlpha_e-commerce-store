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
    // Admin login path
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({ id: "admin_root", name: "SparkShop Admin", email: ADMIN_EMAIL, role: "admin" });
      toast.success("Welcome, Admin");
      return true;
    }
    // Reject anyone trying admin email with wrong password
    if (email.toLowerCase() === ADMIN_EMAIL) {
      toast.error("Invalid admin credentials");
      return false;
    }
    setUser({ id: "u_" + Date.now(), name: email.split("@")[0], email, role: "customer" });
    toast.success("Welcome back!");
    return true;
  };

  const register = async (name: string, email: string, _password: string) => {
    if (!name || !email) return false;
    if (email.toLowerCase() === ADMIN_EMAIL) {
      toast.error("This email is reserved");
      return false;
    }
    setUser({ id: "u_" + Date.now(), name, email, role: "customer" });
    toast.success("Account created");
    return true;
  };

  const logout = () => { setUser(null); toast("Signed out"); };

  const addOrder: AuthCtx["addOrder"] = (o) => {
    const order: Order = { ...o, id: "ord_" + Date.now(), createdAt: new Date().toISOString(), status: "Processing" };
    setOrders((c) => [order, ...c]);
    return order;
  };

  const updateOrderStatus: AuthCtx["updateOrderStatus"] = (id, status) => {
    setOrders((c) => c.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order marked as ${status}`);
  };
  const deleteOrder: AuthCtx["deleteOrder"] = (id) => {
    setOrders((c) => c.filter((o) => o.id !== id));
    toast.success("Order removed");
  };

  return (
    <Ctx.Provider value={{ user, orders, isAdmin: user?.role === "admin", login, register, logout, addOrder, updateOrderStatus, deleteOrder }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
