export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR" }).format(n);

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
