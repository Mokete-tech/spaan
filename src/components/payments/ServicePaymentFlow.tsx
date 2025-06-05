
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CreditCard, Shield } from "lucide-react";

interface ServicePaymentFlowProps {
  serviceId: string;
  providerId: string;
  amount: number;
  currency: string;
  serviceName: string;
  onPaymentSuccess?: () => void;
}

const ServicePaymentFlow: React.FC<ServicePaymentFlowProps> = ({
  serviceId,
  providerId,
  amount,
  currency,
  serviceName,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this service",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Start escrow payment process
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "start_escrow",
          serviceId,
          buyerId: user.id,
          providerId,
          amount,
          currency,
          paymentMethod: currency === "ZAR" ? "payfast" : "stripe",
          paymentDetails: {
            serviceName,
            buyerEmail: user.email,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed and will be held in escrow until service completion.",
        });

        // Redirect to payment processor or show success
        if (data.payment_data?.checkout_url) {
          window.open(data.payment_data.checkout_url, '_blank');
        }

        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(data.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Secure Escrow Payment
        </CardTitle>
        <CardDescription>
          Your payment will be held securely until service completion
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Service:</span>
            <span>{serviceName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Payment Method:</span>
            <span>{currency === "ZAR" ? "PayFast" : "Stripe"}</span>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>✅ Payment held in secure escrow</p>
          <p>✅ Released only when you approve</p>
          <p>✅ Full refund if service not delivered</p>
          <p>✅ 7% platform fee (included in price)</p>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Securely
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServicePaymentFlow;
