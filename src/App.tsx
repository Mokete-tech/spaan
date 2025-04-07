
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context";
import Navbar from "@/components/ui/navbar";
import { useEffect } from "react";
import { initSentry } from "@/utils/errorHandling";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/NotFound";
import Services from "@/pages/Services";
import Explore from "@/pages/Explore";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import Providers from "@/pages/Providers";
import ProviderApplication from "@/pages/ProviderApplication";
import Pricing from "@/pages/Pricing";
import Checkout from "@/pages/Checkout";
import Cart from "@/pages/Cart";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import ProfileWizard from "@/pages/ProfileWizard";

import "@/App.css";

function App() {
  // Initialize Sentry when the app loads
  useEffect(() => {
    initSentry();
    
    // Set up global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log the error to the console
      originalConsoleError(...args);
      
      // Additional processing for specific errors could be added here
    };
    
    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile-wizard" element={<ProfileWizard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/provider-application" element={<ProviderApplication />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
