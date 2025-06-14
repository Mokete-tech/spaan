
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BusinessInfoStepProps {
  businessName: string;
  setBusinessName: (value: string) => void;
  businessDescription: string;
  setBusinessDescription: (value: string) => void;
  onNext: () => void;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  businessName,
  setBusinessName,
  businessDescription,
  setBusinessDescription,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
        <p className="text-gray-600 mb-6">
          Tell us about your business or service offering
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-medium">
            Business Name *
          </label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your business or service name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="businessDescription" className="text-sm font-medium">
            Business Description *
          </label>
          <Textarea
            id="businessDescription"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="Describe your business, services, and expertise..."
            rows={5}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          className="bg-spaan-primary hover:bg-spaan-primary/90"
          disabled={!businessName || !businessDescription}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
