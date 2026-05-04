import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/context/ProductsContext";
import { toast } from "sonner";

const SettingsAdmin = () => {
  const { user } = useAuth();
  const { reset } = useProducts();

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-sm text-primary font-semibold uppercase tracking-wider">Configuration</p>
        <h1 className="text-3xl font-bold text-secondary">Settings</h1>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold text-secondary">Store profile</h2>
          <div className="mt-4 grid gap-4">
            <div><Label>Store name</Label><Input defaultValue="SparkShop" /></div>
            <div><Label>Support email</Label><Input defaultValue="hello@sparkshop.com" /></div>
            <div><Label>Currency</Label><Input defaultValue="USD" /></div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => toast.success("Settings saved")}>Save changes</Button>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold text-secondary">Admin account</h2>
          <p className="text-sm text-muted-foreground mt-1">Signed in as <span className="font-medium">{user?.email}</span></p>
        </section>

        <section className="rounded-xl border border-destructive/30 bg-card p-6 shadow-soft">
          <h2 className="font-semibold text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mt-1">Reset the catalog back to its default seed products.</p>
          <Button variant="outline" className="mt-3 border-destructive text-destructive hover:bg-destructive/5" onClick={reset}>
            Reset catalog
          </Button>
        </section>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdmin;
