
import { createSupabaseClient } from "./utils.ts"
import { autoApproveVerification } from "./auto-approver.ts"
import type { ApplicationResponse, UploadedDocument } from "./types.ts"

export const submitApplication = async (
  userId: string,
  businessName: string,
  businessDescription: string,
  documents: UploadedDocument[]
): Promise<ApplicationResponse> => {
  try {
    const supabase = createSupabaseClient()
    
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
