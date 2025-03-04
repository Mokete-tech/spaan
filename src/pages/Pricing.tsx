
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PricingCard = ({ 
  title, 
  price, 
  features, 
  buttonText, 
  recommended = false,
  onSelect
}: { 
  title: string; 
  price: string; 
  features: string[]; 
  buttonText: string;
  recommended?: boolean;
  onSelect: () => void;
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${recommended ? 'border-2 border-blue-500 relative' : ''}`}>
      {recommended && (
        <Badge variant="info" className="absolute top-4 right-4">
          Recommended
        </Badge>
      )}
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-6">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-gray-500 ml-1">/month</span>}
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full ${recommended ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate("/auth?redirect=pricing");
      return;
    }
    
    // If the plan is free, just activate it
    if (planId === "free") {
      navigate("/profile");
      return;
    }
    
    // For paid plans, navigate to a checkout page
    navigate(`/checkout?plan=${planId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600">
            Choose the plan that works best for you, whether you're looking for work or hiring help.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Basic"
            price="Free"
            features={[
              "Browse all services",
              "Contact up to 5 providers per month",
              "Basic profile",
              "Community support"
            ]}
            buttonText="Get Started"
            onSelect={() => handleSelectPlan("free")}
          />
          
          <PricingCard
            title="Pro"
            price="R99"
            features={[
              "Unlimited provider contacts",
              "Priority support",
              "Enhanced profile visibility",
              "Discounted service fees (3%)",
              "Advanced search filters"
            ]}
            buttonText="Subscribe"
            recommended={true}
            onSelect={() => handleSelectPlan("pro")}
          />
          
          <PricingCard
            title="Business"
            price="R299"
            features={[
              "Everything in Pro",
              "Dedicated account manager",
              "Team collaboration tools",
              "Minimal service fees (1%)",
              "Business verification badge",
              "Bulk project postings"
            ]}
            buttonText="Subscribe"
            onSelect={() => handleSelectPlan("business")}
          />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">For Service Providers</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Earn money by offering your services on our platform. We take a small commission only when you get paid.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter Provider"
              price="Free"
              features={[
                "List up to 3 services",
                "8% service fee on transactions",
                "Basic analytics",
                "Standard support"
              ]}
              buttonText="Start Selling"
              onSelect={() => navigate("/providers/apply")}
            />
            
            <PricingCard
              title="Professional Provider"
              price="R149"
              features={[
                "List unlimited services",
                "5% service fee on transactions",
                "Featured in search results",
                "Priority support",
                "Advanced analytics"
              ]}
              buttonText="Upgrade"
              recommended={true}
              onSelect={() => handleSelectPlan("pro-provider")}
            />
            
            <PricingCard
              title="Agency"
              price="R399"
              features={[
                "Everything in Professional",
                "3% service fee on transactions",
                "Top search placement",
                "Team accounts",
                "Custom branding options",
                "API access"
              ]}
              buttonText="Contact Sales"
              onSelect={() => navigate("/contact-sales")}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Pricing;
