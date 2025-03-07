
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { refreshSession } from "@/utils/paymentProcessing";
import { captureError } from "@/utils/errorHandling";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  // These fields don't exist in the actual profiles table but are needed by the app
  role?: "client" | "provider" | null;
  is_profile_complete?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserRole: (role: "client" | "provider") => Promise<void>;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        captureError(error, { context: 'getInitialSession' });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsProfileComplete(false);
        }
      }
    );

    const setupTokenRefresh = () => {
      const refreshInterval = 55 * 60 * 1000; // 55 minutes
      
      const intervalId = setInterval(async () => {
        if (session) {
          try {
            const { session: newSession } = await refreshSession();
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        }
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    };
    
    const cleanupTokenRefresh = setupTokenRefresh();

    return () => {
      subscription.unsubscribe();
      cleanupTokenRefresh();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
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
        role: roleData?.role as "client" | "provider" | null || null,
        // Check if profile is complete (has first and last name)
        is_profile_complete: !!(data.first_name && data.last_name)
      };
      
      setProfile(profileData);
      setIsProfileComplete(!!(data.first_name && data.last_name));
    } catch (error) {
      console.error("Error fetching profile:", error);
      captureError(error, { context: 'fetchProfile', userId });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateUserRole = async (role: "client" | "provider") => {
    if (!user) return;
    
    try {
      // First, check if a user_role already exists
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
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
          .insert({ user_id: user.id, role });
        roleError = error;
      }
      
      if (roleError) throw roleError;
      
      await refreshProfile();
      
      toast({
        title: "Role updated successfully",
        description: `You are now registered as a ${role}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      captureError(error, { context: 'updateUserRole', userId: user.id });
      toast({
        title: "Error updating role",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      captureError(error, { context: 'signOut' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signOut,
        refreshProfile,
        updateUserRole,
        isProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
