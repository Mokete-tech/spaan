
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Services = () => {
  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">All Services</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for services..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spaan-primary"
            />
          </div>
          <Button className="bg-spaan-primary hover:bg-spaan-primary/90">
            Search
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Services Directory</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our complete services catalog is being organized. Check back soon for a full listing of all available services on our platform.
            </p>
            <Button 
              variant="outline" 
              className="border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Services;
