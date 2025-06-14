
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription className="mt-2">
        {error}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default AuthErrorDisplay;
