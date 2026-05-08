import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Save, Loader2, ShoppingBag, Receipt, Clock } from "lucide-react";
import { CustomerHeader } from "@/components/site/CustomerHeader";
import { CustomerMobileNav } from "@/components/site/CustomerMobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { useOrders } from "@/stores/orders";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatTime } from "@/lib/format";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading } = useAuth();
  const orders = useOrders((s) => s.orders);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || ""
  );
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated!");
  };

  return (
    <div className="min-h-[100dvh] pb-28 md:pb-12">
      <CustomerHeader />
      <div className="container py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Account
          </p>
          <h1 className="font-display text-3xl font-bold mt-1 mb-8">
            My Profile
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: ShoppingBag, label: "Total Orders", value: totalOrders.toString() },
              { icon: Receipt, label: "Total Spent", value: formatMoney(totalSpent) },
              { icon: Clock, label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
            ].map((s) => (
              <div key={s.label} className="card-surface rounded-xl p-4">
                <s.icon className="h-4 w-4 text-accent mb-2" />
                <div className="font-display text-xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Profile form */}
          <form onSubmit={handleSave} className="card-surface rounded-xl p-6 space-y-5">
            <h2 className="font-display text-lg font-bold">Personal Info</h2>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  value={user.email || ""}
                  disabled
                  className="pl-10 opacity-60"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here.
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </motion.div>
      </div>
      <CustomerMobileNav />
    </div>
  );
};

export default Profile;
