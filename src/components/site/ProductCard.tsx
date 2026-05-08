import { motion } from "framer-motion";
import { Star, Plus, Ban } from "lucide-react";
import type { Product } from "@/data/menu";
import { formatMoney } from "@/lib/format";
import { useStock } from "@/stores/stock";
import { forwardRef } from "react";

type Props = {
  product: Product;
  onSelect: (p: Product) => void;
};

export const ProductCard = forwardRef<HTMLButtonElement, Props>(
  ({ product, onSelect, ...props }, ref) => {
  const isOut = useStock((s) => s.isOut(product.id));

  return (
    <motion.button
      ref={ref}
      layout
      {...props}
      onClick={() => !isOut && onSelect(product)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative text-left card-surface rounded-xl overflow-hidden hover:border-muted-foreground/30 transition-colors disabled:opacity-50"
      disabled={isOut}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {product.trending && (
          <div className="absolute top-3 left-3 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            Trending
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 rounded-md bg-destructive/90 px-3 py-1.5 text-xs font-bold text-destructive-foreground">
              <Ban className="h-3.5 w-3.5" /> Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-medium text-foreground">{product.rating}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="font-display text-lg font-bold text-primary">
            {formatMoney(product.price)}
          </div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
});

ProductCard.displayName = "ProductCard";