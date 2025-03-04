
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";

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
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
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
    
    setIsLoading(true);
    
    try {
      // Process payment using our edge function
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "process_subscription",
          planId: planId,
          userId: user.id,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod: "card",
          planType: plan.type,
          paymentDetails: {
            // In a real app, you'd use a secure payment processor and not send card details directly
            // This is just for demonstration
            cardName: formData.cardName,
            last4: formData.cardNumber.slice(-4),
          },
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
  
  if (!plan) {
    return null;
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600 mb-6">Complete your subscription to {plan.name}</p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between mb-4">
              <span>Subscription</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="font-bold">Total</span>
              <span className="font-bold">R{plan.price} / month</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Name on card</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={errors.cardName ? "border-red-500" : ""}
                />
                {errors.cardName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.cardName}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={`pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
                    maxLength={19}
                  />
                  <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.cardNumber}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry date</Label>
                  <div className="relative">
                    <Input
                      id="expiry"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`pl-10 ${errors.expiry ? "border-red-500" : ""}`}
                      maxLength={5}
                    />
                    <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.expiry && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.expiry}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    className={errors.cvc ? "border-red-500" : ""}
                    maxLength={4}
                  />
                  {errors.cvc && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.cvc}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Pay R${plan.price}`}
            </Button>
            
            <p className="text-sm text-center text-gray-500 mt-4">
              Your payment information is secure and encrypted
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
