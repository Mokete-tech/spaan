
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Explicitly define a simpler interface for payment data to avoid TypeScript inference issues
interface PaymentData {
  payment_id?: string;
  transaction_id?: string;
  amount?: number;
  status?: string;
  service_id?: string;
  currency?: string;
  payment_details?: {
    amount_fee?: number;
    amount_net?: number;
    custom_str1?: string;
    [key: string]: any;
  };
}

const PaymentSuccess = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const transactionId = searchParams.get("transaction_id");
        const serviceId = searchParams.get("service");
        const paymentId = searchParams.get("payment_id");
        
        if (!transactionId && !paymentId) {
          setLoading(false);
          return;
        }

        let foundPayment = false;
        
        if (transactionId) {
          // Using select with explicit columns instead of querying RPC functions
          const { data, error } = await supabase
            .from('payments')
            .select('transaction_id, amount, currency, status, payment_details, payment_id')
            .eq('transaction_id', transactionId)
            .maybeSingle(); // Using maybeSingle instead of single to avoid errors
          
          if (error) {
            console.error("Error fetching payment by transaction_id:", error);
          } else if (data) {
            // Manually construct the payment data object
            const payment: PaymentData = {
              transaction_id: data.transaction_id,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              payment_id: data.payment_id,
              payment_details: data.payment_details,
              service_id: data.payment_details?.custom_str1
            };
            
            setPaymentData(payment);
            foundPayment = true;
          }
        }
        
        if (!foundPayment && paymentId) {
          const { data, error } = await supabase
            .from('payments')
            .select('transaction_id, amount, currency, status, payment_details, payment_id')
            .eq('payment_id', paymentId)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching payment by payment_id:", error);
          } else if (data) {
            // Manually construct the payment data object
            const payment: PaymentData = {
              transaction_id: data.transaction_id,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              payment_id: data.payment_id,
              payment_details: data.payment_details,
              service_id: data.payment_details?.custom_str1
            };
            
            setPaymentData(payment);
            foundPayment = true;
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Payment details fetch error:", error);
        setError("An error occurred while fetching payment details");
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [location.search]);
  
  // Calculate commission and provider amounts
  const commissionRate = 0.05; // 5% platform fee
  const grossAmount = paymentData?.amount || 0;
  const payfastFee = paymentData?.payment_details?.amount_fee || 0;
  const netAfterFees = paymentData?.payment_details?.amount_net || (grossAmount - payfastFee);
  const commission = netAfterFees * commissionRate;
  const providerAmount = netAfterFees - commission;
  
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
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500">{error}</p>
              <Button asChild className="mt-4">
                <Link to="/">Return to homepage</Link>
              </Button>
            </div>
          ) : paymentData ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              {/* Payment amount and breakdown */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2 text-center">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Amount:</span>
                    <span>{paymentData.currency} {grossAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>PayFast Fee:</span>
                    <span>- {paymentData.currency} {payfastFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Net After PayFast:</span>
                    <span>{paymentData.currency} {netAfterFees.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Spaan Commission (5%):</span>
                    <span>- {paymentData.currency} {commission.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold border-t pt-2 mt-1">
                    <span>Provider Receives:</span>
                    <span>{paymentData.currency} {providerAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
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
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No payment details found.</p>
              <Button asChild className="mt-4">
                <Link to="/">Return to homepage</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
