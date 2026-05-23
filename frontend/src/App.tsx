import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import ProductDetails from "./pages/ProductDetails.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Overview from "./pages/admin/Overview.tsx";
import ProductsAdmin from "./pages/admin/Products.tsx";
import CategoriesAdmin from "./pages/admin/Categories.tsx";
import OrdersAdmin from "./pages/admin/Orders.tsx";
import CustomersAdmin from "./pages/admin/Customers.tsx";
import SettingsAdmin from "./pages/admin/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <CurrencyProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminRoute><Overview /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ProductsAdmin /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><CategoriesAdmin /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><OrdersAdmin /></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><CustomersAdmin /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><SettingsAdmin /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
            </CurrencyProvider>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
