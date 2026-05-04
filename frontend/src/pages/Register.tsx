import { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || form.password.length < 6) return toast.error("Fill all fields, password ≥ 6 chars");
    setLoading(true);
    const ok = await register(form.name, form.email, form.password);
    setLoading(false);
    if (ok) navigate("/");
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-secondary">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join SparkShop in seconds.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};
export default Register;
