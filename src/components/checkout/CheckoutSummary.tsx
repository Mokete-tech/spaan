
import React from "react";
import { Card } from "@/components/ui/card";

interface PlanDetails {
  name: string;
  price: number;
  currency: string;
  type: string;
}

interface CheckoutSummaryProps {
  plan: PlanDetails;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ plan }) => {
  return (
    <Card className="mb-6 p-6">
      <div className="flex justify-between mb-4">
        <span>Subscription</span>
        <span className="font-medium">{plan.name}</span>
      </div>
      <div className="flex justify-between border-t pt-4">
        <span className="font-bold">Total</span>
        <span className="font-bold">R{plan.price} / month</span>
      </div>
    </Card>
  );
};

export default CheckoutSummary;
