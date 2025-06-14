
import React from "react";
import { ShieldCheck, Check } from "lucide-react";

const AutoApprovalBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <ShieldCheck className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-800 mb-2">Auto-Approval System</h3>
          <p className="text-sm text-blue-700 mb-4">
            At Spaan, we've implemented an auto-approval system to get you started quickly! Your provider application will be automatically approved upon submission, allowing you to start offering services immediately.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Instant approval</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Start earning immediately</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Create service listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Accept job requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoApprovalBanner;
