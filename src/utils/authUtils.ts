
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth.types";
import { captureError } from "@/utils/errorHandling";

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Query for profile data
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    
    // Check if the user has a role in the user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (roleError && roleError.code !== 'PGRST116') {
      // Only log real errors, not just "no data found"
      console.error("Error fetching user role:", roleError);
    }

    // Create profile object with the data we have
    const profileData: Profile = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      // Add role from user_roles table if exists
      role: roleData?.role as "user" | "provider" | "admin" | null || null,
      // Check if profile is complete (has first and last name)
      is_profile_complete: !!(data.first_name && data.last_name)
    };
    
    return profileData;
  } catch (error) {
    console.error("Error fetching profile:", error);
    captureError(error, { context: 'fetchProfile', userId });
    return null;
  }
};

export const updateRole = async (userId: string, role: "user" | "provider"): Promise<boolean> => {
  try {
    // First, check if a user_role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    let roleError;
    
    // If role exists, update it; otherwise insert a new one
    if (existingRole) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("id", existingRole.id);
      roleError = error;
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      roleError = error;
    }
    
    if (roleError) throw roleError;
    
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    captureError(error, { context: 'updateUserRole', userId });
    return false;
  }
};
