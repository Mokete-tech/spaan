
import React from "react";
import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/hero-section";
import FeaturedServices from "@/components/featured-services";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedServices />
    </main>
  );
};

export default Index;
