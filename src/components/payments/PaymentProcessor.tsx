import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Ban } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generatePayFastCheckout, processPayment } from "@/utils/paymentProcessing";
import { useAuth } from "@/context/AuthContext";

interface PaymentDetails {
  serviceId: string;
  providerId: string;
  amount: number;
  currency: string;
  description: string;
}

interface PaymentProcessorProps {
  paymentDetails: PaymentDetails;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentDetails,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [processor, setProcessor] = useState<"payfast" | "payoneer" | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const detectProcessor = async () => {
      try {
        if (!user) {
          setError("You must be logged in to make a payment");
          setIsLoading(false);
          return;
        }
        
        if (paymentDetails.currency === "ZAR") {
          setProcessor("payfast");
        } else {
          setProcessor("payoneer");
        }
      } catch (err) {
        console.error("Error detecting payment processor:", err);
        setError("Failed to determine the appropriate payment method");
      } finally {
        setIsLoading(false);
      }
    };
    
    detectProcessor();
  }, [user, paymentDetails.currency]);
  
  const handlePayFastCheckout = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const checkoutUrl = await generatePayFastCheckout({
        serviceId: paymentDetails.serviceId,
        providerId: paymentDetails.providerId,
        buyerId: user.id,
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        email: user.email
      });
      
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error("PayFast checkout error:", err);
      toast({
        title: "Payment Error",
        description: err.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handlePayoneerCheckout = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    initPayoneerCheckout(
      paymentDetails.amount,
      paymentDetails.currency,
      paymentDetails.serviceId,
      user.id,
      paymentDetails.providerId,
      paymentDetails.description,
      async (response) => {
        try {
          const result = await processPayment(
            paymentDetails.serviceId,
            user.id,
            paymentDetails.providerId,
            paymentDetails.amount,
            paymentDetails.currency,
            "payoneer",
            { payoneer_transaction_id: response.transaction_id }
          );
          
          if (result.success) {
            toast({
              title: "Payment successful",
              description: "Your payment has been processed successfully",
            });
            
            if (onSuccess) {
              onSuccess(result.transaction_id);
            } else {
              navigate("/payment-success");
            }
          } else {
            throw new Error(result.message || "Payment failed");
          }
        } catch (err: any) {
          console.error("Payment error:", err);
          toast({
            title: "Payment failed",
            description: err.message || "There was an error processing your payment",
            variant: "destructive",
          });
          setError("Payment processing failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>Please wait while we set up your payment...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Payment Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Ban className="h-12 w-12 text-red-500" />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCancel} className="w-full">
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          {processor === "payfast" 
            ? "You'll be redirected to PayFast to complete your payment" 
            : "Complete your payment through Payoneer"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Service:</span>
              <span className="font-medium">{paymentDetails.description}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                {paymentDetails.currency} {paymentDetails.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-medium capitalize">{processor}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          onClick={processor === "payfast" ? handlePayFastCheckout : handlePayoneerCheckout}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {processor === "payfast" ? "Pay with PayFast" : "Pay with Payoneer"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentProcessor;
