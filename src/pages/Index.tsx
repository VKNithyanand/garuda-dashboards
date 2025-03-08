import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RealTimeMetrics } from "@/components/RealTimeMetrics";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { useSalesData, useCustomers, subscribeToSalesUpdates } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { CsvUploader } from "@/components/CsvUploader";
import { NLPQueriesSection } from "@/components/NLPQueriesSection";
import {
  LineChartIcon,
  BarChartIcon,
  PieChart,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Loader2,
  UploadCloud,
  Database
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SaleWithCustomer {
  id: string;
  name: string;
  email: string;
  amount: string;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const { data: supabaseSalesData = [], isLoading: isSalesLoading, error: salesError } = useSalesData();
  const { data: supabaseCustomers = [], isLoading: isCustomersLoading } = useCustomers();
  const { 
    salesData, 
    customersData, 
    setSalesData, 
    setCustomersData, 
    hasUploadedData,
    setDataSource
  } = useData();
  const [recentSales, setRecentSales] = useState<SaleWithCustomer[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const effectiveSalesData = salesData.length > 0 ? salesData : supabaseSalesData;
  const effectiveCustomers = customersData.length > 0 ? customersData : supabaseCustomers;
  
  const processedSalesData = effectiveSalesData.slice(0, 7).map(sale => ({
    month: new Date(sale.transaction_date).toLocaleString('default', { month: 'short' }),
    revenue: Number(sale.amount),
  }));
  
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
  
  useEffect(() => {
    if (effectiveSalesData.length > 0 && effectiveCustomers.length > 0) {
      const sortedSales = [...effectiveSalesData].sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      ).slice(0, 5);
      
      const mappedSales = sortedSales.map(sale => {
        const customer = effectiveCustomers.find(c => c.id === sale.customer_id) || {
          name: "Anonymous",
          email: "anonymous@example.com"
        };
        
        return {
          id: sale.id || String(Math.random()),
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
  }, [effectiveSalesData, effectiveCustomers]);
  
  if (salesError) {
    toast({
      title: "Error loading data",
      description: salesError.message,
      variant: "destructive",
    });
  }
  
  const totalRevenue = effectiveSalesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
  
  const activeUsers = effectiveCustomers.length;
  
  const salesCount = effectiveSalesData.length;
  
  const growth = 12.4;

  const handleSalesDataLoaded = (data: any[]) => {
    setSalesData(data);
    setShowUploadDialog(false);
    setDataSource('upload');
    
    toast({
      title: "Sales Data Uploaded",
      description: `Successfully loaded ${data.length} sales records.`,
    });
  };

  const handleCustomersDataLoaded = (data: any[]) => {
    setCustomersData(data);
    setDataSource('upload');
    
    toast({
      title: "Customer Data Uploaded",
      description: `Successfully loaded ${data.length} customer records.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Overview</h1>
            <p className="text-muted-foreground">
              Your business analytics and insights
            </p>
          </div>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Database className="mr-2 h-4 w-4" />
                Upload Datasets
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Upload Your Datasets</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Sales Data</h3>
                  <CsvUploader 
                    onDataLoaded={handleSalesDataLoaded} 
                    type="sales"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    CSV should include: product, category, amount, date fields
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Customer Data</h3>
                  <CsvUploader 
                    onDataLoaded={handleCustomersDataLoaded} 
                    type="customers"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    CSV should include: name, email fields
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
            {isSalesLoading && !hasUploadedData ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : effectiveSalesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Sales Data Available</h3>
                <p className="text-muted-foreground mb-4">Upload a CSV file to see sales analytics.</p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Data
                </Button>
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
            {isCustomersLoading && !hasUploadedData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Recent Sales</h3>
                <p className="text-muted-foreground mb-4">Upload data to see recent sales.</p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Data
                </Button>
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

        <div className="grid gap-4 md:grid-cols-2">
          <PredictiveAnalytics />
        </div>

        <NLPQueriesSection />

        <div className="grid gap-4 md:grid-cols-2">
          <RealTimeMetrics />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
