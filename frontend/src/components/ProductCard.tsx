import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const { format } = useCurrency();
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</span>
        <Link to={`/product/${product.id}`} className="mt-1 font-semibold text-foreground hover:text-primary transition-colors">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-secondary">{format(product.price)}</span>
          <Button size="sm" onClick={() => add(product)} className="bg-primary hover:bg-primary/90 gap-1.5">
            <ShoppingCart className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
};
export default ProductCard;
