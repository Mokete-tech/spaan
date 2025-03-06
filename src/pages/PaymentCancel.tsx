
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges were made to your account.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate(-1)}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate("/services")}
                className="w-full"
              >
                Browse Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentCancel;
