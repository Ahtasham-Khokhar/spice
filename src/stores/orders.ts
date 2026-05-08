import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cart";

export type OrderStatus = "Received" | "Cooking" | "Out for Delivery" | "Delivered";
export const ORDER_STATUSES: OrderStatus[] = ["Received", "Cooking", "Out for Delivery", "Delivered"];

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  customerName: string;
  address: string;
};

type OrderState = {
  orders: Order[];
  createOrder: (o: Omit<Order, "id" | "createdAt" | "status"> & { status?: OrderStatus }) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  toggleStock: (productId: string) => void; // routed via product store
};

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: (o) => {
        const order: Order = {
          ...o,
          id: "AH-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          createdAt: Date.now(),
          status: o.status ?? "Received",
        };
        set({ orders: [order, ...get().orders] });
        // Auto-advance status to simulate live tracking
        const advance = (next: OrderStatus, delay: number) =>
          setTimeout(() => {
            const cur = get().orders.find((x) => x.id === order.id);
            if (cur && cur.status !== "Delivered") get().setStatus(order.id, next);
          }, delay);
        advance("Cooking", 8000);
        advance("Out for Delivery", 20000);
        advance("Delivered", 35000);
        return order;
      },
      setStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
      toggleStock: () => {},
    }),
    { name: "ahsam-orders-v1" },
  ),
);
