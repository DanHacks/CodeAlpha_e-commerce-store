import Layout from "@/components/Layout";
import { Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Curated quality", text: "Every product is hand-picked by our team for craftsmanship and longevity." },
  { icon: Truck, title: "Fast shipping", text: "Free 2-day shipping on orders over $50, worldwide tracked delivery." },
  { icon: ShieldCheck, title: "2-year warranty", text: "Buy with confidence — every order is backed by our extended warranty." },
  { icon: Heart, title: "Sustainable", text: "We partner with brands using recycled materials and ethical labor." },
];

const About = () => (
  <Layout>
    <section className="bg-gradient-hero text-white">
      <div className="container py-16 md:py-24 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">About SparkShop</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-3">Essentials, electrified.</h1>
        <p className="mt-5 text-lg text-white/80">
          SparkShop is a modern e-commerce destination for premium everyday products.
          We believe great things last — and look beautiful while doing it.
        </p>
      </div>
    </section>

    <section className="container py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {features.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-semibold text-secondary">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
      ))}
    </section>

    <section className="container pb-16 grid gap-10 md:grid-cols-2 items-center">
      <img
        src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80&auto=format&fit=crop"
        alt="Our team"
        loading="lazy"
        className="rounded-2xl shadow-elegant w-full"
      />
      <div>
        <h2 className="text-3xl font-bold text-secondary">Our story</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Founded in 2026, SparkShop began as a passion project to source the kind of objects we wished we owned —
          functional, beautifully made, and fairly priced. Today we ship to over 30 countries and partner with
          80+ independent makers.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We obsess over the details so you don't have to. Every product on SparkShop is tested by our team,
          backed by a 2-year warranty, and shipped carbon-neutral.
        </p>
      </div>
    </section>
  </Layout>
);

export default About;
