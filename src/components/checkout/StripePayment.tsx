
import React from "react";
import { processPayment } from "@/utils/paymentProcessing";

interface StripePaymentProps {
  onSubmit?: (paymentDetails: any) => Promise<void>;
  planDetails?: {
    serviceId: string;
    providerId: string;
    amount: number;
    currency: string;
    description: string;
  };
}

const StripePayment: React.FC<StripePaymentProps> = ({ onSubmit, planDetails }) => {
  const handleSubmit = async () => {
    if (onSubmit && planDetails) {
      try {
        // Use our enhanced payment processor with auto-retry
        await processPayment({
          ...planDetails,
          paymentMethod: "stripe"
        });
      } catch (error) {
        console.error("Payment processing failed after retries:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-700">
          You'll be redirected to Stripe to complete your payment securely.
        </p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-sm text-yellow-700">
          Note: For international clients, payments will be processed using Payoneer's integrated solution.
        </p>
      </div>

      {onSubmit && (
        <button 
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Proceed to Stripe Payment
        </button>
      )}
    </div>
  );
};

export default StripePayment;
