
import React from "react";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center mb-6">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
        currentStep >= 1 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
      }`}>
        1
      </div>
      <div className="h-0.5 flex-grow bg-gray-200 mx-2">
        <div className={`h-full bg-spaan-primary transition-all ${
          currentStep > 1 ? "w-full" : "w-0"
        }`}></div>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
        currentStep >= 2 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
      }`}>
        2
      </div>
      <div className="h-0.5 flex-grow bg-gray-200 mx-2">
        <div className={`h-full bg-spaan-primary transition-all ${
          currentStep > 2 ? "w-full" : "w-0"
        }`}></div>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        currentStep >= 3 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
      }`}>
        3
      </div>
    </div>
  );
};

export default StepIndicator;
