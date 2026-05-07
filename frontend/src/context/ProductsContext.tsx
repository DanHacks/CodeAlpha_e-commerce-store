import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products as seedProducts, Product } from "@/data/products";
import { toast } from "sonner";

type ProductsCtx = {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  create: (p: Omit<Product, "id">) => Product;
  update: (id: string, patch: Partial<Omit<Product, "id">>) => void;
  remove: (id: string) => void;
  reset: () => void;
  // Categories management
  categories: string[]; // union of seeded/custom + any in-use on products
  createCategory: (name: string) => boolean;
  renameCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (name: string, opts?: { reassignTo?: string }) => boolean;
  countByCategory: (name: string) => number;
};

const Ctx = createContext<ProductsCtx | null>(null);
const KEY = "hk_products";
const CATS_KEY = "hk_categories";

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "null");
      return Array.isArray(stored) && stored.length ? stored : seedProducts;
    } catch { return seedProducts; }
  });

  // Custom categories (those not necessarily attached to any product)
  const [customCats, setCustomCats] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CATS_KEY) || "null");
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(CATS_KEY, JSON.stringify(customCats)); }, [customCats]);

  // Merge in-use categories with custom-defined ones — sorted unique
  const categories = useMemo(() => {
    const inUse = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...inUse, ...customCats])).sort((a, b) => a.localeCompare(b));
  }, [products, customCats]);

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
  const reset = () => {
    setProducts(seedProducts);
    setCustomCats([]);
    toast("Catalog reset to defaults");
  };
  const getProduct = (id: string) => products.find((p) => p.id === id);

  const countByCategory = (name: string) => products.filter((p) => p.category === name).length;

  // Add a brand-new category (case-insensitive dedupe)
  const createCategory: ProductsCtx["createCategory"] = (name) => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Category name required"); return false; }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists");
      return false;
    }
    setCustomCats((c) => [...c, trimmed]);
    toast.success(`Category "${trimmed}" created`);
    return true;
  };

  // Rename — updates every product using the old name
  const renameCategory: ProductsCtx["renameCategory"] = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) { toast.error("New name required"); return false; }
    if (trimmed === oldName) return true;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A category with that name already exists");
      return false;
    }
    setProducts((c) => c.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)));
    setCustomCats((c) => c.map((x) => (x === oldName ? trimmed : x)));
    toast.success(`Renamed to "${trimmed}"`);
    return true;
  };

  // Delete — optionally reassign products to another category, otherwise blank them
  const deleteCategory: ProductsCtx["deleteCategory"] = (name, opts) => {
    const target = opts?.reassignTo;
    setProducts((c) =>
      c.map((p) => (p.category === name ? { ...p, category: target ?? "" } : p))
    );
    setCustomCats((c) => c.filter((x) => x !== name));
    toast.success(`Deleted category "${name}"`);
    return true;
  };

  return (
    <Ctx.Provider value={{
      products, getProduct, create, update, remove, reset,
      categories, createCategory, renameCategory, deleteCategory, countByCategory,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useProducts = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProducts must be used inside ProductsProvider");
  return c;
};
