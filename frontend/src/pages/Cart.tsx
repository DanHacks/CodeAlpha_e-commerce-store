import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, remove, update, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Browse the shop and add something you'll love.</p>
          <Button onClick={() => navigate("/")} className="mt-6 bg-primary hover:bg-primary/90">Continue shopping</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-secondary mb-8">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <div key={i.product.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                <Link to={`/product/${i.product.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={i.product.image} alt={i.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link to={`/product/${i.product.id}`} className="font-semibold hover:text-primary">{i.product.name}</Link>
                  <span className="text-sm text-muted-foreground">${i.product.price} each</span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-border">
                      <button onClick={() => update(i.product.id, i.quantity - 1)} className="p-2 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => update(i.product.id, i.quantity + 1)} className="p-2 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-secondary">${(i.product.price * i.quantity).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" onClick={() => remove(i.product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-soft h-fit">
            <h2 className="text-lg font-bold text-secondary">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between text-base font-bold">
                <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={() => navigate("/checkout")} className="w-full mt-6 bg-primary hover:bg-primary/90" size="lg">
              Proceed to checkout
            </Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
};
export default Cart;
