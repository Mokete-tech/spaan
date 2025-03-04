
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cors headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// Mock payment processing - in a real app, integrate with a payment processor like Stripe
const processPayment = async (amount: number, currency: string, paymentMethod: string) => {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Generate a mock transaction ID
  const mockTransactionId = `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  
  return {
    success: true,
    transaction_id: mockTransactionId,
    amount,
    currency,
    payment_method: paymentMethod,
  }
}

// Start escrow process
const startEscrow = async (
  serviceId: string,
  buyerId: string,
  providerId: string,
  amount: number,
  currency: string,
  paymentMethod: string
) => {
  try {
    // Process the payment
    const paymentResult = await processPayment(amount, currency, paymentMethod)
    
    if (!paymentResult.success) {
      throw new Error("Payment processing failed")
    }
    
    // Create transaction record with payment in escrow
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        service_id: serviceId,
        buyer_id: buyerId,
        provider_id: providerId,
        amount,
        currency,
        status: "in_escrow",
        escrow_id: paymentResult.transaction_id,
        payment_method: paymentMethod,
        payment_details: paymentResult,
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Return transaction data
    return {
      success: true,
      transaction_id: transaction.id,
      escrow_id: paymentResult.transaction_id,
      status: "in_escrow",
      message: "Payment is now held in escrow",
    }
  } catch (error) {
    console.error("Escrow process error:", error)
    return {
      success: false,
      message: error.message || "Failed to process escrow payment",
    }
  }
}

// Release funds from escrow to provider
const releaseEscrow = async (transactionId: string) => {
  try {
    // Get transaction information
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (transaction.status !== "in_escrow") {
      throw new Error(`Cannot release funds. Current status: ${transaction.status}`)
    }
    
    // Update transaction status to released
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "released",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
    
    if (updateError) throw updateError
    
    return {
      success: true,
      transaction_id: transactionId,
      status: "released",
      message: "Funds released to provider successfully",
    }
  } catch (error) {
    console.error("Release escrow error:", error)
    return {
      success: false,
      message: error.message || "Failed to release funds from escrow",
    }
  }
}

// Refund payment to buyer
const refundEscrow = async (transactionId: string, reason: string) => {
  try {
    // Get transaction information
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (transaction.status !== "in_escrow") {
      throw new Error(`Cannot refund payment. Current status: ${transaction.status}`)
    }
    
    // Update transaction status to refunded
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
        payment_details: {
          ...transaction.payment_details,
          refund_reason: reason,
          refund_date: new Date().toISOString(),
        },
      })
      .eq("id", transactionId)
    
    if (updateError) throw updateError
    
    return {
      success: true,
      transaction_id: transactionId,
      status: "refunded",
      message: "Payment refunded to buyer successfully",
    }
  } catch (error) {
    console.error("Refund escrow error:", error)
    return {
      success: false,
      message: error.message || "Failed to refund payment",
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
  
  try {
    // Get request data
    const { action, ...data } = await req.json()
    
    // Handle different actions
    let result
    
    switch (action) {
      case "start_escrow":
        const { serviceId, buyerId, providerId, amount, currency, paymentMethod } = data
        result = await startEscrow(serviceId, buyerId, providerId, amount, currency, paymentMethod)
        break
      
      case "release_escrow":
        result = await releaseEscrow(data.transactionId)
        break
      
      case "refund_escrow":
        result = await refundEscrow(data.transactionId, data.reason)
        break
      
      default:
        throw new Error("Invalid action")
    }
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: result.success ? 200 : 400,
    })
  } catch (error) {
    console.error("Error in process-payment function:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Internal server error",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    )
  }
})
