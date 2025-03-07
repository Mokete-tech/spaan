
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthCallback } from "@/utils/auth";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleAuthCallback();
        
        if (result.success) {
          navigate(result.redirectTo || "/", { replace: true });
        } else {
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 3000);
        }
      } catch (err) {
        console.error("Error handling auth callback:", err);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <div className="text-sm text-gray-600">Redirecting to login page...</div>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing your login...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
