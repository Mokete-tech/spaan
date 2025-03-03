
import React from "react";
import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/hero-section";
import FeaturedServices from "@/components/featured-services";
import { Toaster } from "sonner";

const Index = () => {
  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <HeroSection />
      <FeaturedServices />
      
      {/* Backend Integration Note (remove this for production) */}
      <div className="bg-blue-50 border-t border-blue-100 py-3">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-sm text-blue-800 text-center">
            <strong>Developer Note:</strong> Connect to a backend service for escrow payments, user authentication, 
            and service provider verification. Ready for integration with payment processors and database services.
          </p>
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Index;
