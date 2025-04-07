
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PaymentSuccessDisplay } from "@/components/payment";

// Define a simpler interface for payment data that matches our expected structure
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
          // Query by transaction_id
          const { data, error: transactionError } = await supabase
            .from('payments')
            .select('*')
            .eq('escrow_transaction_id', transactionId)
            .limit(1);
          
          if (transactionError) {
            console.error("Error fetching payment by transaction_id:", transactionError);
          } else if (data && data.length > 0) {
            const paymentRow = data[0];
            console.log("Payment data:", paymentRow);
            
            // Create a normalized payment object from the database row
            const payment: PaymentData = {
              transaction_id: paymentRow.escrow_transaction_id,
              amount: paymentRow.amount,
              currency: paymentRow.currency,
              status: paymentRow.status,
              payment_id: paymentRow.id,
              payment_details: typeof paymentRow.payment_details === 'object' 
                ? paymentRow.payment_details 
                : { amount_fee: paymentRow.payfast_fee, amount_net: paymentRow.net_after_payfast },
              service_id: paymentRow.service_id
            };
            
            setPaymentData(payment);
            foundPayment = true;
          }
        }
        
        if (!foundPayment && paymentId) {
          // Query by payment_id as fallback
          const { data, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .limit(1);
          
          if (paymentError) {
            console.error("Error fetching payment by payment_id:", paymentError);
          } else if (data && data.length > 0) {
            const paymentRow = data[0];
            console.log("Payment data from payment_id:", paymentRow);
            
            // Create a normalized payment object from the database row
            const payment: PaymentData = {
              transaction_id: paymentRow.escrow_transaction_id,
              amount: paymentRow.amount,
              currency: paymentRow.currency,
              status: paymentRow.status,
              payment_id: paymentRow.id,
              payment_details: typeof paymentRow.payment_details === 'object' 
                ? paymentRow.payment_details 
                : { amount_fee: paymentRow.payfast_fee, amount_net: paymentRow.net_after_payfast },
              service_id: paymentRow.service_id
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
            <PaymentSuccessDisplay paymentData={paymentData} />
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
