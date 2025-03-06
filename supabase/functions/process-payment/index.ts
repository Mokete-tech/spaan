
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils.ts'
import { processSubscription } from './subscription.ts'
import { startEscrow, releaseEscrow, refundEscrow } from './escrow.ts'
import { createPaymentIntent } from './stripe.ts'

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
      case "process_subscription":
        const { userId, planId, amount, currency, paymentMethod, planType, paymentDetails } = data
        result = await processSubscription(userId, planId, amount, currency, paymentMethod, planType, paymentDetails)
        break
        
      case "start_escrow":
        const { serviceId, buyerId, providerId } = data
        result = await startEscrow(
          serviceId, 
          buyerId, 
          providerId, 
          data.amount, 
          data.currency, 
          data.paymentMethod, 
          data.paymentDetails || {}
        )
        break
      
      case "release_escrow":
        result = await releaseEscrow(data.transactionId)
        break
      
      case "refund_escrow":
        result = await refundEscrow(data.transactionId, data.reason)
        break
      
      case "create_payment_intent":
        result = await createPaymentIntent(data.amount, data.currency)
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
