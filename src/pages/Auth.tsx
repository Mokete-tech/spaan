
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthTabs from "@/components/auth/AuthTabs";
import SocialLogin from "@/components/auth/SocialLogin";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Handle URL error parameters and success messages
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const message = searchParams.get("message");
    
    if (error || errorDescription) {
      toast({
        title: "Authentication Error",
        description: errorDescription || error || "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } else if (message) {
      toast({
        title: "Success",
        description: message,
      });
    }
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader />
        
        <div className="space-y-6">
          <SocialLogin />
          <AuthDivider />
          <AuthTabs />
        </div>
      </div>
    </div>
  );
};

export default Auth;
