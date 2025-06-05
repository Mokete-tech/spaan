
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

interface PaymentMetrics {
  totalRevenue: number;
  platformCommission: number;
  transactionCount: number;
  avgTransactionValue: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    commission: number;
    transactions: number;
  }>;
}

const PaymentAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalRevenue: 0,
    platformCommission: 0,
    transactionCount: 0,
    avgTransactionValue: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMetrics();
  }, []);

  const fetchPaymentMetrics = async () => {
    try {
      // Fetch payment analytics
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, commission, created_at, status')
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const platformCommission = payments?.reduce((sum, p) => sum + Number(p.commission), 0) || 0;
      const transactionCount = payments?.length || 0;
      const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      // Group by month for chart data
      const monthlyData = payments?.reduce((acc: any[], payment) => {
        const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += Number(payment.amount);
          existing.commission += Number(payment.commission);
          existing.transactions += 1;
        } else {
          acc.push({
            month,
            revenue: Number(payment.amount),
            commission: Number(payment.commission),
            transactions: 1,
          });
        }
        return acc;
      }, []) || [];

      setMetrics({
        totalRevenue,
        platformCommission,
        transactionCount,
        avgTransactionValue,
        monthlyData: monthlyData.slice(-6), // Last 6 months
      });
    } catch (error) {
      console.error('Error fetching payment metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payment Analytics</h2>
        <Badge variant="outline" className="text-sm">
          7% Platform Commission
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transaction volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.platformCommission)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform earnings (7%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.transactionCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.avgTransactionValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Monthly revenue and commission overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="commission" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Your Commission"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAnalytics;
