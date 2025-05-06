import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Ban, CheckCircle } from "lucide-react";
import PaymentDetailsBreakdown from "@/components/payment/PaymentDetailsBreakdown";
import { PaymentData } from "@/types/payment.types";

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user || !id) return;
    
    fetchPaymentDetails();
  }, [user, id]);
  
  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          service:service_id(title, description),
          buyer:buyer_id(email, first_name, last_name),
          provider:provider_id(email, business_name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Payment not found");
      
      // Type assertion to handle the database response mapping
      setPayment(data as unknown as PaymentData);
    } catch (err: any) {
      console.error("Error fetching payment details:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReleaseEscrow = async () => {
    if (!payment?.escrow_transaction_id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "release_escrow",
          transactionId: payment.escrow_transaction_id,
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({
        title: "Success",
        description: "Funds released to provider",
      });
      
      // Refresh payment data
      fetchPaymentDetails();
    } catch (err: any) {
      console.error("Error releasing escrow:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to release funds",
        variant: "destructive",
      });
    }
  };
  
  const handleRefund = async () => {
    if (!payment?.escrow_transaction_id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "refund_escrow",
          transactionId: payment.escrow_transaction_id,
          reason: "Admin initiated refund",
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({
        title: "Success", 
        description: "Payment refunded to buyer",
      });
      
      // Refresh payment data
      fetchPaymentDetails();
    } catch (err: any) {
      console.error("Error refunding payment:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to refund payment",
        variant: "destructive",
      });
    }
  };
  
  const sendReceiptEmail = async () => {
    if (!payment?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("send-payment-receipt", {
        body: {
          paymentId: payment.id,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Receipt email sent successfully",
      });
    } catch (err: any) {
      console.error("Error sending receipt:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to send receipt",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-28 pb-16 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      </main>
    );
  }
  
  if (error || !payment) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>{error || "Payment not found"}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }
  
  // Calculate payment values if not already provided
  const grossAmount = payment.amount || 0;
  const payfastFee = payment.payfast_fee || (payment.payment_details?.amount_fee || 0);
  const netAfterFees = payment.net_after_payfast || (payment.payment_details?.amount_net || (grossAmount - payfastFee));
  const commissionRate = 0.07; // 7% platform fee
  const commission = payment.commission || (netAfterFees * commissionRate);
  const providerAmount = payment.provider_amount || (netAfterFees - commission);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main payment info */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      Transaction ID: {payment.escrow_transaction_id || payment.id}
                    </CardDescription>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "refunded"
                        ? "bg-red-100 text-red-800"
                        : payment.status === "in_escrow"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Service Details</h3>
                  <Separator className="my-2" />
                  <p className="font-semibold">{payment.service?.title || "N/A"}</p>
                  <p className="text-gray-600">{payment.service?.description || "No description available"}</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium">Buyer</h3>
                    <Separator className="my-2" />
                    <p>
                      {payment.buyer?.first_name} {payment.buyer?.last_name}
                    </p>
                    <p className="text-gray-600">{payment.buyer?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Provider</h3>
                    <Separator className="my-2" />
                    <p>{payment.provider?.business_name || "N/A"}</p>
                    <p className="text-gray-600">{payment.provider?.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">{payment.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Date:</span>
                      <span>{new Date(payment.created_at).toLocaleString()}</span>
                    </div>
                    {payment.updated_at !== payment.created_at && (
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(payment.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={sendReceiptEmail}>
                  Send Receipt Email
                </Button>
                
                {payment.status === "in_escrow" && (
                  <>
                    <Button variant="default" onClick={handleReleaseEscrow}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Release Funds
                    </Button>
                    
                    <Button variant="destructive" onClick={handleRefund}>
                      <Ban className="h-4 w-4 mr-2" />
                      Refund Payment
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
          
          {/* Side panel with payment breakdown */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              
              <CardContent>
                <PaymentDetailsBreakdown
                  currency={payment.currency || "ZAR"}
                  grossAmount={grossAmount}
                  payfastFee={payfastFee}
                  netAfterFees={netAfterFees}
                  commission={commission}
                  providerAmount={providerAmount}
                />
                
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Transaction IDs</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">Internal ID:</span>
                      <div className="font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                        {payment.id}
                      </div>
                    </div>
                    
                    {payment.escrow_transaction_id && (
                      <div>
                        <span className="text-gray-500">Escrow ID:</span>
                        <div className="font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                          {payment.escrow_transaction_id}
                        </div>
                      </div>
                    )}
                    
                    {payment.payment_details?.pf_payment_id && (
                      <div>
                        <span className="text-gray-500">PayFast ID:</span>
                        <div className="font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                          {payment.payment_details.pf_payment_id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentDetails;
