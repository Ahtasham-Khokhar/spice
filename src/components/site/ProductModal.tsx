import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import type { Modifier, Product } from "@/data/menu";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export function ProductModal({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [single, setSingle] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<Record<string, Set<string>>>({});
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useCart((s) => s.setOpen);

  useEffect(() => {
    if (!product) return;
    setQty(1);
    const s: Record<string, string> = {};
    const m: Record<string, Set<string>> = {};
    product.modifiers?.forEach((g) => {
      if (g.type === "single") s[g.id] = g.options[0].id;
      else m[g.id] = new Set();
    });
    setSingle(s);
    setMulti(m);
  }, [product]);

  const selected: Modifier[] = useMemo(() => {
    if (!product?.modifiers) return [];
    const out: Modifier[] = [];
    product.modifiers.forEach((g) => {
      if (g.type === "single") {
        const opt = g.options.find((o) => o.id === single[g.id]);
        if (opt) out.push(opt);
      } else {
        g.options.forEach((o) => {
          if (multi[g.id]?.has(o.id)) out.push(o);
        });
      }
    });
    return out;
  }, [product, single, multi]);

  const unitPrice = (product?.price ?? 0) + selected.reduce((s, o) => s + o.price, 0);

  const handleAdd = () => {
    if (!product) return;
    addItem({ product, quantity: qty, selectedMods: selected, unitPrice });
    toast.success(`${qty} × ${product.name} added`, {
      description: "Tap the cart to checkout.",
      action: { label: "Open cart", onClick: () => setCartOpen(true) },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overlay-backdrop p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-elevated flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden shrink-0">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
                  {product.category}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{product.description}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {product.modifiers?.map((group) => (
                <section key={group.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold">{group.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {group.type === "single" ? "Pick one" : "Optional"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isSel =
                        group.type === "single"
                          ? single[group.id] === opt.id
                          : multi[group.id]?.has(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (group.type === "single") setSingle((s) => ({ ...s, [group.id]: opt.id }));
                            else
                              setMulti((m) => {
                                const next = new Set(m[group.id]);
                                next.has(opt.id) ? next.delete(opt.id) : next.add(opt.id);
                                return { ...m, [group.id]: next };
                              });
                          }}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                            isSel
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            {isSel && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </span>
                            )}
                            {opt.name}
                          </span>
                          {opt.price > 0 && (
                            <span className="text-xs text-muted-foreground">+{formatMoney(opt.price)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="border-t border-border bg-card p-4 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={handleAdd}
                size="lg"
                className="flex-1 h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold"
              >
                Add to Cart · {formatMoney(unitPrice * qty)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
