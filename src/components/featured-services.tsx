
import React, { useState, useEffect } from "react";
import ServiceCard from "./service-card";
import { featuredServices } from "@/data/services";
import { Button } from "./ui/button";
import { CreditCard, Shield, Globe, Users, Heart } from "lucide-react";
import { getUserLocation, shouldShowService, UserLocation } from "@/services/location-service";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

const FeaturedServices = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Filter services based on user location and selected category
  const filteredServices = featuredServices
    .filter(service => 
      showAllServices ? true : userLocation ? shouldShowService(userLocation, service.location, service.isDigital) : true
    )
    .filter(service => 
      activeCategory ? service.category === activeCategory : true
    );

  const categories = [...new Set(featuredServices.map(service => service.category))];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Popular Gigs</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Find available gigs posted by people who need help
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button 
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map(category => (
              <Button 
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {userLocation && (
            <div className="mt-2 flex justify-center items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {showAllServices ? "Showing all gigs" : `Showing gigs available in ${userLocation.country}`}
              </span>
              <Badge 
                className="ml-2 cursor-pointer" 
                variant="outline"
                onClick={() => setShowAllServices(!showAllServices)}
              >
                {showAllServices ? "Show Local Only" : "Show All Gigs"}
              </Badge>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  {...service} 
                  currency={userLocation?.currency || "ZAR"} 
                />
              ))}
            </div>
            
            {filteredServices.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
                <p className="text-gray-600 mb-6">
                  {activeCategory 
                    ? `No ${activeCategory} gigs available in your area. Try showing all gigs.`
                    : 'No gigs available in your area. Try showing all gigs.'}
                </p>
                <Button 
                  onClick={() => setShowAllServices(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Show All Gigs
                </Button>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Link to="/gigs">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  View All Gigs
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Monetization & Safety Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-xl font-bold">Verified Gigs</h3>
            </div>
            <p className="text-gray-600">
              Every gig on our platform is verified to ensure quality and legitimacy for your peace of mind.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-xl font-bold">Secure Payments</h3>
            </div>
            <p className="text-gray-600">
              Only pay when you're satisfied with the work. Your payment is held securely until you approve completion.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-xl font-bold">Satisfaction Guarantee</h3>
            </div>
            <p className="text-gray-600">
              Not happy with the service? We'll work with you to make it right or give you your money back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
