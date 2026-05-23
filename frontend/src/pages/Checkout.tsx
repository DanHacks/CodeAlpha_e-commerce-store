import { useState } from "react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CreditCard, Truck, ShieldCheck, Wallet, Building2 } from "lucide-react";

type Step = "form" | "processing" | "success" | "error";
type PayMethod = "card" | "paypal" | "bank";

const Checkout = () => {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    zip: "",
    card: "",
    expiry: "",
    cvv: "",
    paypalEmail: "",
    bankRef: "",
  });
  const [method, setMethod] = useState<PayMethod>("card");
  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!user) return <Navigate to="/login?next=/checkout" replace />;
  if (items.length === 0 && step === "form") return <Navigate to="/cart" replace />;

  // Format helpers for card inputs
  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validateShipping = () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error("Please complete shipping details");
      return false;
    }
    return true;
  };

  const validatePayment = (): { ok: boolean; failNote?: string } => {
    if (method === "card") {
      const card = form.card.replace(/\s/g, "");
      if (card.length < 12) { toast.error("Enter a valid card number"); return { ok: false }; }
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) { toast.error("Expiry must be MM/YY"); return { ok: false }; }
      const [mm, yy] = form.expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) { toast.error("Invalid expiry month"); return { ok: false }; }
      const now = new Date();
      const exp = new Date(2000 + yy, mm); // first of next month
      if (exp <= now) { toast.error("Card is expired"); return { ok: false }; }
      if (!/^\d{3,4}$/.test(form.cvv)) { toast.error("Invalid CVV"); return { ok: false }; }
      if (card.endsWith("0000")) return { ok: true, failNote: "Your card was declined. Please try another payment method." };
    }
    if (method === "paypal") {
      if (!/^\S+@\S+\.\S+$/.test(form.paypalEmail)) { toast.error("Enter a valid PayPal email"); return { ok: false }; }
      if (form.paypalEmail.startsWith("fail@")) return { ok: true, failNote: "PayPal rejected the payment. Try another method." };
    }
    if (method === "bank") {
      if (form.bankRef.trim().length < 4) { toast.error("Enter your bank transfer reference"); return { ok: false }; }
      if (form.bankRef.trim().toLowerCase() === "fail") return { ok: true, failNote: "We could not verify your bank transfer." };
    }
    return { ok: true };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;
    const v = validatePayment();
    if (!v.ok) return;

    setStep("processing");
    await new Promise((r) => setTimeout(r, 1400));

    if (v.failNote) {
      setErrorMsg(v.failNote);
      setStep("error");
      return;
    }

    try {
      // Backend expects product_id + quantity.
      const { api } = await import("@/lib/api");
      const result = await api.post<{ orderId: string }>(
        "/api/orders",
        {
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          shipping: {
            name: form.name,
            address: form.address,
            city: form.city,
            zip: form.zip,
          },
          payment_method: method,
          payment_ref: method === "bank" ? form.bankRef : undefined,
        }
      );

      setOrderId(result.orderId);
      clear();
      setStep("success");
    } catch (e: any) {
      setErrorMsg(e?.message || "Order failed");
      setStep("error");
    }
  };

  const methodBtn = (id: PayMethod, label: string, Icon: any) => (
    <button
      type="button"
      onClick={() => setMethod(id)}
      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition ${
        method === id ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-foreground/70 hover:border-primary/50"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <Layout>
      <div className="container py-10">
        {step === "processing" && (
          <div className="max-w-md mx-auto text-center rounded-2xl border border-border bg-card p-12 shadow-soft">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <h2 className="mt-6 text-2xl font-bold text-secondary">Processing your payment</h2>
            <p className="mt-2 text-muted-foreground">Please don't close this window…</p>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-md mx-auto text-center rounded-2xl border border-border bg-card p-12 shadow-soft">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
            <h2 className="mt-6 text-2xl font-bold text-secondary">Order confirmed!</h2>
            <p className="mt-2 text-muted-foreground">Thanks {user.name}. We've emailed your receipt.</p>
            <p className="mt-4 font-mono text-xs bg-muted inline-block px-3 py-1 rounded">{orderId}</p>
            <div className="mt-8 flex flex-col gap-2">
              <Button onClick={() => navigate("/dashboard")} className="bg-primary hover:bg-primary/90">View my orders</Button>
              <Button variant="ghost" asChild><Link to="/">Continue shopping</Link></Button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="max-w-md mx-auto text-center rounded-2xl border border-destructive/30 bg-card p-12 shadow-soft">
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-3xl">!</div>
            <h2 className="mt-6 text-2xl font-bold text-secondary">Payment failed</h2>
            <p className="mt-2 text-muted-foreground">{errorMsg}</p>
            <div className="mt-8 flex flex-col gap-2">
              <Button onClick={() => setStep("form")} className="bg-primary hover:bg-primary/90">Try again</Button>
              <Button variant="ghost" asChild><Link to="/cart">Back to cart</Link></Button>
            </div>
          </div>
        )}

        {step === "form" && (
          <>
            <h1 className="text-3xl font-bold text-secondary mb-2">Checkout</h1>
            <p className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout · test failure: card ends 0000, paypal "fail@…", bank ref "fail"
            </p>
            <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6 rounded-xl border border-border bg-card p-6 shadow-soft">
                <div>
                  <h2 className="font-semibold text-lg text-secondary flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Shipping</h2>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="sm:col-span-2"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                    <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                    <div><Label>ZIP</Label><Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h2 className="font-semibold text-lg text-secondary flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment method</h2>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    {methodBtn("card", "Card", CreditCard)}
                    {methodBtn("paypal", "PayPal", Wallet)}
                    {methodBtn("bank", "Bank Transfer", Building2)}
                  </div>

                  {method === "card" && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-5">
                      <div className="sm:col-span-2">
                        <Label>Card number</Label>
                        <Input
                          placeholder="4242 4242 4242 4242"
                          value={form.card}
                          onChange={(e) => setForm({ ...form, card: formatCard(e.target.value) })}
                          inputMode="numeric"
                          autoComplete="cc-number"
                        />
                      </div>
                      <div>
                        <Label>Expiry (MM/YY)</Label>
                        <Input
                          placeholder="08/28"
                          value={form.expiry}
                          onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          placeholder="123"
                          value={form.cvv}
                          onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  )}

                  {method === "paypal" && (
                    <div className="mt-5 space-y-3">
                      <div>
                        <Label>PayPal email</Label>
                        <Input
                          type="email"
                          placeholder="you@paypal.com"
                          value={form.paypalEmail}
                          onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">You'll be redirected to PayPal to approve the payment (simulated).</p>
                    </div>
                  )}

                  {method === "bank" && (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1">
                        <p className="font-semibold text-foreground">Bank transfer details</p>
                        <p><span className="text-muted-foreground">Bank:</span> SparkShop Trust Bank</p>
                        <p><span className="text-muted-foreground">Account name:</span> SparkShop Ltd</p>
                        <p><span className="text-muted-foreground">Account no:</span> <span className="font-mono">8821 4476 02</span></p>
                        <p><span className="text-muted-foreground">SWIFT/IBAN:</span> <span className="font-mono">SPRKUS33XXX</span></p>
                        <p className="pt-1"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">{format(total)}</span></p>
                      </div>
                      <div>
                        <Label>Your transfer reference</Label>
                        <Input
                          placeholder="e.g. TRX-882134"
                          value={form.bankRef}
                          onChange={(e) => setForm({ ...form, bankRef: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">We'll verify the transfer and confirm your order by email within 1 business day.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="rounded-xl border border-border bg-card p-6 shadow-soft h-fit">
                <h2 className="font-bold text-secondary">Your order</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((i) => (
                    <li key={i.product.id} className="flex justify-between gap-3">
                      <span className="text-foreground/80 truncate">{i.product.name} × {i.quantity}</span>
                      <span className="shrink-0">{format(i.product.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
                  <span>Total</span><span className="text-primary">{format(total)}</span>
                </div>
                <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90" size="lg">
                  {method === "card" && `Pay ${format(total)}`}
                  {method === "paypal" && `Continue with PayPal`}
                  {method === "bank" && `I've sent the transfer`}
                </Button>
              </aside>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};
export default Checkout;
