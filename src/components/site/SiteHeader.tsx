import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { pathname } = useLocation();
  const count = useCart((s) => s.count());
  const setOpen = useCart((s) => s.setOpen);

  const links = [
    { to: "/", label: "Menu" },
    { to: "/orders", label: "Track Order" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="header-backdrop">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <UtensilsCrossed className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Ahsam Hutt
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-muted"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="relative h-10 gap-2 rounded-lg border-border/60 bg-card hover:bg-muted"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
              >
                {count}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
