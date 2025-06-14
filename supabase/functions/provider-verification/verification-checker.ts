
import { createSupabaseClient } from "./utils.ts"
import type { VerificationResponse } from "./types.ts"

export const checkVerificationStatus = async (userId: string): Promise<VerificationResponse> => {
  try {
    const supabase = createSupabaseClient()
    
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
