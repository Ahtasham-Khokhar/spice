import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/stores/cart";

export function MobileNav() {
  const { pathname } = useLocation();
  const count = useCart((s) => s.count());
  const setOpen = useCart((s) => s.setOpen);

  const items = [
    { to: "/", label: "Menu", icon: Home },
    { to: "/orders", label: "Orders", icon: Receipt },
    { action: () => setOpen(true), label: "Cart", icon: ShoppingBag, badge: count },
    { to: "/admin", label: "Account", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-card border-t border-border">
        <ul className="grid grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            const active = "to" in it && pathname === it.to;
            const content = (
              <span className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}>
                <Icon className="h-5 w-5" />
                {it.label}
                {"badge" in it && it.badge ? (
                  <span className="absolute top-1.5 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {it.badge}
                  </span>
                ) : null}
              </span>
            );
            return (
              <li key={i}>
                {"to" in it ? (
                  <Link to={it.to!}>{content}</Link>
                ) : (
                  <button onClick={it.action} className="w-full">{content}</button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
