import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all fields");
    toast.success("Message sent! We'll be in touch shortly.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <div className="container py-16 grid gap-10 md:grid-cols-2 max-w-5xl">
        <div>
          <h1 className="text-4xl font-bold text-secondary">Get in touch</h1>
          <p className="mt-3 text-muted-foreground">
            Questions about an order, partnerships, or just want to say hi? We're listening.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@sparkshop.com</div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +1 (555) 010-2026</div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> 221B Spark Lane, Brooklyn, NY</div>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Message</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Send message</Button>
        </form>
      </div>
    </Layout>
  );
};

export default Contact;
