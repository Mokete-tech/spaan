
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, AlertCircle } from "lucide-react";

interface PayPalPaymentProps {
  paypalEmail: string;
  errors: Record<string, string>;
  setPaypalEmail: (email: string) => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  paypalEmail,
  errors,
  setPaypalEmail,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="paypalEmail">PayPal email</Label>
        <div className="relative">
          <Input
            id="paypalEmail"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="you@example.com"
            className={`pl-10 ${errors.paypalEmail ? "border-red-500" : ""}`}
          />
          <DollarSign className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </div>
        {errors.paypalEmail && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.paypalEmail}
          </p>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-700">
          You'll be redirected to PayPal to complete your payment securely.
        </p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-sm text-yellow-700">
          For South African clients, PayFast will be used for processing EFT and local card payments.
        </p>
      </div>
    </div>
  );
};

export default PayPalPayment;
