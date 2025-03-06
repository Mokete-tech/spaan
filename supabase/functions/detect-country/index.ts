
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock geolocation service
// In production, you would use a real geolocation service like MaxMind or ipdata
const mockDetectCountry = (ip: string): string => {
  // Just for demo purposes, we'll detect ZA for specific IPs
  if (ip.startsWith("196.") || ip.startsWith("41.")) {
    return "ZA";
  }
  return "US"; // Default to US for non-ZA IPs
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the IP from the request
    // In Supabase Edge Functions, you can get the IP from the X-Forwarded-For header
    const ip = req.headers.get("x-forwarded-for") || "0.0.0.0";
    
    // Detect the country (mock)
    const country = mockDetectCountry(ip);
    
    return new Response(
      JSON.stringify({
        ip,
        country,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to detect country",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
