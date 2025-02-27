
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RealTimeMetrics } from "@/components/RealTimeMetrics";
import { NLPQueryInput } from "@/components/NLPQueryInput";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { useSalesData, useCustomers, subscribeToSalesUpdates } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Avatar } from "@/components/ui/avatar";

const Index = () => {
  const { toast } = useToast();
  const { data: salesData = [], isLoading: isSalesLoading, error: salesError } = useSalesData();
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomers();
  const [recentSales, setRecentSales] = useState<any[]>([]);
  
  // Process sales data for the chart
  const processedSalesData = salesData.slice(0, 7).map(sale => ({
    month: new Date(sale.transaction_date).toLocaleString('default', { month: 'short' }),
    revenue: Number(sale.amount),
  }));
  
  // Subscribe to real-time sales updates
  useEffect(() => {
    const unsubscribe = subscribeToSalesUpdates((payload) => {
      toast({
        title: "New Sale Recorded",
        description: `A new sale of ${Number(payload.new.amount).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })} was just recorded.`,
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [toast]);
  
  // Generate recent sales data
  useEffect(() => {
    if (salesData.length > 0 && customers.length > 0) {
      // Get the 5 most recent sales
      const sortedSales = [...salesData].sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      ).slice(0, 5);
      
      // Map sales to include customer information
      const mappedSales = sortedSales.map(sale => {
        const customer = customers.find(c => c.id === sale.customer_id) || {
          name: "Anonymous",
          email: "anonymous@example.com"
        };
        
        return {
          id: sale.id,
          name: customer.name,
          email: customer.email,
          amount: Number(sale.amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
          date: new Date(sale.transaction_date).toLocaleDateString(),
        };
      });
      
      setRecentSales(mappedSales);
    }
  }, [salesData, customers]);
  
  if (salesError) {
    toast({
      title: "Error loading data",
      description: salesError.message,
      variant: "destructive",
    });
  }
  
  // Calculate total revenue
  const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
  
  // Calculate active users (just using customers count for demo)
  const activeUsers = customers.length;
  
  // Calculate sales count
  const salesCount = salesData.length;
  
  // Calculate growth (using a random value for demo)
  const growth = 12.4;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Your business analytics and insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString('en-US', {maximumFractionDigits: 2})}`}
            trend={{ value: 20.1, label: "from last month" }}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Users"
            value={activeUsers.toString()}
            trend={{ value: 10.1, label: "from last month" }}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Sales"
            value={salesCount.toString()}
            trend={{ value: -5.1, label: "from last month" }}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatsCard
            title="Growth"
            value={`+${growth}%`}
            trend={{ value: 4.1, label: "from last month" }}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="dashboard-card md:col-span-4">
            <h3 className="font-medium">Revenue Over Time</h3>
            {isSalesLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="dashboard-card md:col-span-3">
            <h3 className="font-medium">Recent Sales</h3>
            {isCustomersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="mt-4">
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-dashboard-muted"
                    >
                      <Avatar className="h-9 w-9">
                        <span className="text-xs">
                          {sale.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{sale.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{sale.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <PredictiveAnalytics />
          <NLPQueryInput />
        </div>

        {/* Real-Time Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <RealTimeMetrics />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
