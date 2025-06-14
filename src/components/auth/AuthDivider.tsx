
import React from "react";

const AuthDivider: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
      </div>
    </div>
  );
};

export default AuthDivider;
