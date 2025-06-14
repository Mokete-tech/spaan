
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cors headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// Check verification status
const checkVerificationStatus = async (userId: string) => {
  try {
    // Get provider information
    const { data: provider, error } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", userId)
      .single()
    
    if (error) {
      if (error.code === "PGRST116") { // "No rows returned" error code
        return {
          success: true,
          status: "not_applied",
          message: "User has not applied for provider status",
        }
      }
      throw error
    }
    
    // Get verification documents
    const { data: documents, error: docsError } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("provider_id", provider.id)
    
    if (docsError) throw docsError
    
    return {
      success: true,
      status: provider.verification_status,
      provider: {
        id: provider.id,
        business_name: provider.business_name,
        verification_status: provider.verification_status,
        created_at: provider.created_at,
      },
      documents: documents.map(doc => ({
        id: doc.id,
        type: doc.document_type,
        status: doc.status,
        created_at: doc.created_at,
      })),
      message: `Provider status: ${provider.verification_status}`,
    }
  } catch (error) {
    console.error("Check verification status error:", error)
    return {
      success: false,
      message: error.message || "Failed to check verification status",
    }
  }
}

// Auto-approve verification
const autoApproveVerification = async (providerId: string) => {
  try {
    console.log(`Auto-approving verification for provider ${providerId}`)
    
    // Update provider status to approved
    const { error: providerError } = await supabase
      .from("providers")
      .update({ 
        verification_status: "approved",
        updated_at: new Date().toISOString()
      })
      .eq("id", providerId)
    
    if (providerError) throw providerError
    
    // Update all documents to approved
    const { error: docsError } = await supabase
      .from("verification_documents")
      .update({ 
        status: "approved",
        admin_notes: "Auto-approved by system",
        updated_at: new Date().toISOString()
      })
      .eq("provider_id", providerId)
    
    if (docsError) throw docsError
    
    console.log(`Successfully auto-approved provider ${providerId}`)
    return true
  } catch (error) {
    console.error("Auto-approve error:", error)
    return false
  }
}

// Submit provider application
const submitApplication = async (
  userId: string,
  businessName: string,
  businessDescription: string,
  documents: { path: string, type: string }[]
) => {
  try {
    // Check if user already has a provider profile
    const { data: existingProvider } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", userId)
      .single()
    
    if (existingProvider) {
      return {
        success: false,
        message: "User already has a provider profile",
      }
    }
    
    // Insert provider record
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .insert({
        user_id: userId,
        business_name: businessName,
        business_description: businessDescription,
        verification_status: "pending",
      })
      .select()
      .single()
    
    if (providerError) throw providerError
    
    // Insert document records
    const documentPromises = documents.map(doc => 
      supabase
        .from("verification_documents")
        .insert({
          provider_id: provider.id,
          document_type: doc.type,
          file_path: doc.path,
          status: "pending",
        })
    )
    
    await Promise.all(documentPromises)
    
    // Add provider role
    await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "provider",
      })
    
    // Auto-approve the verification
    const autoApproved = await autoApproveVerification(provider.id)
    
    const finalStatus = autoApproved ? "approved" : "pending"
    const message = autoApproved 
      ? "Provider application submitted and automatically approved! You can now start offering services."
      : "Provider application submitted successfully and is pending review"
    
    return {
      success: true,
      provider_id: provider.id,
      status: finalStatus,
      auto_approved: autoApproved,
      message: message,
    }
  } catch (error) {
    console.error("Submit application error:", error)
    return {
      success: false,
      message: error.message || "Failed to submit provider application",
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
  
  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization")
    
    if (!authHeader) {
      throw new Error("Missing Authorization header")
    }
    
    // Verify JWT token
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error("Invalid authentication")
    }
    
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
