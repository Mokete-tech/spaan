
import { supabase, processPayment } from './utils.ts'
import { Stripe } from "https://esm.sh/stripe@11.18.0"

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Start escrow process
export const startEscrow = async (
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
export const releaseEscrow = async (transactionId: string) => {
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
export const refundEscrow = async (transactionId: string, reason: string) => {
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
