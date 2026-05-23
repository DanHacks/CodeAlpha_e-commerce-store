import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { Package, Mail, User as UserIcon } from "lucide-react";
import { useEffect } from "react";

const statusColor: Record<string, string> = {
  Processing: "bg-primary/10 text-primary",
  Shipped: "bg-secondary/10 text-secondary",
  Delivered: "bg-emerald-100 text-emerald-700",
};


const Dashboard = () => {
  const { user, orders, refreshOrders } = useAuth();
  const { format } = useCurrency();
  const [params] = useSearchParams();
  const justOrdered = params.get("ord");

  if (!user) return <Navigate to="/login" replace />;

  // Load latest orders from backend (AuthContext wiring).
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  return (
    <Layout>
      <div className="container py-10">
        {justOrdered && (
          <div className="mb-6 rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm">
            🎉 Thanks for your order <span className="font-mono font-semibold">{justOrdered}</span>! It's now processing.
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft h-fit">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold">
                {user.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-secondary">{user.name}</p>
                <p className="text-sm text-muted-foreground">Member</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><UserIcon className="h-4 w-4" /> {user.name}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {user.email}</div>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-secondary mb-4">Your orders</h1>
            {orders.length === 0 ? (

              <div className="rounded-xl border border-border border-dashed bg-card p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{o.id}</p>
                        <p className="text-sm">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm border-t border-border pt-3">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between text-foreground/80">
                          <span>{it.name} × {it.quantity}</span>
                          <span>{format(it.price * it.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between font-bold border-t border-border pt-3">
                      <span>Total</span><span className="text-primary">{format(o.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};
export default Dashboard;
