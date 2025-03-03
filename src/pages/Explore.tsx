
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const Explore = () => {
  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">Explore Services</h1>
        <p className="text-lg text-gray-600 mb-8">
          Browse through various categories and discover services that match your needs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                <li>
                  <Link 
                    to="/services?category=home-services" 
                    className="flex items-center justify-between py-3 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <span>Home Services</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services?category=professional-services" 
                    className="flex items-center justify-between py-3 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <span>Professional Services</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services?category=digital-marketing" 
                    className="flex items-center justify-between py-3 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <span>Digital Marketing</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services?category=education" 
                    className="flex items-center justify-between py-3 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <span>Education & Tutoring</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services?category=health" 
                    className="flex items-center justify-between py-3 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <span>Health & Wellness</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services"
                    className="flex items-center justify-center py-3 px-6 text-spaan-primary font-medium hover:bg-gray-50 transition-colors"
                  >
                    View All Categories
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 md:col-span-2">
            <CardHeader>
              <CardTitle>Featured Exploration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discover our curated selection of top-rated services across various categories.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Link 
                  to="/services?type=popular"
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-spaan-primary font-bold">★</span>
                  </div>
                  <h3 className="font-medium mb-1">Popular Services</h3>
                  <p className="text-sm text-gray-500">Most used services by our customers</p>
                </Link>
                <Link 
                  to="/services?type=new"
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-green-600 font-bold">New</span>
                  </div>
                  <h3 className="font-medium mb-1">Newest Additions</h3>
                  <p className="text-sm text-gray-500">Recently added services to our platform</p>
                </Link>
                <Link 
                  to="/services?type=digital"
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-purple-600 font-bold">💻</span>
                  </div>
                  <h3 className="font-medium mb-1">Digital Services</h3>
                  <p className="text-sm text-gray-500">Remote work & digital solutions</p>
                </Link>
                <Link 
                  to="/services?type=local"
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-yellow-600 font-bold">📍</span>
                  </div>
                  <h3 className="font-medium mb-1">Local Services</h3>
                  <p className="text-sm text-gray-500">Services available in your area</p>
                </Link>
              </div>
              <div className="mt-6 text-center">
                <Button asChild className="bg-spaan-primary hover:bg-spaan-primary/90">
                  <Link to="/services">Browse All Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Explore;
