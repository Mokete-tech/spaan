
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TermsAndSubmissionStepProps {
  agreement: boolean;
  setAgreement: (value: boolean) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
}

const TermsAndSubmissionStep: React.FC<TermsAndSubmissionStepProps> = ({
  agreement,
  setAgreement,
  onBack,
  onSubmit,
  uploading,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Terms & Submission</h2>
        <p className="text-gray-600 mb-6">
          Review and accept our terms of service
        </p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
        <div>
          <h3 className="font-medium mb-2">Escrow Payment System</h3>
          <p className="text-sm text-gray-600">
            As a provider, you agree that all payments will be processed through our secure escrow system. Funds will be released to you only after the client confirms satisfactory completion of the service. A platform fee of 5% will be deducted from each transaction.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Service Obligations</h3>
          <p className="text-sm text-gray-600">
            You commit to providing services as described in your listings, maintaining professional standards, and resolving any client issues promptly and courteously.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Verification Process</h3>
          <p className="text-sm text-gray-600">
            You understand that all submitted documents will be reviewed for verification purposes. Your provider account will remain in "pending" status until verification is complete, which typically takes 1-3 business days.
          </p>
        </div>
        
        <label className="flex items-start gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I agree to the terms and conditions, privacy policy, and provider guidelines of the Spaan platform.
          </span>
        </label>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          className="bg-spaan-primary hover:bg-spaan-primary/90"
          disabled={!agreement || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TermsAndSubmissionStep;
