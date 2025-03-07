
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
