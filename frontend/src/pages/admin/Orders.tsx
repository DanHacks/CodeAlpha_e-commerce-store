import AdminLayout from "@/components/AdminLayout";
import { useAuth, Order } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ShoppingBag, Truck, CheckCircle2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMemo, useState } from "react";

const STATUS: Order["status"][] = ["Processing", "Shipped", "Delivered"];

const statusBadge = (s: Order["status"]) => {
  const map = {
    Processing: "bg-amber-100 text-amber-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
  } as const;
  return map[s];
};

const OrdersAdmin = () => {
  const { orders, updateOrderStatus, deleteOrder } = useAuth();
  const { format } = useCurrency();
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const advance = (o: Order) => {
    const next = STATUS[Math.min(STATUS.indexOf(o.status) + 1, STATUS.length - 1)];
    updateOrderStatus(o.id, next);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-primary font-semibold uppercase tracking-wider">Sales</p>
          <h1 className="text-3xl font-bold text-secondary">Orders</h1>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No orders to show.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="p-3 font-semibold">Order</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Items</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Total</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{o.id}</td>
                    <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground">{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-primary">{format(o.total)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {o.status !== "Delivered" && (
                          <Button size="sm" variant="outline" onClick={() => advance(o)} className="gap-1.5">
                            {o.status === "Processing" ? <Truck className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Mark {o.status === "Processing" ? "shipped" : "delivered"}
                          </Button>
                        )}
                        {o.status !== "Processing" && (
                          <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(o.id, "Processing")} className="gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Reset
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete order {o.id}?</AlertDialogTitle>
                              <AlertDialogDescription>This permanently removes the order record.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOrder(o.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersAdmin;
