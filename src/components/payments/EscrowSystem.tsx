
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'in_escrow' | 'released' | 'refunded';
  service_id: string;
  buyer_id: string;
  provider_id: string;
  created_at: string;
}

interface EscrowSystemProps {
  transactions: Transaction[];
  userRole: 'buyer' | 'provider' | 'admin';
  userId: string;
  onTransactionUpdate: () => void;
}

const EscrowSystem: React.FC<EscrowSystemProps> = ({
  transactions,
  userRole,
  userId,
  onTransactionUpdate,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const releaseEscrow = async (transactionId: string) => {
    try {
      setLoading(transactionId);
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'release_escrow',
          transactionId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Funds Released",
          description: "Payment has been released to the provider",
        });
        onTransactionUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to release funds",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const refundEscrow = async (transactionId: string, reason: string = "Buyer requested refund") => {
    try {
      setLoading(transactionId);
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'refund_escrow',
          transactionId,
          reason
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Refund Processed",
          description: "Payment has been refunded to the buyer",
        });
        onTransactionUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_escrow':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_escrow':
        return <Shield className="h-4 w-4" />;
      case 'released':
        return <CheckCircle className="h-4 w-4" />;
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const canReleaseEscrow = (transaction: Transaction) => {
    return (
      transaction.status === 'in_escrow' &&
      (userRole === 'admin' || 
       (userRole === 'buyer' && transaction.buyer_id === userId))
    );
  };

  const canRefundEscrow = (transaction: Transaction) => {
    return (
      transaction.status === 'in_escrow' &&
      (userRole === 'admin' || 
       (userRole === 'buyer' && transaction.buyer_id === userId))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Escrow System</h2>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Transaction #{transaction.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(transaction.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(transaction.status)}
                    {transaction.status.replace('_', ' ').toUpperCase()}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service ID</p>
                  <p className="font-mono text-sm">
                    {transaction.service_id?.slice(0, 8) || 'N/A'}
                  </p>
                </div>
              </div>

              {transaction.status === 'in_escrow' && (
                <div className="flex gap-2 mt-4">
                  {canReleaseEscrow(transaction) && (
                    <Button
                      onClick={() => releaseEscrow(transaction.id)}
                      disabled={loading === transaction.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading === transaction.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Release to Provider
                    </Button>
                  )}
                  
                  {canRefundEscrow(transaction) && (
                    <Button
                      onClick={() => refundEscrow(transaction.id)}
                      disabled={loading === transaction.id}
                      variant="destructive"
                    >
                      {loading === transaction.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Refund to Buyer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default EscrowSystem;
