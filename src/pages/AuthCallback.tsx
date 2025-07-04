
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthCallback } from "@/utils/auth";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setIsProcessing(true);
        
        const result = await handleAuthCallback();
        
        setDebugInfo(result);
        
        if (result.success) {
          setTimeout(() => {
            navigate(result.redirectTo || "/", { replace: true });
          }, 1000);
        } else {
          console.error("Auth callback failed:", result);
          setError(result.error?.message || "Authentication failed. Please try again.");
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 5000);
        }
      } catch (err: any) {
        console.error("Error handling auth callback:", err);
        setError("An unexpected error occurred during authentication.");
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 5000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate]);

  const handleRetryAuth = () => {
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {isProcessing ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing your login...</h2>
              <p className="text-gray-600">Please wait while we complete your authentication.</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Failed</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={handleRetryAuth} className="w-full">
                  Try Again
                </Button>
                <p className="text-sm text-gray-500">
                  Redirecting to login page in a few seconds...
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
              <p className="text-gray-600">Redirecting you now...</p>
            </div>
          )}
          
          {/* Debug info for development */}
          {!import.meta.env.PROD && debugInfo && (
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
