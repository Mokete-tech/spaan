
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.177.0/crypto/mod.ts"; // Fixed import path
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Parse PayFast ITN data
    const rawBody = await req.text();
    const data = Object.fromEntries(new URLSearchParams(rawBody));
    
    console.log("Received ITN payload:", data);

    // Verify the request is from PayFast (IP verification would be done in production)
    // In production, you should verify that the request comes from PayFast's IP addresses
    
    // Verify signature if present
    if (data.signature) {
      const receivedSignature = data.signature;
      delete data.signature;
      
      const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "NzimandeNkosi2021";
      
      // Sort keys alphabetically
      const sortedKeys = Object.keys(data).sort();
      let signatureString = "";
      for (const key of sortedKeys) {
        signatureString += `${key}=${encodeURIComponent(data[key])}&`;
      }
      
      // Add passphrase if set
      if (passphrase) {
        signatureString = signatureString.slice(0, -1); // Remove trailing &
        signatureString += `&passphrase=${encodeURIComponent(passphrase)}`;
      } else {
        signatureString = signatureString.slice(0, -1); // Remove trailing &
      }

      // Generate MD5 signature
      const md5 = createHash("md5");
      md5.update(signatureString);
      const calculatedSignature = md5.toString();

      if (calculatedSignature !== receivedSignature) {
        console.error("Signature validation failed");
        return new Response("Invalid Signature", { status: 400 });
      }
      
      console.log("Signature validation successful");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://jkajgkphojeelebucdzp.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseKey) {
      console.error("Missing Supabase service role key");
      return new Response("Server Configuration Error", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract data from payload
    const paymentData = {
      transaction_id: data.pf_payment_id,
      m_payment_id: data.m_payment_id || null,
      payment_status: data.payment_status,
      amount_gross: parseFloat(data.amount_gross || "0"),
      amount_fee: parseFloat(data.amount_fee || "0"),
      amount_net: parseFloat(data.amount_net || "0"),
      payment_method: "payfast",
      item_name: data.item_name,
      item_description: data.item_description,
      email_address: data.email_address,
      merchant_id: data.merchant_id,
      custom_str1: data.custom_str1 || null, // Service ID
      custom_str2: data.custom_str2 || null, // Buyer ID
      custom_str3: data.custom_str3 || null, // Provider ID
      created_at: new Date().toISOString(),
      raw_data: data
    };
    
    console.log("Processed payment data:", paymentData);

    // Calculate platform commission (7%)
    const commissionRate = 0.07;
    const commission = paymentData.amount_net * commissionRate;
    const providerAmount = paymentData.amount_net - commission;

    // First, add the transaction to the payments table
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        payment_id: paymentData.m_payment_id,
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount_gross,
        status: paymentData.payment_status,
        payment_method: "payfast",
        payment_details: paymentData,
        currency: "ZAR",  // PayFast uses ZAR
        created_at: paymentData.created_at,
        payfast_fee: paymentData.amount_fee,
        net_after_payfast: paymentData.amount_net,
        commission: commission,
        provider_amount: providerAmount
      });

    if (paymentError) {
      console.error("Error saving payment:", paymentError);
    } else {
      console.log("Payment record saved successfully");
    }

    // If we have service and user IDs, update the transactions table for escrow
    if (paymentData.custom_str1 && paymentData.custom_str2 && paymentData.custom_str3 && 
        paymentData.payment_status === "COMPLETE") {
      
      const serviceId = paymentData.custom_str1;
      const buyerId = paymentData.custom_str2;
      const providerId = paymentData.custom_str3;
      
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          service_id: serviceId,
          buyer_id: buyerId,
          provider_id: providerId,
          amount: paymentData.amount_gross,
          currency: "ZAR",
          status: "pending",
          payment_method: "payfast",
          payment_details: {
            pf_payment_id: paymentData.transaction_id,
            m_payment_id: paymentData.m_payment_id
          }
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
      } else {
        console.log("Transaction record created successfully");
      }
    }

    // Return success to PayFast
    return new Response("OK", { 
      headers: { ...corsHeaders },
      status: 200 
    });
    
  } catch (error) {
    console.error("Error processing ITN:", error);
    return new Response("Internal Server Error", { 
      headers: { ...corsHeaders },
      status: 500 
    });
  }
});
