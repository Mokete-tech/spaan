
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardPayment from "./CardPayment";
import StripePayment from "./StripePayment";
import PayPalPayment from "./PayPalPayment";

interface PaymentMethodTabsProps {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  formData: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  };
  paypalEmail: string;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPaypalEmail: (email: string) => void;
}

const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({
  paymentMethod,
  setPaymentMethod,
  formData,
  paypalEmail,
  errors,
  handleInputChange,
  setPaypalEmail,
}) => {
  return (
    <Tabs defaultValue="card" className="mb-6" onValueChange={(value) => setPaymentMethod(value)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="card">Credit Card</TabsTrigger>
        <TabsTrigger value="stripe">Stripe</TabsTrigger>
        <TabsTrigger value="paypal">PayPal</TabsTrigger>
      </TabsList>
      
      <TabsContent value="card" className="space-y-4 mt-4">
        <CardPayment 
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
        />
      </TabsContent>
      
      <TabsContent value="stripe" className="space-y-4 mt-4">
        <StripePayment />
      </TabsContent>
      
      <TabsContent value="paypal" className="space-y-4 mt-4">
        <PayPalPayment
          paypalEmail={paypalEmail}
          errors={errors}
          setPaypalEmail={setPaypalEmail}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethodTabs;
