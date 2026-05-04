import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { Package, DollarSign, Boxes, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const KPI = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-secondary">{value}</p>
      </div>
    </div>
  </div>
);

const Overview = () => {
  const { products } = useProducts();
  const { orders } = useAuth();
  const stats = {
    products: products.length,
    units: products.reduce((s, p) => s + p.stock, 0),
    value: products.reduce((s, p) => s + p.stock * p.price, 0),
    orders: orders.length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
    lowStock: products.filter((p) => p.stock < 10),
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-sm text-primary font-semibold uppercase tracking-wider">Dashboard</p>
        <h1 className="text-3xl font-bold text-secondary">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">Here's how your store is performing today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPI icon={<Package className="h-5 w-5" />} label="Products" value={stats.products.toString()} />
        <KPI icon={<Boxes className="h-5 w-5" />} label="Units in stock" value={stats.units.toString()} />
        <KPI icon={<DollarSign className="h-5 w-5" />} label="Inventory value" value={`$${stats.value.toLocaleString()}`} />
        <KPI icon={<ShoppingBag className="h-5 w-5" />} label="Orders" value={stats.orders.toString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-secondary flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Recent revenue</h2>
            <span className="text-sm text-muted-foreground">All time</span>
          </div>
          <p className="text-4xl font-bold text-primary">${stats.revenue.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">From {stats.orders} order{stats.orders !== 1 ? "s" : ""}.</p>
          <div className="mt-6 flex gap-2">
            <Button asChild className="bg-primary hover:bg-primary/90"><Link to="/admin/products">Manage products</Link></Button>
            <Button asChild variant="outline"><Link to="/admin/orders">View orders</Link></Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold text-secondary flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Low stock
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products well stocked. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="h-9 w-9 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.stock} left</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Overview;
