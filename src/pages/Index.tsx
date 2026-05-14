import { useEffect, useMemo, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Flame,
  Phone,
  Mail,
  MapPin,
  ImageOff,
} from "lucide-react";
import { CustomerHeader } from "@/components/site/CustomerHeader";
import { CustomerMobileNav } from "@/components/site/CustomerMobileNav";
import { CartSidebar } from "@/components/site/CartSidebar";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
import { type Product } from "@/data/menu";
import { useMenuStore } from "@/stores/menuStore";
import { useCategoryStore, type CategoryItem } from "@/stores/categoryStore";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-burger.jpg";
import { useCart } from "@/stores/cart";

type Filter = "All" | string;

export const CategoryCarousel = ({
  categories,
  setFilter,
}: {
  categories: CategoryItem[];
  setFilter: (f: string) => void;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  return (
    <div className="relative group">
      <button
        onClick={scrollPrev}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-4">
          {categories.map((c, index) => (
            <button
              key={`${c.id}-${index}`}
              onClick={() => {
                setFilter(c.name);
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_24%] min-w-0 relative aspect-[4/3] overflow-hidden rounded-3xl card-surface hover:border-accent/50 transition-all active:scale-95"
            >
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 h-full w-full bg-muted/50 flex items-center justify-center">
                  <ImageOff className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                <div className="text-[10px] uppercase tracking-widest text-accent font-bold drop-shadow-md">
                  {c.tagline}
                </div>
                <div className="font-display text-xl font-bold mt-0.5 text-white">
                  {c.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={scrollNext}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const Index = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<Product | null>(null);
  const setCartOpen = useCart((s) => s.setOpen);

  const menuProducts = useMenuStore((s) => s.products);

  // Dynamic categories from Supabase
  const categories = useCategoryStore((s) => s.categories);
  const categoriesLoading = useCategoryStore((s) => s.loading);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? menuProducts
        : menuProducts.filter((p) => p.category === filter),
    [filter, menuProducts],
  );
  const trending = useMemo(
    () => menuProducts.filter((p) => p.trending),
    [menuProducts],
  );

  return (
    <div className="min-h-[100dvh] pb-28 md:pb-0">
      <CustomerHeader />

      {/* HERO */}
      <section className="container pt-10 md:pt-16 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-5"
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Fresh fast food,
              <br />
              <span className="text-primary">made to order.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Smashed-to-order burgers, wood-fired pizza, hand-cut sides.
              Crafted by our chefs, ready when you are.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                size="lg"
                onClick={() =>
                  document
                    .getElementById("menu")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-12 px-7 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Order Now <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCartOpen(true)}
                className="h-12 px-7 rounded-lg border-border font-bold"
              >
                View Cart
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md pt-3">
              {[
                { icon: Clock, label: "25 min", sub: "avg delivery" },
                { icon: Flame, label: "100%", sub: "fresh daily" },
                { icon: ShieldCheck, label: "4.9★", sub: "12k reviews" },
              ].map((s, i) => (
                <div key={i} className="card-surface rounded-xl p-3.5">
                  <s.icon className="h-4 w-4 text-accent mb-1.5" />
                  <div className="font-display font-bold text-lg">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="relative max-w-[480px] mx-auto">
              <div className="overflow-hidden rounded-2xl shadow-elevated">
                <img
                  src={heroImg}
                  alt="Signature double cheeseburger"
                  className="w-full aspect-square object-cover"
                  width={1024}
                  height={1024}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container pb-16">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Browse Categories</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Pick your craving.
          </p>
        </div>
        {categoriesLoading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_24%] aspect-[4/3] rounded-3xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <CategoryCarousel categories={categories} setFilter={setFilter} />
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No categories yet — add some from the admin dashboard.
          </div>
        )}
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="container pb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Trending Now
            </p>
            <h2 className="font-display text-2xl font-bold mt-1">
              What everyone's ordering
            </h2>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
            {trending.map((p) => (
              <div key={p.id} className="min-w-[240px] md:min-w-0 snap-start">
                <ProductCard product={p} onSelect={setActive} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MENU */}
      <section id="menu" className="container pb-20 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">The Full Menu</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Tap any item to customize.
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 mb-6 pb-1">
          {(["All", ...categories.map((c) => c.name)] as Filter[]).map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{f}</span>
              </button>
            );
          })}
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={setActive} />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="font-display text-lg font-bold mb-3">Spice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fresh fast food made with quality ingredients. Serving the
                community since day one.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#menu"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Full Menu
                  </a>
                </li>
                <li>
                  <a
                    href="/orders"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Track Order
                  </a>
                </li>
                <li>
                  <a
                    href="/profile"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Account
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/login"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Admin Portal
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Hours
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mon — Fri: 11am – 11pm</li>
                <li>Saturday & Sunday: 11am – 12am</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  +923104360887
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  spice@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Main St, Gulberg 3 ,Lahore
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}Spice. All rights reserved.
          </div>
        </div>
      </footer>

      <ProductModal product={active} onClose={() => setActive(null)} />
      <CartSidebar />
      <CustomerMobileNav />
    </div>
  );
};

export default Index;
