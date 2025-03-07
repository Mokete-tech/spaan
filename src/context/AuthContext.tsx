
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
  role?: "client" | "provider" | null;
  phone_number?: string | null;
  phone?: string | null;
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
      // Query for profile data without checking for columns first
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      // Create profile object with the data we have
      const profileData: Profile = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
        // Use optional chaining to safely access properties that might not exist
        role: data.role ?? null,
        phone_number: data.phone_number ?? data.phone ?? null,
        is_profile_complete: !!data.is_profile_complete,
      };
      
      setProfile(profileData);
      setIsProfileComplete(!!data.is_profile_complete);
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
      // Simplify the update by directly trying to set the role
      const updateData: Record<string, any> = { role };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
        
      if (error) throw error;
      
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
