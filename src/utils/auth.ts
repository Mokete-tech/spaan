
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
      redirectTo: `${window.location.origin}/auth/callback`,
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
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      captureError(error, { context: 'handleAuthCallback' });
      return { success: false, error };
    }
    
    // Check if user needs to complete profile
    if (data.session) {
      try {
        // Check if profile exists and is complete
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn("Error checking profile:", profileError);
          return { success: true, redirectTo: '/profile-wizard' };
        }
        
        // If profile is not complete (first name and last name are required)
        if (!profileData || !profileData.first_name || !profileData.last_name) {
          return { success: true, redirectTo: '/profile-wizard' };
        }
        
        return { success: true, redirectTo: '/' };
      } catch (err) {
        console.error("Error in profile check:", err);
        return { success: true, redirectTo: '/profile-wizard' };
      }
    }
    
    return { success: false, redirectTo: '/auth' };
  } catch (error) {
    captureError(error, { context: 'handleAuthCallback' });
    return { success: false, error };
  }
};
