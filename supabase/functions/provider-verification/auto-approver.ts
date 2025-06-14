
import { createSupabaseClient } from "./utils.ts"

export const autoApproveVerification = async (providerId: string): Promise<boolean> => {
  try {
    console.log(`Auto-approving verification for provider ${providerId}`)
    
    const supabase = createSupabaseClient()
    
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
