
import React from "react";
import HeroSection from "@/components/hero-section";
import FeaturedServices from "@/components/featured-services";
import { Toaster } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Clock, Globe, Users, HeartHandshake, Search } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <FeaturedServices />
      
      {/* How It Works Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting help has never been easier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Find a Gig</h3>
              <p className="text-gray-600">
                Browse available gigs or post your own request for what you need help with.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. Connect with People</h3>
              <p className="text-gray-600">
                Choose from available gigs or receive offers on your posted request.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Get it Done</h3>
              <p className="text-gray-600">
                Complete the gig and payment is only released when you're satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Gigs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Need help with something?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Post a gig on Spaan and let qualified people help you get it done. It's quick and easy!
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
                  <span>Set your budget and timeline</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                  <span>Get offers within hours</span>
                </li>
                <li className="flex items-start">
                  <Globe className="h-5 w-5 mr-2 text-purple-500 mt-0.5" />
                  <span>Find local help or online assistance</span>
                </li>
                <li className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                  <span>Only pay when you're satisfied with the result</span>
                </li>
              </ul>
              <Link to="/post-job">
                <Button className="bg-blue-500 hover:bg-blue-600 px-6">
                  Post a Gig
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Person working" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Index;
