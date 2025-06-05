
import React, { useState, useEffect, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
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

  // Handle auth state changes with improved error handling
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const setupAuth = async () => {
      try {
        // Clear any existing session state first
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Set up auth state listener
        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.email);
          
          if (!mounted) return;

          try {
            // Update session and user state
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Handle profile fetching for authenticated users
            if (newSession?.user && event !== 'SIGNED_OUT') {
              try {
                const userProfile = await fetchUserProfile(newSession.user.id);
                if (mounted) {
                  setProfile(userProfile);
                }
              } catch (profileError) {
                console.error('Error fetching profile:', profileError);
                if (mounted) {
                  setProfile(null);
                }
              }
            } else {
              if (mounted) {
                setProfile(null);
              }
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            captureError(error, { context: 'AuthProvider.onAuthStateChange' });
          }
          
          // Set loading to false after handling auth change
          if (mounted) {
            setIsLoading(false);
          }
        });

        authSubscription = data.subscription;
        
        // Get initial session with better error handling
        try {
          const { data: sessionData, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting initial session:', error);
            captureError(error, { context: 'AuthProvider.getSession' });
          } else if (mounted && sessionData?.session) {
            console.log('Initial session found:', sessionData.session.user.email);
            // The onAuthStateChange will handle setting the session
          }
        } catch (sessionError) {
          console.error('Session retrieval error:', sessionError);
          captureError(sessionError, { context: 'AuthProvider.getSession' });
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        captureError(error, { context: 'AuthProvider.setupAuth' });
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    setupAuth();
    
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
      
      // Clear user state immediately
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
