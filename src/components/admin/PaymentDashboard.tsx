
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { PaymentData } from "@/types/payment.types";

const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof PaymentData>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchPayments();
  }, [sortField, sortDirection]);
  
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          service:service_id(title),
          buyer:buyer_id(email, first_name, last_name),
          provider:provider_id(email, business_name)
        `)
        .order(sortField, { ascending: sortDirection === "asc" });
      
      if (error) throw error;
      setPayments(data as PaymentData[]);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      toast({
        title: "Error", 
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (field: keyof PaymentData) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If new field, set it and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const formatCurrency = (amount: number, currency: string = "ZAR") => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const viewPaymentDetails = (id: string) => {
    navigate(`/payment-details/${id}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Manage and monitor all payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer">
                    Date
                    {sortField === "created_at" && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">
                    Amount
                    {sortField === "amount" && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payment.service?.title || "Unknown Service"}
                      </TableCell>
                      <TableCell>
                        {payment.buyer?.email || "Unknown Buyer"}
                      </TableCell>
                      <TableCell>
                        {payment.provider?.email || "Unknown Provider"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount, payment.currency)}
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewPaymentDetails(payment.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDashboard;
