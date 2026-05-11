import { Link, useNavigate } from "react-router-dom";
import { LogOut, UtensilsCrossed, Shield } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="header-backdrop">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <img src="/favicon.png" alt="Logo" className="h-9 w-9 rounded-lg" />
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight">
                Spice
              </span>
              <span className="flex items-center gap-1 rounded-md bg-primary/15 border border-primary/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-10 gap-2 rounded-lg border-border/60"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
