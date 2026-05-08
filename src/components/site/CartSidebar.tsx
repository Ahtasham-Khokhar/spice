import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

const FEE = 1.99;

export function CartSidebar() {
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());
  const navigate = useNavigate();

  const total = subtotal + (items.length ? FEE : 0);

  const checkout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overlay-backdrop"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-[100dvh] w-full sm:w-[420px] bg-card border-l border-border flex flex-col"
          >
            <header className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-display text-xl font-bold">Your Cart</h2>
                <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-muted/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-lg">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Add something delicious to get started.</p>
                  </div>
                  <Button onClick={() => setOpen(false)} className="mt-2 rounded-lg">
                    Browse the menu
                  </Button>
                </div>
              ) : (
                items.map((line) => (
                  <motion.div
                    key={line.lineId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 rounded-xl bg-muted/40 border border-border/60 p-3"
                  >
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      className="h-20 w-20 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight truncate">{line.product.name}</h3>
                        <button
                          onClick={() => removeItem(line.lineId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {line.selectedMods.length > 0 && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {line.selectedMods.map((m) => m.name).join(" · ")}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
                          <button
                            onClick={() => updateQty(line.lineId, line.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-bold">{line.quantity}</span>
                          <button
                            onClick={() => updateQty(line.lineId, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-display font-semibold text-sm">
                          {formatMoney(line.unitPrice * line.quantity)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border p-5 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Delivery fee</span><span>{formatMoney(FEE)}</span></div>
                  <div className="flex justify-between font-display text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span><span className="text-primary">{formatMoney(total)}</span>
                  </div>
                </div>
                <Button
                  onClick={checkout}
                  size="lg"
                  className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold"
                >
                  Checkout · {formatMoney(total)}
                </Button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
