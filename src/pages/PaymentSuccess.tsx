
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  
  // Get the service ID from the URL if it exists
  const serviceId = searchParams.get("service");
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // This would actually verify the payment with PayFast or Payoneer
        // and retrieve the transaction details from our database
        
        if (serviceId) {
          // Get transaction details from our database
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("service_id", serviceId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (error) throw error;
          
          setTransactionDetails(data);
          
          // Show toast for success
          toast({
            title: "Payment confirmed",
            description: "Your payment has been processed successfully",
          });
        } else {
          // No service ID in URL, just show generic success
          setTransactionDetails({
            status: "success",
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Verification issue",
          description: "We couldn't verify your payment details, but your payment may still have been processed",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [serviceId, toast]);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            
            {transactionDetails && (
              <div className="bg-gray-50 rounded-md p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Status:</div>
                  <div className="font-medium text-right">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {transactionDetails.status || "Success"}
                    </span>
                  </div>
                  
                  <div className="text-gray-500">Date:</div>
                  <div className="font-medium text-right">
                    {new Date(transactionDetails.created_at).toLocaleDateString()}
                  </div>
                  
                  {transactionDetails.amount && (
                    <>
                      <div className="text-gray-500">Amount:</div>
                      <div className="font-medium text-right">
                        {transactionDetails.currency || "ZAR"} {parseFloat(transactionDetails.amount).toFixed(2)}
                      </div>
                    </>
                  )}
                  
                  {transactionDetails.id && (
                    <>
                      <div className="text-gray-500">Transaction ID:</div>
                      <div className="font-medium text-right text-xs truncate">
                        {transactionDetails.id}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/profile")}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                View My Orders
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate("/services")}
                className="w-full"
              >
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;
