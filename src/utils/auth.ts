
import { supabase } from "@/integrations/supabase/client";
import { captureError } from "@/utils/errorHandling";

/**
 * Verify the user's email address
 */
export const verifyEmail = async (token: string) => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    captureError(error, { context: 'verifyEmail' });
    return { success: false, error };
  }
};

/**
 * Reset the user's password
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    captureError(error, { context: 'resetPassword' });
    return { success: false, error };
  }
};

/**
 * Update the user's password
 */
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    captureError(error, { context: 'updatePassword' });
    return { success: false, error };
  }
};

/**
 * Create a callback handler for OAuth and magic link redirects
 */
export const handleAuthCallback = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    captureError(error, { context: 'handleAuthCallback' });
    return { success: false, error };
  }
  
  // Check if user needs to complete profile
  if (data.session) {
    try {
      // First check if is_profile_complete column exists
      const { data: columnsData, error: columnsError } = await supabase
        .from("information_schema.columns")
        .select("column_name")
        .eq("table_name", "profiles")
        .eq("table_schema", "public");
      
      if (columnsError) {
        console.warn("Error checking columns:", columnsError);
      }
      
      const columns = columnsData ? columnsData.map(col => col.column_name) : [];
      const hasProfileCompleteColumn = columns.includes("is_profile_complete");
      
      // If the column doesn't exist, we'll assume profile is incomplete and redirect to wizard
      if (!hasProfileCompleteColumn) {
        return { success: true, redirectTo: '/profile-wizard' };
      }
      
      // If the column exists, check its value
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_profile_complete')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError) {
        console.warn("Error checking profile completion status:", profileError);
        return { success: true, redirectTo: '/profile-wizard' };
      }
      
      if (!profileData || !profileData.is_profile_complete) {
        return { success: true, redirectTo: '/profile-wizard' };
      }
    } catch (err) {
      console.error("Error in profile check:", err);
      return { success: true, redirectTo: '/profile-wizard' };
    }
    
    return { success: true, redirectTo: '/' };
  }
  
  return { success: false, redirectTo: '/auth' };
};
