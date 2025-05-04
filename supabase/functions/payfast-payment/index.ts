
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.177.0/crypto/mod.ts"; // Fixed import path

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
    // Get request body
    const { 
      amount, 
      item_name, 
      item_description, 
      email,
      custom_str1, // Service ID
      custom_str2, // Buyer ID
      custom_str3, // Provider ID
    } = await req.json();
    
    // Validate required fields
    if (!amount || !item_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // PayFast credentials - Using provided credentials
    const merchantId = "27299765";
    const merchantKey = "gp7yww9qz0tmd";
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "NzimandeNkosi2021";
    
    // Determine environment (sandbox for development, live for production)
    const isProduction = Deno.env.get("ENVIRONMENT") === "production";
    const payfastUrl = isProduction 
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process";
    
    // Get the host from the request
    const host = req.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = req.headers.get("origin") || `${protocol}://${host}`;
    
    // Build payment data
    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-cancel`,
      notify_url: `${origin}/api/payfast-webhook`,
      amount: amount.toString(),
      item_name: item_name,
    };
    
    // Add optional fields if present
    if (item_description) paymentData.item_description = item_description;
    if (email) paymentData.email_address = email;
    
    // Add custom strings for service, buyer and provider IDs
    if (custom_str1) paymentData.custom_str1 = custom_str1;
    if (custom_str2) paymentData.custom_str2 = custom_str2;
    if (custom_str3) paymentData.custom_str3 = custom_str3;
    
    // Generate PayFast signature
    const pfParamString = Object.keys(paymentData)
      .sort()
      .map(key => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join('&');
      
    // Add passphrase if set
    const signatureString = passphrase 
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase)}` 
      : pfParamString;
      
    // Create MD5 hash of signature string
    const md5 = createHash("md5");
    md5.update(signatureString);
    const signature = md5.toString();
    
    // Add signature to payment data
    paymentData.signature = signature;
    
    // Build redirect URL
    const redirectUrl = `${payfastUrl}?${Object.keys(paymentData)
      .map(key => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join('&')}`;
    
    // Return success with URL
    return new Response(
      JSON.stringify({ 
        success: true,
        url: redirectUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error generating PayFast checkout URL:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to generate PayFast checkout URL"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
