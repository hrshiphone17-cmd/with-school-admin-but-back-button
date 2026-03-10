import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/NotFound";

const ADMIN_ENABLED = import.meta.env.VITE_ENABLE_ADMIN !== "false";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!ADMIN_ENABLED) return <NotFound />;
  if (!user || user.role !== "admin") return <Navigate to="/role-select" replace />;

  return <>{children}</>;
}
