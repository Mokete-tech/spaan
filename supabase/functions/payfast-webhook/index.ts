
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("PayFast webhook received");
    
    // Get request body as form data
    const formData = await req.formData();
    
    // Convert form data to object
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log("Received PayFast ITN payload:", data);

    // Verify the request is from PayFast (IP verification would be done in production)
    // In production, you should verify that the request comes from PayFast's IP addresses
    
    // Verify signature if present
    if (data.signature) {
      const receivedSignature = data.signature;
      delete data.signature;
      
      // Get the merchant key and passphrase
      const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") || "gp7yww9qz0tmd";
      const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "NzimandeNkosi2021";
      
      // Generate signature string
      const signatureString = Object.keys(data)
        .filter(key => data[key] !== '')
        .sort()
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      
      // Add passphrase if set
      const finalSignatureString = passphrase 
        ? `${signatureString}&passphrase=${encodeURIComponent(passphrase)}` 
        : signatureString;
      
      // Create MD5 hash of signature string
      const md5 = createHash("md5");
      md5.update(finalSignatureString);
      const calculatedSignature = md5.toString();
      
      // Compare signatures
      if (receivedSignature !== calculatedSignature) {
        console.error("Signature validation failed");
        console.error("Received:", receivedSignature);
        console.error("Calculated:", calculatedSignature);
        return new Response("Invalid Signature", { status: 400 });
      }
      
      console.log("Signature validation successful");
    }
    
    // Extract payment data
    const paymentData = {
      m_payment_id: data.m_payment_id,
      pf_payment_id: data.pf_payment_id,
      payment_status: data.payment_status,
      item_name: data.item_name,
      amount_gross: parseFloat(data.amount_gross),
      amount_fee: parseFloat(data.amount_fee),
      amount_net: parseFloat(data.amount_net),
      custom_str1: data.custom_str1, // Service ID
      custom_str2: data.custom_str2, // Buyer ID
      custom_str3: data.custom_str3, // Provider ID
      created_at: new Date().toISOString(),
    };
    
    console.log("Processed payment data:", paymentData);
    
    // Only process if payment is successful
    if (data.payment_status !== "COMPLETE") {
      console.log("Payment status not COMPLETE, status:", data.payment_status);
      return new Response(
        JSON.stringify({ success: true, message: "ITN received for non-completed payment" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate platform commission (7%)
    const commissionRate = 0.07;
    const commission = paymentData.amount_net * commissionRate;
    const providerAmount = paymentData.amount_net - commission;

    // First, add the transaction to the payments table
    const { data: paymentRecord, error: paymentError } = await supabase
      .from("payments")
      .insert({
        service_id: paymentData.custom_str1,
        buyer_id: paymentData.custom_str2,
        provider_id: paymentData.custom_str3,
        amount: paymentData.amount_gross,
        status: "completed",
        payment_method: "payfast",
        payment_details: paymentData,
        currency: "ZAR",  // PayFast uses ZAR
        created_at: paymentData.created_at,
        payfast_fee: paymentData.amount_fee,
        net_after_payfast: paymentData.amount_net,
        commission: commission,
        provider_amount: providerAmount,
        escrow_transaction_id: `pf_${paymentData.pf_payment_id}`
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error("Error saving payment:", paymentError);
      throw new Error("Failed to save payment record");
    } else {
      console.log("Payment record saved successfully with ID:", paymentRecord?.id);
    }

    // If we have service and user IDs, update the transactions table for escrow
    if (paymentData.custom_str1 && paymentData.custom_str2 && paymentData.custom_str3) {
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          service_id: paymentData.custom_str1,
          buyer_id: paymentData.custom_str2,
          provider_id: paymentData.custom_str3,
          amount: paymentData.amount_gross,
          currency: "ZAR",
          status: "in_escrow",
          payment_method: "payfast",
          payment_details: {
            pf_payment_id: paymentData.pf_payment_id,
            amount_gross: paymentData.amount_gross,
            amount_fee: paymentData.amount_fee,
            amount_net: paymentData.amount_net,
            payment_id: paymentRecord?.id
          },
          escrow_id: `pf_${paymentData.pf_payment_id}`
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
      } else {
        console.log("Transaction record created successfully");
      }
    }
    
    // Send email notification (would be implemented in production)
    // Instead of directly implementing here, we would typically call another function
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Payment processed successfully" }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error("PayFast webhook error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to process PayFast notification"
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500
      }
    );
  }
});
