
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AdBanner from "@/components/ui/ad-banner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProviderApplication from "./pages/ProviderApplication";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import PostJob from "./pages/PostJob";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <AdBanner slot="top" showCloseButton={true} />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/gigs" element={<Services />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/post-job" element={<PostJob />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/providers/apply" element={
          <ProtectedRoute>
            <ProviderApplication />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <AdBanner slot="bottom" format="large-banner" className="md:hidden" showCloseButton={true} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
