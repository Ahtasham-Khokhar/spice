import { Link } from "react-router-dom";
import { LogOut, UtensilsCrossed, Shield } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="header-backdrop">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
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
