
import React from "react";
import { Link } from "react-router-dom";

const AuthHeader: React.FC = () => {
  return (
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
  );
};

export default AuthHeader;
