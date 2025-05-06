
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: "Missing payment ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *, 
        buyer:buyer_id(id, email), 
        provider:provider_id(id, email),
        service:service_id(id, title, description)
      `)
      .eq("id", paymentId)
      .single();
    
    if (paymentError || !payment) {
      console.error("Error fetching payment:", paymentError);
      throw new Error("Payment not found");
    }
    
    // Format the email content (this would be replaced with actual email sending)
    const emailContent = {
      to: payment.buyer?.email,
      subject: `Payment Confirmation - ${payment.service?.title}`,
      html: `
        <h1>Payment Confirmation</h1>
        <p>Thank you for your payment for ${payment.service?.title}.</p>
        <p>Amount: ${payment.currency} ${payment.amount.toFixed(2)}</p>
        <p>Transaction ID: ${payment.escrow_transaction_id || payment.id}</p>
        <p>Date: ${new Date(payment.created_at).toLocaleString()}</p>
        <p>Your payment is now held in escrow and will be released to the service provider upon successful completion of the service.</p>
        <p>Thank you for using our platform!</p>
      `
    };
    
    console.log("Would send email:", emailContent);
    
    // In production, this would integrate with an email service like SendGrid, Resend, etc.
    // For now we're just logging that we would send it
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Receipt email would be sent in production" 
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Send payment receipt error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send payment receipt" 
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500 
      }
    );
  }
});
