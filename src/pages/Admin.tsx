import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Package, Trophy, Activity,
  Plus, Pencil, Trash2, Save, X, ImageIcon,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/stores/auth";
import { useOrders, ORDER_STATUSES, type OrderStatus } from "@/stores/orders";
import { useStock } from "@/stores/stock";
import { useMenuStore, type MenuProduct } from "@/stores/menuStore";
import { formatMoney, formatTime } from "@/lib/format";
import { toast } from "sonner";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Received: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Cooking: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Out for Delivery": "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Delivered: "bg-muted text-muted-foreground border-border",
};

type EditableProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
};

const emptyProduct = (): EditableProduct => ({
  id: "",
  name: "",
  description: "",
  price: "",
  image: "",
  category: "Burgers",
});

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const stockMap = useStock((s) => s.outOfStock);
  const toggleStock = useStock((s) => s.toggle);

  const menuProducts = useMenuStore((s) => s.products);
  const addProduct = useMenuStore((s) => s.addProduct);
  const updateProduct = useMenuStore((s) => s.updateProduct);
  const deleteProduct = useMenuStore((s) => s.deleteProduct);

  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const counts: Record<string, number> = {};
    orders.forEach((o) =>
      o.items.forEach((i) => {
        counts[i.product.name] = (counts[i.product.name] || 0) + i.quantity;
      })
    );
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      revenue,
      ordersCount: orders.length,
      topItem: top ? { name: top[0], qty: top[1] } : null,
      active: orders.filter((o) => o.status !== "Delivered").length,
    };
  }, [orders]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const statCards = [
    { icon: DollarSign, label: "Total Revenue", value: formatMoney(stats.revenue), color: "text-accent" },
    { icon: Package, label: "Total Orders", value: stats.ordersCount.toString(), color: "text-blue-400" },
    { icon: Activity, label: "Active Now", value: stats.active.toString(), color: "text-amber-400" },
    { icon: Trophy, label: "Top Seller", value: stats.topItem?.name ?? "—", sub: stats.topItem ? `${stats.topItem.qty} sold` : "No orders yet", color: "text-primary" },
  ];

  const startEdit = (p: MenuProduct) => {
    setEditing({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      image: p.image,
      category: p.category,
    });
    setIsNewItem(false);
  };

  const startNew = () => {
    setEditing(emptyProduct());
    setIsNewItem(true);
  };

  const saveItem = () => {
    if (!editing) return;
    const price = parseFloat(editing.price);
    if (!editing.name || isNaN(price) || price <= 0) {
      toast.error("Please fill in name and a valid price.");
      return;
    }
    if (isNewItem) {
      addProduct({
        name: editing.name,
        description: editing.description,
        price,
        image: editing.image || "/placeholder.svg",
        category: editing.category as MenuProduct["category"],
        rating: 4.5,
        reviews: 0,
      });
      toast.success(`"${editing.name}" added to menu`);
    } else {
      updateProduct(editing.id, {
        name: editing.name,
        description: editing.description,
        price,
        image: editing.image,
        category: editing.category as MenuProduct["category"],
      });
      toast.success(`"${editing.name}" updated`);
    }
    setEditing(null);
  };

  const handleDelete = (p: MenuProduct) => {
    deleteProduct(p.id);
    toast.success(`"${p.name}" removed from menu`);
  };

  return (
    <div className="min-h-[100dvh] pb-12">
      <AdminHeader />
      <div className="container py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Admin Dashboard
          </p>
          <h1 className="font-display text-3xl font-bold mt-1">Overview</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {statCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-surface rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {c.label}
                </div>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-2 truncate">
                {c.value}
              </div>
              {c.sub && (
                <div className="text-xs text-muted-foreground mt-1">
                  {c.sub}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabs: Orders / Menu / Inventory */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <section className="card-surface rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-4">
                Live Orders
              </h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No orders yet — place a test order from the menu.
                </div>
              ) : (
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <motion.div
                      key={o.id}
                      layout
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold">
                              {o.id}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-wider rounded-md border px-2 py-0.5 ${STATUS_COLORS[o.status]}`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {o.customerName} · {formatTime(o.createdAt)} ·{" "}
                            {o.items.length} items
                          </div>
                        </div>
                        <div className="font-display font-bold">
                          {formatMoney(o.total)}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground line-clamp-1 flex-1 min-w-0">
                          {o.items
                            .map((i) => `${i.quantity}× ${i.product.name}`)
                            .join(", ")}
                        </div>
                        <Select
                          value={o.status}
                          onValueChange={(v) =>
                            setStatus(o.id, v as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-[180px] h-9 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* MENU MANAGEMENT TAB */}
          <TabsContent value="menu">
            <section className="card-surface rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold">
                  Manage Menu
                </h2>
                <Button
                  onClick={startNew}
                  size="sm"
                  className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>

              {/* Edit / Add form */}
              <AnimatePresence>
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold">
                          {isNewItem ? "Add New Item" : "Edit Item"}
                        </h3>
                        <button
                          onClick={() => setEditing(null)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={editing.name}
                            onChange={(e) =>
                              setEditing({ ...editing, name: e.target.value })
                            }
                            placeholder="Double Cheeseburger"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={(e) =>
                              setEditing({ ...editing, price: e.target.value })
                            }
                            placeholder="12.99"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editing.description}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe the item…"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={editing.category}
                            onValueChange={(v) =>
                              setEditing({ ...editing, category: v })
                            }
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Burgers", "Pizza", "Sides", "Drinks"].map(
                                (c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={editing.image}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  image: e.target.value,
                                })
                              }
                              className="pl-10"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={saveItem}
                        className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isNewItem ? "Add to Menu" : "Save Changes"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Menu items list */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {menuProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-14 w-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.category} · {formatMoney(p.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory">
            <section className="card-surface rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-4">
                Inventory
              </h2>
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {menuProducts.map((p) => {
                  const inStock = !stockMap[p.id];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {p.name}
                        </div>
                        <div
                          className={`text-[11px] font-medium uppercase tracking-wider ${
                            inStock ? "text-accent" : "text-destructive"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </div>
                      </div>
                      <Switch
                        checked={inStock}
                        onCheckedChange={() => toggleStock(p.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
