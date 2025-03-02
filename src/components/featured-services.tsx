
import React from "react";
import ServiceCard from "./service-card";
import { featuredServices } from "@/data/services";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
