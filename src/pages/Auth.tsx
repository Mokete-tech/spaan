
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthTabs from "@/components/auth/AuthTabs";
import SocialLogin from "@/components/auth/SocialLogin";
import AuthDebugInfo from "@/components/auth/AuthDebugInfo";
import AuthErrorDisplay from "@/components/auth/AuthErrorDisplay";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && user) {
      console.log("User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Handle URL error parameters and success messages
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const message = searchParams.get("message");
    
    console.log("Auth page URL params:", { error, errorDescription, message });
    
    if (error || errorDescription) {
      const errorMsg = errorDescription || error || "Authentication failed. Please try again.";
      setAuthError(errorMsg);
      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive"
      });
      
      // Clear error params from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("error");
      newParams.delete("error_description");
      setSearchParams(newParams);
    } else if (message) {
      toast({
        title: "Success",
        description: message,
      });
      
      // Clear message param from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("message");
      setSearchParams(newParams);
    }
  }, [searchParams, toast, setSearchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader />
        
        <AuthErrorDisplay 
          error={authError} 
          onDismiss={() => setAuthError(null)} 
        />
        
        <div className="space-y-6">
          <SocialLogin />
          <AuthDivider />
          <AuthTabs />
        </div>
        
        <AuthDebugInfo />
      </div>
    </div>
  );
};

export default Auth;
