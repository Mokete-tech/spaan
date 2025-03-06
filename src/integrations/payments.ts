
import { supabase } from "@/integrations/supabase/client";

/**
 * Detect if user is from South Africa
 * In a production app, you would use a proper geolocation service
 */
export const isUserFromSouthAfrica = async (userCountry?: string): Promise<boolean> => {
  // If user has provided their country in profile
  if (userCountry) {
    return userCountry.toLowerCase() === "south africa" || userCountry.toLowerCase() === "za";
  }

  // Fallback to IP detection
  try {
    // Call a Supabase edge function to detect the country based on IP
    const { data } = await supabase.functions.invoke("detect-country", {});
    return data?.country?.toLowerCase() === "za" || data?.country?.toLowerCase() === "south africa";
  } catch (error) {
    console.error("Error detecting country:", error);
    // Default to false if detection fails
    return false;
  }
};

/**
 * Payment processor types
 */
export type PaymentProcessor = "payfast" | "payoneer";

/**
 * Get the appropriate payment processor based on user's location
 */
export const getPaymentProcessor = async (userCountry?: string): Promise<PaymentProcessor> => {
  const isFromSA = await isUserFromSouthAfrica(userCountry);
  return isFromSA ? "payfast" : "payoneer";
};

/**
 * Generate PayFast checkout URL
 */
export const getPayFastCheckoutUrl = (
  amount: number, 
  serviceId: string, 
  buyerId: string, 
  providerId: string, 
  description: string
): string => {
  // This would typically be a signed URL with proper merchant details
  // For demo purposes, we're creating a simplified version
  const merchantId = "10000100"; // Demo merchant ID
  const merchantKey = "46f0cd694581a"; // Demo merchant key
  
  const params = new URLSearchParams({
    merchant_id: merchantId,
    merchant_key: merchantKey,
    amount: amount.toFixed(2),
    item_name: description,
    return_url: `${window.location.origin}/payment-success?service=${serviceId}`,
    cancel_url: `${window.location.origin}/payment-cancel`,
    notify_url: `${window.location.origin}/api/payfast-webhook`,
    m_payment_id: `${serviceId}_${buyerId}_${providerId}`,
    custom_str1: serviceId,
    custom_str2: buyerId,
    custom_str3: providerId,
  });
  
  return `https://sandbox.payfast.co.za/eng/process?${params.toString()}`;
};

/**
 * Initialize Payoneer checkout
 * In a real implementation, this would use the Payoneer JS SDK
 */
export const initPayoneerCheckout = (
  amount: number,
  currency: string,
  serviceId: string,
  buyerId: string,
  providerId: string,
  description: string,
  onSuccess: (response: any) => void
) => {
  // This is a mock implementation
  // In a real app, you would use the Payoneer SDK
  console.log("Initializing Payoneer checkout with:", {
    amount,
    currency,
    serviceId,
    buyerId,
    providerId,
    description
  });
  
  // Mock the Payoneer checkout process
  // In production, you would inject their script and call their SDK
  setTimeout(() => {
    // Show a mock payment form
    const mockResponse = {
      transaction_id: `pyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: "success"
    };
    
    onSuccess(mockResponse);
  }, 1000);
};

/**
 * Process a payment through our Supabase Edge Function
 */
export const processPayment = async (
  serviceId: string,
  buyerId: string,
  providerId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  paymentDetails: any
) => {
  try {
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: {
        action: "start_escrow",
        serviceId,
        buyerId,
        providerId,
        amount,
        currency,
        paymentMethod,
        paymentDetails
      },
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Payment processing error:", error);
    throw error;
  }
};
