import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedSchoolAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/school-admin/login" />;
  if (user.role !== "school_admin") return <Navigate to="/role-select" />;
  return <>{children}</>;
}