
import React from "react";
import ServiceCard from "./service-card";
import { featuredServices } from "@/data/services";
import { Button } from "./ui/button";
import { CreditCard, Shield } from "lucide-react";

const FeaturedServices = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most sought-after services by top-rated professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>

        {/* Monetization & Safety Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <CreditCard className="h-8 w-8 text-spaan-primary mr-3" />
              <h3 className="text-xl font-bold">Secure Payments</h3>
            </div>
            <p className="text-gray-600 mb-6">
              All transactions are processed through our secure payment gateway. We only release payment to service providers once you confirm the job is completed satisfactorily.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Service Fee: 5%</p>
              <p className="text-sm text-gray-500 mt-1">A small service fee helps us maintain the platform and provide support.</p>
            </div>
            <Button className="mt-6 w-full bg-spaan-primary hover:bg-spaan-primary/90">
              Learn More About Payments
            </Button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-xl font-bold">Trust & Safety</h3>
            </div>
            <p className="text-gray-600 mb-4">
              All service providers on our platform go through a rigorous verification process to ensure your safety and satisfaction.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">✓</span>
                <span>Identity verification</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">✓</span>
                <span>Skills assessment</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">✓</span>
                <span>Background checks</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 mt-0.5">✓</span>
                <span>User reviews verification</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-2 w-full border-green-500 text-green-500 hover:bg-green-50">
              Our Safety Standards
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
