
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const checkUserSubscription = async (): Promise<SubscriptionStatus> => {
  try {
    const { data, error } = await supabase.functions.invoke("check-subscription");
    
    if (error) {
      console.error("Subscription check error:", error);
      return { subscribed: false };
    }
    
    return data;
  } catch (error) {
    console.error("Subscription check failed:", error);
    return { subscribed: false };
  }
};

export const createCheckoutSession = async (planId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { planId, planType: "subscription" },
    });

    if (error) throw error;

    if (data.url) {
      window.open(data.url, '_blank');
      return { success: true };
    }
    
    throw new Error("No checkout URL received");
  } catch (error: any) {
    console.error("Checkout creation error:", error);
    return { success: false, error: error.message };
  }
};

export const openCustomerPortal = async () => {
  try {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    
    if (error) throw error;
    
    if (data.url) {
      window.open(data.url, '_blank');
      return { success: true };
    }
    
    throw new Error("No portal URL received");
  } catch (error: any) {
    console.error("Customer portal error:", error);
    return { success: false, error: error.message };
  }
};
