
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.193.0/hash/mod.ts";

// CORS headers for browser requests
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
      return new Response("Method Not Allowed", { 
        status: 405,
        headers: corsHeaders
      });
    }

    // Parse the request body
    const { amount, item_name, item_description, email, return_url, cancel_url, custom_str1, custom_str2, custom_str3 } = await req.json();

    // PayFast credentials - from environment variables
    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID") || "27299765"; // Sandbox ID as fallback
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") || "gp7yww9qz0tmd"; // Sandbox Key as fallback
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "NzimandeNkosi2021"; // Passphrase
    
    // Determine if we're using sandbox or production
    const isSandbox = Deno.env.get("PAYFAST_SANDBOX") === "true";
    const baseUrl = isSandbox 
      ? "https://sandbox.payfast.co.za/eng/process" 
      : "https://www.payfast.co.za/eng/process";

    // Get the host from the request headers for callback URLs if not provided
    const host = req.headers.get("origin") || "http://localhost:3000";
    
    // Payment data
    const data = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: return_url || `${host}/payment-success`,
      cancel_url: cancel_url || `${host}/payment-cancel`,
      notify_url: `${Deno.env.get("SUPABASE_URL") || "https://jkajgkphojeelebucdzp.supabase.co"}/functions/v1/payfast-notify`,
      amount: amount.toString(),
      item_name: item_name,
      item_description: item_description || "Purchase from Spaan Services",
      email_address: email || "",
    };

    // Add optional custom fields if provided
    if (custom_str1) data.custom_str1 = custom_str1;
    if (custom_str2) data.custom_str2 = custom_str2;
    if (custom_str3) data.custom_str3 = custom_str3;

    // Console log for debugging
    console.log("Payment request data:", data);

    // Sort keys alphabetically for signature
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
    const signature = md5.toString();
    
    // Build the PayFast URL with signature
    const queryString = Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    
    const payfastUrl = `${baseUrl}?${queryString}&signature=${signature}`;

    // Return the URL to the client
    return new Response(
      JSON.stringify({ 
        url: payfastUrl,
        sandbox: isSandbox 
      }), 
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Error processing payment request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process payment request", 
        details: error.message 
      }), 
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
