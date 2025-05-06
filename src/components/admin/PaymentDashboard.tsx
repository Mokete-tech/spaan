
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, Ban, CheckCircle } from "lucide-react";

interface PaymentData {
  id: string;
  service_id: string;
  buyer_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  escrow_transaction_id?: string;
  created_at: string;
  service?: {
    title: string;
  };
  buyer?: {
    email: string;
  };
  provider?: {
    email: string;
  };
}

const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed, refunded
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    fetchPayments();
  }, [user, filter]);
  
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("payments")
        .select(`
          *,
          service:service_id(title),
          buyer:buyer_id(email),
          provider:provider_id(email)
        `);
      
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReleaseEscrow = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "release_escrow",
          transactionId,
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({
        title: "Success",
        description: "Funds released to provider",
      });
      
      // Refresh the payment list
      fetchPayments();
    } catch (error) {
      console.error("Error releasing escrow:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to release funds",
        variant: "destructive",
      });
    }
  };
  
  const handleRefund = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          action: "refund_escrow",
          transactionId,
          reason: "Admin initiated refund",
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      toast({
        title: "Success",
        description: "Payment refunded to buyer",
      });
      
      // Refresh the payment list
      fetchPayments();
    } catch (error) {
      console.error("Error refunding payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refund payment",
        variant: "destructive",
      });
    }
  };

  const sendReceiptEmail = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-payment-receipt", {
        body: {
          paymentId,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Receipt email sent successfully",
      });
    } catch (error) {
      console.error("Error sending receipt:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send receipt",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Dashboard</CardTitle>
        <CardDescription>Manage and view payment transactions</CardDescription>
        
        <div className="flex items-center justify-between mt-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_escrow">In Escrow</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => fetchPayments()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.service?.title || "N/A"}</TableCell>
                    <TableCell>
                      {payment.currency} {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
                    </TableCell>
                    <TableCell>{payment.buyer?.email || "N/A"}</TableCell>
                    <TableCell>{payment.provider?.email || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendReceiptEmail(payment.id)}
                        >
                          Receipt
                        </Button>
                        
                        {payment.status === "in_escrow" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleReleaseEscrow(payment.escrow_transaction_id!)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Release
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRefund(payment.escrow_transaction_id!)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Refund
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <a href={`/payment-details/${payment.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDashboard;
