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
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        set({ isAdmin: !!data, adminChecked: true });
      } catch {
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
