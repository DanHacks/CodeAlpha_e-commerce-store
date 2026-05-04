import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/data/products";
import { toast } from "sonner";

export type CartItem = { product: Product; quantity: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("hk_cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (p, qty = 1) => {
    setItems((curr) => {
      const ex = curr.find((i) => i.product.id === p.id);
      if (ex) return curr.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i));
      return [...curr, { product: p, quantity: qty }];
    });
    toast.success(`${p.name} added to cart`);
  };
  const remove: CartCtx["remove"] = (id) => setItems((c) => c.filter((i) => i.product.id !== id));
  const update: CartCtx["update"] = (id, qty) =>
    setItems((c) => c.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const count = items.reduce((a, i) => a + i.quantity, 0);
  const total = items.reduce((a, i) => a + i.quantity * i.product.price, 0);

  return <Ctx.Provider value={{ items, add, remove, update, clear, count, total }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
