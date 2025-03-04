
import React, { useState } from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { categories, featuredServices } from "@/data/services";
import CategoryDropdown from "@/components/category-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId === "all" ? null : categoryId);
    setActiveSubcategory(null);
  };
  
  const handleSubcategorySelect = (subcategory: string) => {
    setActiveSubcategory(subcategory === activeSubcategory ? null : subcategory);
  };
  
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-spaan-primary hover:bg-spaan-primary/90">
            Search
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Categories
            </h2>
            
            <div className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${!activeCategory ? 'bg-spaan-primary/10 text-spaan-primary font-medium' : 'hover:bg-gray-100'}`}
                onClick={() => handleCategoryChange("all")}
              >
                All Categories
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeCategory === category.id ? 'bg-spaan-primary/10 text-spaan-primary font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {activeCategory && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3">Subcategories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.find(c => c.id === activeCategory)?.subcategories.map((subcat) => (
                    <Badge 
                      key={subcat}
                      variant={activeSubcategory === subcat ? "default" : "outline"}
                      className={`cursor-pointer ${activeSubcategory === subcat ? 'bg-spaan-primary' : 'hover:bg-gray-100'}`}
                      onClick={() => handleSubcategorySelect(subcat)}
                    >
                      {subcat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Service Types</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-spaan-primary focus:ring-spaan-primary" />
                  <span>Local Services</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-spaan-primary focus:ring-spaan-primary" />
                  <span>Digital Services</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-spaan-primary focus:ring-spaan-primary" />
                  <span>Freelancers</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold mb-6">
                {activeCategory 
                  ? categories.find(c => c.id === activeCategory)?.name 
                  : 'All Services'}
                {activeSubcategory && ` - ${activeSubcategory}`}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="object-cover w-full h-48"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{service.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                        </div>
                        <Badge variant={service.isDigital ? "outline" : "default"} className="ml-2">
                          {service.isDigital ? "Digital" : "Local"}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-4 justify-between">
                        <div className="flex items-center">
                          <img
                            src={service.provider.avatar}
                            alt={service.provider.name}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                          <span className="text-sm font-medium line-clamp-1">{service.provider.name}</span>
                        </div>
                        <p className="font-bold text-spaan-primary">
                          R{service.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {featuredServices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-6">
                    No services found matching your criteria. Try adjusting your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-spaan-primary text-spaan-primary hover:bg-spaan-primary/10"
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveSubcategory(null);
                      setSearchTerm("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Services;
