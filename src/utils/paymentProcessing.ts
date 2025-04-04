import { supabase } from "@/integrations/supabase/client";
import { withRetry, captureError } from "./errorHandling";
import { toast } from "@/hooks/use-toast";

// Payment processor with retry capability
export const processPayment = async (
  paymentDetails: {
    serviceId: string;
    providerId: string;
    amount: number;
    currency: string;
    description: string;
    paymentMethod?: string;
  }
) => {
  return withRetry(
    async () => {
      // Call to our payment processing edge function
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "process_subscription",
          ...paymentDetails
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || "Payment processing failed");
      
      return data;
    },
    3, // Maximum 3 retries
    1000, // Start with 1 second delay (will increase with exponential backoff)
    (attempt, error) => {
      // Update UI on retry
      toast({
        title: `Payment retry ${attempt}/3`,
        description: "We're having trouble processing your payment. Retrying...",
        variant: "default"
      });
    }
  );
};

// Session token refresh logic
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error, { context: 'refreshSession' });
    throw error;
  }
};

// Function to generate PayFast checkout URL
export const generatePayFastCheckout = async (
  paymentDetails: {
    serviceId: string;
    providerId: string;
    buyerId: string;
    amount: number;
    description: string;
    email?: string;
  }
) => {
  try {
    const { data, error } = await supabase.functions.invoke('payfast-payment', {
      body: {
        amount: paymentDetails.amount,
        item_name: paymentDetails.description,
        item_description: `Payment for service: ${paymentDetails.description}`,
        email: paymentDetails.email,
        custom_str1: paymentDetails.serviceId,
        custom_str2: paymentDetails.buyerId,
        custom_str3: paymentDetails.providerId,
      }
    });
    
    if (error) throw error;
    return data.url;
  } catch (error) {
    console.error('Error generating PayFast checkout URL:', error);
    captureError(error, { context: 'payfast_checkout' });
    throw error;
  }
};
