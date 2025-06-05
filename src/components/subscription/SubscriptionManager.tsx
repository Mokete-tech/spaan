
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Crown, Star, Zap } from "lucide-react";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error: any) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId, planType: "subscription" },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to start subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "pro",
      name: "Pro Plan",
      price: "R99",
      icon: <Star className="h-6 w-6" />,
      features: ["Advanced features", "Priority support", "Analytics"],
    },
    {
      id: "pro-provider",
      name: "Professional Provider",
      price: "R149",
      icon: <Crown className="h-6 w-6" />,
      features: ["Provider tools", "Featured listings", "Advanced analytics"],
    },
    {
      id: "business",
      name: "Business Plan",
      price: "R299",
      icon: <Zap className="h-6 w-6" />,
      features: ["All features", "Custom branding", "Dedicated support"],
    },
  ];

  if (isCheckingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {subscription.subscribed && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Crown className="h-5 w-5" />
              Active Subscription
            </CardTitle>
            <CardDescription className="text-green-600">
              You're subscribed to {subscription.subscription_tier}
              {subscription.subscription_end && (
                <span> until {new Date(subscription.subscription_end).toLocaleDateString()}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageSubscription} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={subscription.subscription_tier === plan.name ? "border-blue-500 bg-blue-50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.icon}
                {plan.name}
                {subscription.subscription_tier === plan.name && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-2xl font-bold">{plan.price}/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {subscription.subscription_tier !== plan.name && (
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Subscribe
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
