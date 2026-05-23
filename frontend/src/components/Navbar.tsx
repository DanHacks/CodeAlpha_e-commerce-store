import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Menu, X, Shield, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { currency, setCurrency, auto } = useCurrency();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/80"}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="SparkShop logo" width={40} height={40} className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-lg font-bold tracking-tight text-secondary hidden sm:inline">Spark<span className="text-primary">Shop</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkCls}>Shop</NavLink>
          <NavLink to="/about" className={linkCls}>About</NavLink>
          <NavLink to="/contact" className={linkCls}>Contact</NavLink>
          <NavLink to="/cart" className={linkCls}>Cart</NavLink>
          {user && !isAdmin && <NavLink to="/dashboard" className={linkCls}>Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5" title={auto ? "Auto-detected" : "Manual"}>
                <Globe className="h-4 w-4" /> {currency}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
              <DropdownMenuLabel>Currency {auto && <span className="text-xs text-muted-foreground">· auto</span>}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CURRENCIES.map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className={c === currency ? "bg-muted font-semibold" : ""}>
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")} className="gap-2">
                {isAdmin ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />} {user.name}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign in</Button>
              <Button size="sm" onClick={() => navigate("/register")} className="bg-primary hover:bg-primary/90">Sign up</Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container flex flex-col gap-3 py-4">
            <NavLink to="/" end className={linkCls} onClick={() => setOpen(false)}>Shop</NavLink>
            <NavLink to="/about" className={linkCls} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={linkCls} onClick={() => setOpen(false)}>Contact</NavLink>
            <NavLink to="/cart" className={linkCls} onClick={() => setOpen(false)}>Cart ({count})</NavLink>
            {user ? (
              <>
                {isAdmin
                  ? <NavLink to="/admin" className={linkCls} onClick={() => setOpen(false)}>Admin</NavLink>
                  : <NavLink to="/dashboard" className={linkCls} onClick={() => setOpen(false)}>Orders</NavLink>}
                <button onClick={() => { logout(); setOpen(false); }} className="text-left text-sm font-medium text-foreground/80">Sign out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkCls} onClick={() => setOpen(false)}>Sign in</NavLink>
                <NavLink to="/register" className={linkCls} onClick={() => setOpen(false)}>Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
