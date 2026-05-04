import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />
    <main className="flex-1 animate-fade-in">{children}</main>
    <Footer />
  </div>
);
export default Layout;
