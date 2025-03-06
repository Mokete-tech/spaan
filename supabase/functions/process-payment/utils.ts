
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cors headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// Process payment through different payment processors
export const processPayment = async (amount: number, currency: string, paymentMethod: string, paymentDetails: any) => {
  // For Stripe method
  if (paymentMethod === "stripe") {
    const { processStripePayment } = await import('./stripe.ts');
    return processStripePayment(amount, currency);
  } 
  // For PayPal method
  else if (paymentMethod === "paypal") {
    const mockTransactionId = `pp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    return {
      success: true,
      transaction_id: mockTransactionId,
      amount,
      currency,
      payment_method: paymentMethod,
    }
  }
  // For PayFast method
  else if (paymentMethod === "payfast") {
    const mockTransactionId = `pf_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    return {
      success: true,
      transaction_id: mockTransactionId,
      amount,
      currency,
      payment_method: paymentMethod,
    }
  }
  // Default mock payment (legacy method)
  else {
    const mockTransactionId = `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    return {
      success: true,
      transaction_id: mockTransactionId,
      amount,
      currency,
      payment_method: paymentMethod,
    }
  }
}
