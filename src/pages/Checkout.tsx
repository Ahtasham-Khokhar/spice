import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { CustomerHeader } from "@/components/site/CustomerHeader";
import { CustomerMobileNav } from "@/components/site/CustomerMobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/stores/cart";
import { useOrders } from "@/stores/orders";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";

const FEE = 1.99;

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const createOrder = useOrders((s) => s.createOrder);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12/29");
  const [cvc, setCvc] = useState("123");
  const [processing, setProcessing] = useState(false);
  const total = subtotal + (items.length ? FEE : 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh]">
        <CustomerHeader />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Add a few items, then come back to checkout.</p>
          <Button asChild className="mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">Browse menu</Link>
          </Button>
        </div>
        <CustomerMobileNav />
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) { toast.error("Please fill in your name and address."); return; }
    setProcessing(true);
    setTimeout(() => {
      const order = createOrder({ items, total, customerName: name, address });
      clear();
      setProcessing(false);
      toast.success("Payment successful!", { description: `Order ${order.id} confirmed.`, icon: <CheckCircle2 className="h-4 w-4 text-accent" /> });
      navigate(`/orders/${order.id}`);
    }, 1800);
  };

  return (
    <div className="min-h-[100dvh] pb-28 md:pb-12">
      <CustomerHeader />
      <div className="container py-8 max-w-5xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-5 gap-6">
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="lg:col-span-3 space-y-6">
            <section className="card-surface rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold">Delivery Details</h2>
              <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" /></div>
              <div className="space-y-2"><Label htmlFor="addr">Delivery address</Label><Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Apt 4B" /></div>
            </section>
            <section className="card-surface rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment</h2>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Secure checkout</span>
              </div>
              <div className="space-y-2"><Label htmlFor="card">Card number</Label><Input id="card" value={card} onChange={(e) => setCard(e.target.value)} className="font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="exp">Expiry</Label><Input id="exp" value={exp} onChange={(e) => setExp(e.target.value)} className="font-mono" /></div>
                <div className="space-y-2"><Label htmlFor="cvc">CVC</Label><Input id="cvc" value={cvc} onChange={(e) => setCvc(e.target.value)} className="font-mono" /></div>
              </div>
            </section>
            <Button type="submit" size="lg" disabled={processing} className="w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold">
              {processing ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing…</>) : (<>Pay {formatMoney(total)}</>)}
            </Button>
          </motion.form>
          <aside className="lg:col-span-2">
            <div className="card-surface rounded-xl p-6 space-y-4 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {items.map((line) => (
                  <div key={line.lineId} className="flex gap-3 text-sm">
                    <img src={line.product.image} alt={line.product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0"><div className="font-semibold truncate">{line.product.name}</div><div className="text-xs text-muted-foreground">Qty {line.quantity}</div></div>
                    <div className="font-semibold">{formatMoney(line.unitPrice * line.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{formatMoney(FEE)}</span></div>
                <div className="flex justify-between font-display text-lg font-bold pt-2 border-t border-border"><span>Total</span><span className="text-primary">{formatMoney(total)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <CustomerMobileNav />
    </div>
  );
};

export default Checkout;
