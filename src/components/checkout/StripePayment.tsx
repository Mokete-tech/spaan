
import React from "react";

const StripePayment: React.FC = () => {
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
    </div>
  );
};

export default StripePayment;
