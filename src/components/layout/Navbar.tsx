import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
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
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to log out and return to the home screen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay here</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Yes, log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}