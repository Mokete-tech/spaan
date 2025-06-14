
import React, { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
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
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-3xl font-bold text-blue-600">
            Spaan
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome to Spaan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect with trusted service providers
          </p>
        </div>
        
        <div className="space-y-6">
          <SocialLogin />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <AuthForm type="signin" onSuccess={() => navigate("/")} />
            </TabsContent>
            
            <TabsContent value="signup">
              <AuthForm type="signup" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
