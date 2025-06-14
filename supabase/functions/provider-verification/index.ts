
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, verifyAuth } from "./utils.ts"
import { checkVerificationStatus } from "./verification-checker.ts"
import { submitApplication } from "./application-submitter.ts"

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
  
  try {
    // Get authorization header and verify authentication
    const authHeader = req.headers.get("Authorization")
    const { user } = await verifyAuth(authHeader)
    
    // Get request data
    const { action, ...data } = await req.json()
    
    // Handle different actions
    let result
    
    switch (action) {
      case "check_status":
        result = await checkVerificationStatus(user.id)
        break
      
      case "submit_application":
        const { businessName, businessDescription, documents } = data
        result = await submitApplication(user.id, businessName, businessDescription, documents)
        break
      
      default:
        throw new Error("Invalid action")
    }
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: result.success ? 200 : 400,
    })
  } catch (error) {
    console.error("Error in provider-verification function:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Internal server error",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    )
  }
})
