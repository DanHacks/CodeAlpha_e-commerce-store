import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="border-t border-border bg-secondary text-secondary-foreground mt-16">
    <div className="container py-10 grid gap-8 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-2">
          <img src={logo} alt="SparkShop logo" width={40} height={40} className="h-10 w-10 object-contain bg-white/5 rounded-lg p-1" loading="lazy" />
          <h3 className="text-lg font-bold">SparkShop</h3>
        </div>
        <p className="mt-3 text-sm text-secondary-foreground/70">
          Curated everyday essentials, electrified for modern living.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Shop</h4>
        <ul className="space-y-2 text-sm text-secondary-foreground/70">
          <li><Link to="/" className="hover:text-primary">All products</Link></li>
          <li><Link to="/?cat=Electronics" className="hover:text-primary">Electronics</Link></li>
          <li><Link to="/?cat=Home" className="hover:text-primary">Home</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-secondary-foreground/70">
          <li><Link to="/about" className="hover:text-primary">About</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Shipping & returns</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-secondary-foreground/10 py-5 text-center text-xs text-secondary-foreground/60">
      © {new Date().getFullYear()} SparkShop. All rights reserved.
    </div>
  </footer>
);
export default Footer;
