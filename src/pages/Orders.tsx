import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChefHat, Bike, PackageCheck, Receipt, Clock } from "lucide-react";
import { CustomerHeader } from "@/components/site/CustomerHeader";
import { CustomerMobileNav } from "@/components/site/CustomerMobileNav";
import { useOrders, ORDER_STATUSES, type OrderStatus } from "@/stores/orders";
import { formatMoney, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

const ICONS: Record<OrderStatus, typeof Receipt> = {
  Received: Receipt,
  Cooking: ChefHat,
  "Out for Delivery": Bike,
  Delivered: PackageCheck,
};

const Orders = () => {
  const { id } = useParams();
  const orders = useOrders((s) => s.orders);
  const order = id ? orders.find((o) => o.id === id) : orders[0];

  if (!order) {
    return (
      <div className="min-h-[100dvh] pb-28 md:pb-12">
        <CustomerHeader />
        <div className="container py-24 text-center max-w-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted mb-6">
            <Receipt className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">No orders yet</h1>
          <p className="text-muted-foreground mt-2">Place your first order to track it live here.</p>
          <Button asChild className="mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">Browse menu</Link>
          </Button>
        </div>
        <CustomerMobileNav />
      </div>
    );
  }

  const currentIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="min-h-[100dvh] pb-28 md:pb-12">
      <CustomerHeader />
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">Live Tracking</p>
            <h1 className="font-display text-3xl font-bold mt-1">Order {order.id}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Placed at {formatTime(order.createdAt)}
          </div>
        </div>

        {/* Status Tracker */}
        <div className="card-surface rounded-xl p-6 sm:p-8 mt-6">
          <div className="relative">
            <div className="absolute top-7 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentIdx / (ORDER_STATUSES.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
            <div className="relative grid grid-cols-4 gap-2">
              {ORDER_STATUSES.map((s, i) => {
                const Icon = ICONS[s];
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} className="flex flex-col items-center text-center gap-2">
                    <motion.div
                      animate={active ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: active ? Infinity : 0 }}
                      className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-colors ${
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                    >
                      {done && i < currentIdx ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </motion.div>
                    <div className={`text-[11px] sm:text-sm font-medium leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.div key={order.status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
            <div className="text-sm text-muted-foreground">Current status</div>
            <div className="font-display text-2xl font-bold text-primary mt-1">{order.status}</div>
            {order.status !== "Delivered" && (
              <div className="text-xs text-muted-foreground mt-2">Updates automatically — hang tight</div>
            )}
          </motion.div>
        </div>

        {/* Items + summary */}
        <div className="grid md:grid-cols-5 gap-4 mt-6">
          <div className="md:col-span-3 card-surface rounded-xl p-6 space-y-3">
            <h2 className="font-display text-lg font-bold">Items</h2>
            {order.items.map((line) => (
              <div key={line.lineId} className="flex gap-3 text-sm">
                <img src={line.product.image} alt={line.product.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{line.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {line.quantity}{line.selectedMods.length > 0 && ` · ${line.selectedMods.map((m) => m.name).join(", ")}`}
                  </div>
                </div>
                <div className="font-semibold">{formatMoney(line.unitPrice * line.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="md:col-span-2 card-surface rounded-xl p-6 space-y-3">
            <h2 className="font-display text-lg font-bold">Delivery</h2>
            <div className="text-sm">
              <div className="font-semibold">{order.customerName}</div>
              <div className="text-muted-foreground">{order.address}</div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Total</span><span className="text-primary">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Past orders */}
        {orders.length > 1 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold mb-3">Past orders</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {orders.filter((o) => o.id !== order.id).map((o) => (
                <Link key={o.id} to={`/orders/${o.id}`} className="card-surface rounded-xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-semibold">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(o.createdAt)} · {o.items.length} items</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-accent font-semibold uppercase tracking-wider">{o.status}</div>
                    <div className="font-display font-bold">{formatMoney(o.total)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <CustomerMobileNav />
    </div>
  );
};

export default Orders;
