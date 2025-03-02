
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CategoryDropdown from "./category-dropdown";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10"></div>
        <img
          src="/lovable-uploads/6cf2c389-9e97-4971-a1bd-011ac69caf4e.png"
          alt="Hero background"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-slideUp opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            Find skilled professionals for any job
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slideUp opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            Local experts will take it from here
          </p>
          
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-3xl mx-auto animate-slideUp opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for any service..."
                  className="pl-10 py-6 rounded-md w-full border border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <CategoryDropdown />
              
              <Button 
                type="submit" 
                className="bg-spaan-primary hover:bg-spaan-primary/90 text-white py-6 px-8 rounded-md"
              >
                Search
              </Button>
            </form>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slideUp opacity-0" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Home Maintenance
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Landscaping
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Cleaning
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Moving
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
