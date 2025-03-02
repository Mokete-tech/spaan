
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield } from "lucide-react";
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
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-indigo-800/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')] bg-cover bg-center opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white opacity-100">
            Find skilled professionals for any job
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 opacity-100">
            Local experts will take it from here
          </p>
          
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-3xl mx-auto opacity-100">
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
          
          {/* Safety Badge */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">All providers are vetted for your safety</span>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-100">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Home Maintenance
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Landscaping
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Cleaning
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Moving
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Digital Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
