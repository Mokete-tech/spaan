import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentData {
  payment_id?: string;
  transaction_id?: string;
  amount?: number;
  status?: string;
  service_id?: string;
  currency?: string;
}

const PaymentSuccess = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Get payment ID from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const transactionId = searchParams.get("transaction_id");
        const serviceId = searchParams.get("service");
        const paymentId = searchParams.get("payment_id");
        
        // Try to get payment details using transaction ID first
        if (transactionId) {
          // Use direct query instead of RPC functions to fix the type error
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();
          
          if (error) {
            console.error("Error fetching payment by transaction_id:", error);
          } else if (data) {
            setPaymentData(data as PaymentData);
            setLoading(false);
            return;
          }
        }
        
        // Otherwise try to get by payment ID
        if (paymentId) {
          // Use direct query instead of RPC functions to fix the type error
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_id', paymentId)
            .single();
          
          if (error) {
            console.error("Error fetching payment by payment_id:", error);
          } else if (data) {
            setPaymentData(data as PaymentData);
            setLoading(false);
            return;
          }
        }
        
        // If still no payment found, we're done loading with no data
        setLoading(false);
      } catch (error) {
        console.error("Payment details fetch error:", error);
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [location.search]);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your payment</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">Loading payment details...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              {paymentData?.amount && paymentData?.currency && (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-gray-500 text-sm mb-1">Payment Amount</p>
                  <p className="text-xl font-bold">
                    {paymentData.currency} {paymentData.amount.toFixed(2)}
                  </p>
                </div>
              )}
              
              {paymentData?.transaction_id && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Transaction Reference</p>
                  <p className="font-medium break-all">{paymentData.transaction_id}</p>
                </div>
              )}
              
              {paymentData?.status && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <p className="font-medium">
                    <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {paymentData.status}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-4 mt-8">
            <Button asChild className="w-full">
              <Link to="/">Return to homepage</Link>
            </Button>
            
            {paymentData.service_id && (
              <Button asChild variant="outline">
                <Link to={`/services/${paymentData.service_id}`}>View Service Details</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
