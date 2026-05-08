import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Checkout from "./pages/Checkout.tsx";
import Orders from "./pages/Orders.tsx";
import CustomerLogin from "./pages/CustomerLogin.tsx";
import Profile from "./pages/Profile.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";
import { useAuth } from "@/stores/auth";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const AuthBootstrap = () => {
  const init = useAuth((s) => s.init);
  useEffect(() => init(), [init]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthBootstrap />
      <BrowserRouter>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<Index />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<Orders />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin routes — fully isolated */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
