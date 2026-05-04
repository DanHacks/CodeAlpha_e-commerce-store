import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { products as seedProducts, Product } from "@/data/products";
import { toast } from "sonner";

type ProductsCtx = {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  create: (p: Omit<Product, "id">) => Product;
  update: (id: string, patch: Partial<Omit<Product, "id">>) => void;
  remove: (id: string) => void;
  reset: () => void;
};

const Ctx = createContext<ProductsCtx | null>(null);
const KEY = "hk_products";

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "null");
      return Array.isArray(stored) && stored.length ? stored : seedProducts;
    } catch { return seedProducts; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(products)); }, [products]);

  const create: ProductsCtx["create"] = (p) => {
    const product: Product = { ...p, id: "p_" + Date.now() };
    setProducts((c) => [product, ...c]);
    toast.success("Product created");
    return product;
  };
  const update: ProductsCtx["update"] = (id, patch) => {
    setProducts((c) => c.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    toast.success("Product updated");
  };
  const remove: ProductsCtx["remove"] = (id) => {
    setProducts((c) => c.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };
  const reset = () => { setProducts(seedProducts); toast("Catalog reset to defaults"); };
  const getProduct = (id: string) => products.find((p) => p.id === id);

  return <Ctx.Provider value={{ products, getProduct, create, update, remove, reset }}>{children}</Ctx.Provider>;
};

export const useProducts = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProducts must be used inside ProductsProvider");
  return c;
};
