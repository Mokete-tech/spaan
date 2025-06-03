
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

interface RevenueData {
  totalRevenue: number;
  platformFees: number;
  transactionCount: number;
  averageTransactionValue: number;
  monthlyGrowth: number;
}

const RevenueTracker: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    platformFees: 0,
    transactionCount: 0,
    averageTransactionValue: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      // Fetch payment analytics from the view
      const { data: analytics, error: analyticsError } = await supabase
        .from('payment_analytics')
        .select('*')
        .order('month', { ascending: false })
        .limit(2);

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
      }

      // Fetch recent transactions for more detailed metrics
      const { data: transactions, error: transactionsError } = await supabase
        .from('payments')
        .select('amount, platform_fee, commission, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      }

      if (analytics && analytics.length > 0) {
        const currentMonth = analytics[0];
        const previousMonth = analytics[1];
        
        const totalRevenue = Number(currentMonth.total_amount) || 0;
        const platformFees = Number(currentMonth.total_platform_fees) || 0;
        const transactionCount = Number(currentMonth.transaction_count) || 0;
        
        // Calculate growth
        let monthlyGrowth = 0;
        if (previousMonth) {
          const currentRevenue = Number(currentMonth.total_amount) || 0;
          const previousRevenue = Number(previousMonth.total_amount) || 0;
          if (previousRevenue > 0) {
            monthlyGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          }
        }

        setRevenueData({
          totalRevenue,
          platformFees,
          transactionCount,
          averageTransactionValue: transactionCount > 0 ? totalRevenue / transactionCount : 0,
          monthlyGrowth,
        });
      } else if (transactions) {
        // Fallback to calculating from transactions if analytics view is empty
        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const platformFees = transactions.reduce((sum, t) => 
          sum + (Number(t.platform_fee) || Number(t.commission) || 0), 0
        );
        
        setRevenueData({
          totalRevenue,
          platformFees,
          transactionCount: transactions.length,
          averageTransactionValue: transactions.length > 0 ? totalRevenue / transactions.length : 0,
          monthlyGrowth: 0, // Can't calculate without historical data
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
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
        <h2 className="text-3xl font-bold tracking-tight">Revenue Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Your Platform Commission: 7%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross transaction volume
            </p>
          </CardContent>
        </Card>

        {/* Platform Fees (Your Revenue) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(revenueData.platformFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform commission earned
            </p>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData.transactionCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>

        {/* Average Transaction Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.averageTransactionValue)}
            </div>
            <div className="flex items-center text-xs">
              <span className={`${revenueData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(revenueData.monthlyGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            How your platform makes money from each transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Platform Commission (7%)</span>
              <span className="text-green-600 font-bold">
                {formatCurrency(revenueData.platformFees)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>• 7% commission on completed transactions</p>
              <p>• Payment processing fees covered by users</p>
              <p>• Escrow system ensures secure transactions</p>
              <p>• Additional revenue streams: Featured listings, subscriptions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueTracker;
