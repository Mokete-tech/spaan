
import { supabase } from './utils.ts'
import { processPayment } from './utils.ts'

// Process subscription payment
export const processSubscription = async (
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
