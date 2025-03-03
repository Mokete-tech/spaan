
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";

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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
            <ul className="space-y-2">
              <li className="py-2 border-b border-gray-100">Home Services</li>
              <li className="py-2 border-b border-gray-100">Professional Services</li>
              <li className="py-2 border-b border-gray-100">Digital Marketing</li>
              <li className="py-2 border-b border-gray-100">Education & Tutoring</li>
              <li className="py-2">Health & Wellness</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Featured Exploration</h2>
            <p className="text-gray-600 mb-4">
              Discover our curated selection of top-rated services across various categories.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">Explore page content coming soon!</p>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Explore;
