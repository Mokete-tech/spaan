
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PaymentProcessor from "@/components/payments/PaymentProcessor";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PaymentMethodTabs from "@/components/checkout/PaymentMethodTabs";

const pricingPlans = {
  "pro": { name: "Pro Plan", price: 99, currency: "ZAR", type: "subscriber" },
  "business": { name: "Business Plan", price: 299, currency: "ZAR", type: "subscriber" },
  "pro-provider": { name: "Professional Provider", price: 149, currency: "ZAR", type: "provider" },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, stripe, paypal
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const plan = planId ? pricingPlans[planId as keyof typeof pricingPlans] : null;
  
  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=pricing");
      return;
    }
    
    if (!plan) {
      toast({
        title: "Invalid plan",
        description: "Please select a valid subscription plan",
        variant: "destructive",
      });
      navigate("/pricing");
    }
  }, [user, plan, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Basic formatting for card number (spaces after every 4 digits)
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setFormData({
        ...formData,
        [name]: formatted.substring(0, 19), // limit to 16 digits + 3 spaces
      });
      return;
    }
    
    // Basic formatting for expiry (automatically add slash)
    if (name === "expiry") {
      let formatted = value.replace(/\//g, "");
      if (formatted.length > 2) {
        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`;
      }
      setFormData({
        ...formData,
        [name]: formatted.substring(0, 5), // limit to MM/YY
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (paymentMethod === "card") {
      if (!formData.cardName.trim()) {
        newErrors.cardName = "Name on card is required";
      }
      
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }
      
      if (!formData.expiry.trim()) {
        newErrors.expiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
        newErrors.expiry = "Expiry date must be in MM/YY format";
      }
      
      if (!formData.cvc.trim()) {
        newErrors.cvc = "CVC is required";
      } else if (!/^\d{3,4}$/.test(formData.cvc)) {
        newErrors.cvc = "CVC must be 3 or 4 digits";
      }
    } else if (paymentMethod === "paypal") {
      if (!paypalEmail.trim()) {
        newErrors.paypalEmail = "PayPal email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(paypalEmail)) {
        newErrors.paypalEmail = "Please enter a valid email";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user || !plan) {
      return;
    }
    
    // For card/paypal methods, show the payment processor
    if (paymentMethod === "card" || paymentMethod === "paypal") {
      setShowPaymentProcessor(true);
      return;
    }

    setIsLoading(true);
    
    try {
      let paymentDetails = {};
      
      // Format payment details based on method
      if (paymentMethod === "card") {
        paymentDetails = {
          cardName: formData.cardName,
          last4: formData.cardNumber.slice(-4),
        };
      } else if (paymentMethod === "paypal") {
        paymentDetails = {
          paypalEmail: paypalEmail
        };
      } else if (paymentMethod === "stripe") {
        // For Stripe, we would handle this through their Elements library on the frontend
        // This is just a placeholder for the demo
        paymentDetails = {
          stripePaymentMethod: "pm_card_visa" // Use a Stripe test card token
        };
      }
      
      // Process payment using our edge function
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "process_subscription",
          planId: planId,
          userId: user.id,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod: paymentMethod,
          planType: plan.type,
          paymentDetails: paymentDetails,
        },
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Payment successful!",
          description: `You've subscribed to the ${plan.name} plan`,
        });
        
        // Redirect to profile or dashboard
        navigate("/profile");
      } else {
        throw new Error(data.message || "Payment processing failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentSuccess = (transactionId: string) => {
    toast({
      title: "Payment successful!",
      description: `You've subscribed to the ${plan?.name} plan. Transaction ID: ${transactionId.substring(0, 8)}...`,
    });
    
    navigate("/profile");
  };
  
  const handlePaymentCancel = () => {
    setShowPaymentProcessor(false);
  };
  
  if (!plan) {
    return null;
  }
  
  // If payment processor is showing, render it
  if (showPaymentProcessor && plan) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
          <PaymentProcessor 
            paymentDetails={{
              serviceId: planId || "plan",
              providerId: "system",
              amount: plan.price,
              currency: plan.currency,
              description: `Subscription to ${plan.name}`
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600 mb-6">Complete your subscription to {plan.name}</p>
          
          <CheckoutSummary plan={plan} />
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            
            <PaymentMethodTabs
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              formData={formData}
              paypalEmail={paypalEmail}
              errors={errors}
              handleInputChange={handleInputChange}
              setPaypalEmail={setPaypalEmail}
            />
            
            <Button 
              onClick={handleSubmit} 
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Pay R${plan.price}`}
            </Button>
            
            <p className="text-sm text-center text-gray-500 mt-4">
              Your payment information is secure and encrypted
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
