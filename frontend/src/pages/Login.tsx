import { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in both fields");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      // Admin email always lands in admin console
      const next = params.get("next");
      if (email.toLowerCase() === "hydan@codealpha.com") navigate("/admin");
      else navigate(next || "/");
    }
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-secondary">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to continue shopping.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            New here? <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Super Admin demo access</p>
            <p>Email: <code>hydan@codealpha.com</code></p>
            <p>Password: <code>CodeAlpha@Admin</code></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Login;
