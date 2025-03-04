
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Stripe } from "https://esm.sh/stripe@11.18.0"

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

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use latest API version
  httpClient: Stripe.createFetchHttpClient(),
})

// Mock payment processing - in a real app, integrate with a payment processor like Stripe
const processPayment = async (amount: number, currency: string, paymentMethod: string, paymentDetails: any) => {
  // For Stripe method
  if (paymentMethod === "stripe") {
    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents/smallest currency unit
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          integration: 'spaan-services',
        },
      })
      
      return {
        success: true,
        transaction_id: paymentIntent.id,
        amount,
        currency,
        payment_method: paymentMethod,
        client_secret: paymentIntent.client_secret,
        stripe_data: {
          payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
        }
      }
    } catch (error) {
      console.error("Stripe payment error:", error)
      return {
        success: false,
        error_message: error.message || "Stripe payment processing failed"
      }
    }
  } 
  // For PayPal method (mock for now)
  else if (paymentMethod === "paypal") {
    // In a real app, integrate with PayPal SDK
    // Simulating mock integration for now
    const mockTransactionId = `pp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
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

// Process subscription payment
const processSubscription = async (
  userId: string,
  planId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  planType: string,
  paymentDetails: any
) => {
  try {
    // Process the payment
    const paymentResult = await processPayment(amount, currency, paymentMethod, paymentDetails)
    
    if (!paymentResult.success) {
      throw new Error("Payment processing failed")
    }
    
    // Check if user already has a subscription
    const { data: existingSubscription, error: searchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()
    
    if (searchError && searchError.code !== "PGRST116") { // Code for "no rows returned"
      throw searchError
    }
    
    let subscriptionAction = "created"
    
    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          amount,
          currency,
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString(),
          payment_details: {
            ...existingSubscription.payment_details,
            latest_transaction: paymentResult.transaction_id,
            latest_payment_date: new Date().toISOString(),
            payment_method: paymentMethod,
            ...paymentDetails
          },
        })
        .eq("id", existingSubscription.id)
      
      if (updateError) throw updateError
      subscriptionAction = "updated"
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          plan_type: planType,
          status: "active",
          amount,
          currency,
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          payment_details: {
            latest_transaction: paymentResult.transaction_id,
            latest_payment_date: new Date().toISOString(),
            payment_method: paymentMethod,
            ...paymentDetails
          },
        })
      
      if (insertError) throw insertError
    }
    
    // Update user roles if needed
    if (planType === "provider" && planId !== "free") {
      // Check if user already has provider role
      const { data: existingRole, error: roleSearchError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "provider")
        .single()
      
      if (roleSearchError && roleSearchError.code !== "PGRST116") {
        throw roleSearchError
      }
      
      if (!existingRole) {
        // Add provider role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "provider",
          })
        
        if (roleError) throw roleError
      }
    }
    
    // Return success
    return {
      success: true,
      transaction_id: paymentResult.transaction_id,
      subscription_action: subscriptionAction,
      message: `Subscription ${subscriptionAction} successfully`,
      payment_data: paymentResult, // Include payment processor data like Stripe client_secret
    }
  } catch (error) {
    console.error("Subscription process error:", error)
    return {
      success: false,
      message: error.message || "Failed to process subscription payment",
    }
  }
}

// Start escrow process
const startEscrow = async (
  serviceId: string,
  buyerId: string,
  providerId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  paymentDetails: any
) => {
  try {
    // Process the payment
    const paymentResult = await processPayment(amount, currency, paymentMethod, paymentDetails)
    
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
      payment_data: paymentResult, // Include payment processor data
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

    // If this was a Stripe payment and we have a payment intent, issue a refund via Stripe
    if (transaction.payment_method === "stripe" && 
        transaction.payment_details?.stripe_data?.payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: transaction.payment_details.stripe_data.payment_intent_id,
          reason: 'requested_by_customer',
        });
      } catch (stripeError) {
        console.error("Stripe refund error:", stripeError);
        // Continue with updating the status even if Stripe fails
      }
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

// Get Stripe payment intent client secret
const createPaymentIntent = async (amount: number, currency: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: {
        integration: 'spaan-services',
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      message: error.message || "Failed to create payment intent",
    };
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
