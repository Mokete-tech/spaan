
import React, { useState, useEffect, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { refreshSession } from "@/utils/paymentProcessing";
import { captureError } from "@/utils/errorHandling";
import { AuthContextType, Profile } from "@/types/auth.types";
import { fetchUserProfile, updateRole } from "@/utils/authUtils";

// Create the auth context
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Function to check if profile is complete
  const isProfileComplete = !!profile?.first_name && !!profile?.last_name;

  // Handle auth state changes
  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Fetch user profile if we have a user
          if (data.session.user) {
            const userProfile = await fetchUserProfile(data.session.user.id);
            setProfile(userProfile);
          }
        }
      } catch (error) {
        captureError(error, { context: 'AuthProvider.fetchInitialSession' });
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial load
    fetchInitialSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Fetch user profile on auth state change
      if (newSession?.user) {
        const userProfile = await fetchUserProfile(newSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
      
      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Function to refresh user profile data
  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      captureError(error, { context: 'AuthProvider.refreshProfile' });
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh your profile data',
        variant: 'destructive',
      });
    }
  };
  
  // Function to update the user's role
  const updateUserRole = async (role: "user" | "provider") => {
    try {
      if (!user) {
        throw new Error('You must be logged in to update your role');
      }
      
      const success = await updateRole(user.id, role);
      if (!success) {
        throw new Error('Failed to update your role');
      }
      
      // Refresh the profile to get the updated role
      await refreshProfile();
      
      toast({
        title: 'Role Updated',
        description: `You are now a ${role}`,
      });
    } catch (error: any) {
      captureError(error, { context: 'AuthProvider.updateUserRole' });
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your role',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Function to sign out the user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Show toast notification
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully',
      });
    } catch (error) {
      captureError(error, { context: 'AuthProvider.signOut' });
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };
  
  // Provide auth context value
  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    refreshProfile,
    updateUserRole,
    isProfileComplete,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
