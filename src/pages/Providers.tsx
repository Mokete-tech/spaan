
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { Shield } from "lucide-react";

const Providers = () => {
  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">Service Providers</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with skilled and verified professionals ready to deliver quality services.
        </p>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-xl font-bold">Verified Professionals</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            All service providers on our platform undergo thorough verification to ensure quality and reliability:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Identity Verification</h3>
              <p className="text-sm text-gray-600">Each provider's identity is verified using South African ID or passport.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Skills Assessment</h3>
              <p className="text-sm text-gray-600">We verify professional qualifications and certifications where applicable.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Background Checks</h3>
              <p className="text-sm text-gray-600">Criminal background checks ensure your safety and peace of mind.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Contact Verification</h3>
              <p className="text-sm text-gray-600">Mobile numbers are verified through regional carriers for authenticity.</p>
            </div>
          </div>
          
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Our provider directory is being updated. Check back soon to browse through our network of verified professionals.
            </p>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Providers;
