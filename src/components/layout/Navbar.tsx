import { Bell, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 gap-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 rounded-xl hover:bg-primary/10" />
      </div>

      <div className="flex items-center gap-3">

        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-peach rounded-full" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
