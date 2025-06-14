
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck } from "lucide-react";

interface ApplicationSuccessStateProps {
  autoApproved: boolean;
}

const ApplicationSuccessState: React.FC<ApplicationSuccessStateProps> = ({ autoApproved }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        {autoApproved ? (
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        ) : (
          <ShieldCheck className="h-24 w-24 text-blue-500 mx-auto mb-6" />
        )}
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">
        {autoApproved ? "Application Approved!" : "Application Submitted!"}
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        {autoApproved 
          ? "Congratulations! Your provider application has been automatically approved. You can now start creating service listings and accepting jobs."
          : "Thank you for submitting your provider application. Our team will review your documents and get back to you within 1-3 business days."
        }
      </p>
      
      <div className="space-y-4">
        <Button 
          onClick={() => navigate("/profile")}
          className="bg-spaan-primary hover:bg-spaan-primary/90 w-full md:w-auto"
        >
          Go to Profile
        </Button>
        {autoApproved && (
          <Button 
            onClick={() => navigate("/services")}
            variant="outline"
            className="w-full md:w-auto md:ml-4"
          >
            Browse Services
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationSuccessState;
