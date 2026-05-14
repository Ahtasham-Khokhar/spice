import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  /** True once the initial auth + role check has fully completed */
  adminChecked: boolean;
  initialized: boolean;
  init: () => () => void;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  adminChecked: false,
  initialized: false,

  init: () => {
    if (get().initialized) return () => {};
    set({ initialized: true });

    const checkRole = async (userId: string | undefined) => {
      if (!userId) {
        set({ isAdmin: false, adminChecked: true });
        return;
      }
      try {
        // Primary: use the has_role() database function (bypasses RLS issues)
        const { data: hasRole, error: rpcError } = await supabase
          .rpc("has_role", { _role: "admin", _user_id: userId });

        if (!rpcError) {
          set({ isAdmin: !!hasRole, adminChecked: true });
          return;
        }

        // Fallback: direct table query
        console.warn("has_role RPC failed, falling back to table query:", rpcError.message);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (error) console.error("Admin role check failed:", error.message);
        set({ isAdmin: !!data, adminChecked: true });
      } catch (err) {
        console.error("Admin role check exception:", err);
        set({ isAdmin: false, adminChecked: true });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        // Reset adminChecked when auth changes so pages wait for re-check
        adminChecked: !session?.user,
      });
      checkRole(session?.user?.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        adminChecked: !session?.user,
      });
      checkRole(session?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAdmin: false, adminChecked: true });
  },
}));
