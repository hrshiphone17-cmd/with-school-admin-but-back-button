import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, School, BookOpen, ClipboardList, BarChart3, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Classrooms", icon: School, to: "/admin/classrooms" },
  { label: "Content", icon: BookOpen, to: "/admin/content" },
  { label: "Assignments", icon: ClipboardList, to: "/admin/assignments" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-fredoka text-lg font-bold text-foreground">Codey Admin</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="text-xs">ADMIN</Badge>
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
