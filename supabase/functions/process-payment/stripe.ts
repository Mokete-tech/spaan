
import { Stripe } from "https://esm.sh/stripe@11.18.0"

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use latest API version
  httpClient: Stripe.createFetchHttpClient(),
})

// Process Stripe payment
export const processStripePayment = async (amount: number, currency: string) => {
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
      payment_method: "stripe",
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

// Create Stripe payment intent
export const createPaymentIntent = async (amount: number, currency: string) => {
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
