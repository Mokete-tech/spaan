
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PaymentData {
  payment_id?: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  status: string;
  service_id?: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentData | null>(null);
  
  // Extract payment ID from URL parameters
  const serviceId = searchParams.get("service");
  const paymentId = searchParams.get("pf_payment_id") || searchParams.get("payment_id");
  const m_payment_id = searchParams.get("m_payment_id");
  
  // Poll for payment status if we have a payment ID
  useEffect(() => {
    if (!user) return;
    
    const checkPaymentStatus = async () => {
      try {
        // Find the payment in our database
        if (paymentId) {
          // Use RPC call for custom tables not defined in types
          const { data, error } = await supabase.rpc('get_payment_by_transaction_id', {
            transaction_id_param: paymentId
          });
            
          if (data) {
            setPaymentDetails(data);
            setIsLoading(false);
            return;
          }
        }
        
        // If we have a merchant payment ID, try that instead
        if (m_payment_id) {
          const { data, error } = await supabase.rpc('get_payment_by_payment_id', {
            payment_id_param: m_payment_id
          });
            
          if (data) {
            setPaymentDetails(data);
            setIsLoading(false);
            return;
          }
        }
        
        // If we have a service ID but no payment ID, try to find the latest transaction
        if (serviceId && !paymentId && !m_payment_id) {
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("service_id", serviceId)
            .eq("buyer_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (data) {
            setPaymentDetails({
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              service_id: data.service_id
            });
            setIsLoading(false);
            return;
          }
        }
        
        // If we couldn't find the payment details, show a generic success message
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching payment status:", err);
        setIsLoading(false);
      }
    };
    
    checkPaymentStatus();
  }, [paymentId, m_payment_id, serviceId, user]);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center pb-2">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center pb-6">
            {isLoading ? (
              <p>Verifying your payment...</p>
            ) : (
              <>
                {paymentDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-lg font-medium mb-2">
                      {paymentDetails.currency} {Number(paymentDetails.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Payment Status: <span className="font-medium capitalize">{paymentDetails.status || "Completed"}</span>
                    </p>
                    {paymentDetails.payment_id && (
                      <p className="text-xs text-gray-500">
                        Reference: {paymentDetails.payment_id}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="mt-4 text-gray-700">
                  Thank you for your payment. Your transaction has been processed successfully.
                </p>
                
                <div className="mt-6 flex items-center justify-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <p className="text-gray-600">
                    {serviceId ? "Payment is held in escrow until service completion" : "Your subscription is now active"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            {serviceId ? (
              <Button 
                onClick={() => navigate(`/services/${serviceId}`)}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                View Service Details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => navigate("/profile")}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Go to My Profile
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default PaymentSuccess;
