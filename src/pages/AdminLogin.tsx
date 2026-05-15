import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Loader2,
  Mail,
  Lock as LockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminLogin = () => {
  const { user, isAdmin, loading, adminChecked } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect to admin dashboard once fully authenticated + role confirmed
  useEffect(() => {
    if (!loading && adminChecked && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, loading, adminChecked, navigate]);

  // Show loader while auth or role-check is in progress
  if (loading || (user && !adminChecked)) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If fully checked and is admin, redirect immediately
  if (user && isAdmin && adminChecked) return <Navigate to="/admin" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in — verifying admin access…");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="container py-16 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface rounded-2xl p-8 shadow-elevated"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl">
            <img src="/favicon.png" className="rounded-md h-full w-full" alt="" />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in with your admin credentials to manage orders, menu, and
            inventory.
          </p>

          {user && adminChecked && !isAdmin && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
              You're signed in as{" "}
              <span className="font-bold">{user.email}</span> but this account
              doesn't have admin privileges. Please sign in with an admin
              account.
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@ahsamhutt.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pwd">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-pwd"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={busy}
              size="lg"
              className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Admin access:</span>{" "}
            Only accounts with the{" "}
            <code className="text-foreground">admin</code> role in the{" "}
            <code className="text-foreground">user_roles</code> table can access
            this portal.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
