
import { Stripe } from "https://esm.sh/stripe@11.18.0"

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Process Stripe payment
export const processStripePayment = async (amount: number, currency: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    return {
      success: true,
      transaction_id: `stripe_${paymentIntent.id}`,
      client_secret: paymentIntent.client_secret,
      stripe_data: {
        payment_intent_id: paymentIntent.id,
        amount,
        currency,
      },
      amount,
      currency,
      payment_method: "stripe",
    }
  } catch (error) {
    console.error("Stripe payment error:", error)
    return {
      success: false,
      error: error.message || "Failed to process Stripe payment",
    }
  }
}

// Create a payment intent for frontend integration
export const createPaymentIntent = async (amount: number, currency: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    return {
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    }
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return {
      success: false,
      error: error.message || "Failed to create payment intent",
    }
  }
}
