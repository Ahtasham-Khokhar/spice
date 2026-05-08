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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/stores/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminLogin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, navigate]);

  if (loading) return null;
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're signed in");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="container py-16 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface rounded-2xl p-8 shadow-elevated"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary mb-4">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage orders, menu, and inventory.
          </p>

          {user && !isAdmin && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
              You're signed in as{" "}
              <span className="font-bold">{user.email}</span> but don't have
              admin access.
            </div>
          )}

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "signin" | "signup")}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-in"
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
                  <Label htmlFor="pwd-in">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pwd-in"
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
                      Sign in <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name-up">Display name</Label>
                  <Input
                    id="name-up"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-up"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-up">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pwd-up"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
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
                      Create account <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Admin access:</span>{" "}
            sign up, then promote your account to{" "}
            <code className="text-foreground">admin</code> in the backend's{" "}
            <code className="text-foreground">user_roles</code> table.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
