import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/** Guards admin-only routes. Redirects to /login (with next) or home if not admin. */
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
export default AdminRoute;
