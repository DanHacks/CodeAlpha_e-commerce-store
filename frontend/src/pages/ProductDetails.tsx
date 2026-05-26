import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "@/components/ProductCard";
import { useMemo, useState } from "react";
import { Minus, Plus, ArrowLeft, ShoppingCart, Check } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProduct } = useProducts();
  const product = getProduct(id || "");
  const { add } = useCart();
  const { format } = useCurrency();
  const [qty, setQty] = useState(1);

  // Build gallery: main image + any additional images (deduped)
  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const all = [product.image, ...(product.images ?? [])].filter(Boolean);
    return Array.from(new Set(all));
  }, [product]);
  const [active, setActive] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted shadow-soft">
              <img
                src={gallery[active] || product.image}
                alt={product.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                className="h-full w-full object-cover transition-opacity"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActive(i)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                      i === active ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={src} alt={`${product.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-primary font-semibold">{product.category}</span>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-secondary">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-primary">{format(product.price)}</p>
            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground/80">{product.stock} in stock · ships in 2 days</span>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
              <Button size="lg" onClick={() => add(product, qty)} className="bg-primary hover:bg-primary/90 flex-1 gap-2">
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-secondary mb-6">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};
export default ProductDetails;
