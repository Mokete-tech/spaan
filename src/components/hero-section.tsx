
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, MapPin, Globe, HeartHandshake } from "lucide-react";
import CategoryDropdown from "./category-dropdown";
import { getUserLocation, UserLocation } from "@/services/location-service";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Failed to get user location:", error);
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery, "in location:", userLocation?.country);
    // Implement search functionality here
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800/90 to-indigo-700/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')] bg-cover bg-center opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white opacity-100">
            Find Help For Any Task, Big or Small
          </h1>
          <p className="text-xl text-white/90 mb-6 opacity-100">
            Connect with skilled locals and online freelancers in minutes
          </p>
          
          {/* Location Indicator */}
          {userLocation && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full">
                <MapPin className="h-4 w-4 text-white" />
                <span className="text-sm text-white">
                  {userLocation.city ? `${userLocation.city}, ` : ""}
                  {userLocation.country}
                </span>
              </div>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto opacity-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="What do you need help with?"
                  className="pl-10 py-6 rounded-md w-full border border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <CategoryDropdown />
              
              <Button 
                type="submit" 
                className="bg-spaan-primary hover:bg-spaan-primary/90 text-white py-6 px-6 rounded-md"
              >
                Find Help
              </Button>
            </form>
          </div>
          
          {/* Safety Badge */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Trusted & Verified Helpers</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full">
              <HeartHandshake className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white">Satisfaction Guaranteed</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full">
              <Globe className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white">Local & Online Services</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 opacity-100">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Cleaning
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Moving
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Design
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Repairs
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Tutoring
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm">
              Tech Help
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
