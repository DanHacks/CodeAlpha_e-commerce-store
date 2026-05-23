import AdminLayout from "@/components/AdminLayout";
import { useCurrency } from "@/context/CurrencyContext";
import { Users } from "lucide-react";

// Mocked customer list — in production this comes from the backend.
const mockCustomers = [
  { id: "c1", name: "Alex Morgan",     email: "alex@example.com",     orders: 4, spend: 612.5 },
  { id: "c2", name: "Priya Sharma",    email: "priya@example.com",    orders: 2, spend: 248.0 },
  { id: "c3", name: "Jordan Lee",      email: "jordan@example.com",   orders: 7, spend: 1894.99 },
  { id: "c4", name: "Maria González",  email: "maria@example.com",    orders: 1, spend: 89.0 },
  { id: "c5", name: "Kenji Tanaka",    email: "kenji@example.com",    orders: 5, spend: 1320.4 },
];

const CustomersAdmin = () => {
  const { format } = useCurrency();
  return (
  <AdminLayout>
    <div className="mb-6">
      <p className="text-sm text-primary font-semibold uppercase tracking-wider">People</p>
      <h1 className="text-3xl font-bold text-secondary">Customers</h1>
    </div>

    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th className="p-3 font-semibold">Customer</th>
            <th className="p-3 font-semibold">Email</th>
            <th className="p-3 font-semibold">Orders</th>
            <th className="p-3 font-semibold text-right">Lifetime spend</th>
          </tr>
        </thead>
        <tbody>
          {mockCustomers.map((c) => (
            <tr key={c.id} className="border-t border-border hover:bg-muted/30">
              <td className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                  {c.name[0]}
                </div>
                <span className="font-medium">{c.name}</span>
              </td>
              <td className="p-3 text-muted-foreground">{c.email}</td>
              <td className="p-3">{c.orders}</td>
              <td className="p-3 text-right font-bold text-secondary">{format(c.spend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminLayout>
  );
};

export default CustomersAdmin;
