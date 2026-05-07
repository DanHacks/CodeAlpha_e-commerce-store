import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, Tags, ShoppingBag, Users, Settings, LogOut, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <img src={logo} alt="SparkShop" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Spark<span className="text-primary">Shop</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.end}
                          className={({ isActive }) =>
                            `flex items-center gap-2 ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""}`
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/")}>
                      <Home className="h-4 w-4" /> <span>Visit storefront</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4" /> <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">Admin Console</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:inline text-muted-foreground">{user?.email}</span>
              <Button size="sm" variant="outline" onClick={() => navigate("/")}>View site</Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
