import { useState } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";

const Index = () => {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24 items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-glow">
              New season · 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Essentials, <span className="text-primary-glow">elevated.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Discover a curated edit of premium everyday products from SparkShop — designed to last, made to love.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}>
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                Learn more
              </Button>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Curated SparkShop products" width={1600} height={900} className="rounded-2xl shadow-elegant w-full" />
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="container py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary">Shop all products</h2>
            <p className="text-muted-foreground mt-1">{filtered.length} items available</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-smooth ${
                cat === c ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
