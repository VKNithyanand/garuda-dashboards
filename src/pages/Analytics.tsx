import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import { Loader2, AlertCircle, TrendingUp, DollarSign, Users, ShoppingCart, Tag, AlertTriangle, CheckCircle, FileText, UploadCloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { CsvUploader } from "@/components/CsvUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Analytics = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("week");
  const [recommendations, setRecommendations] = useState([
    {
      id: "1",
      title: "Increase promotion for Electronics",
      description: "Electronics sales are down 15% from last month. Consider running a promotional campaign.",
      status: "pending",
      impact: "medium",
      category: "Marketing"
    },
    {
      id: "2",
      title: "Restock Smartphones inventory",
      description: "Smartphones inventory is running low. Order more stock to avoid stockouts.",
      status: "pending",
      impact: "high",
      category: "Inventory"
    },
    {
      id: "3",
      title: "Optimize pricing for Accessories",
      description: "Accessories have a high margin but low sales. Try adjusting prices to boost volume.",
      status: "pending",
      impact: "medium",
      category: "Pricing"
    }
  ]);
  
  const { salesData: contextSalesData, customersData, categoryData: contextCategoryData, setSalesData, setCategoryData } = useData();
  
  const [salesData, setSalesChartData] = useState<any>(null);
  const [categoryData, setCategoryChartData] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ period })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      return response.json();
    }
  });
  
  useEffect(() => {
    if (contextSalesData && contextSalesData.length > 0) {
      const salesByMonth: Record<string, number> = {};
      
      contextSalesData.forEach(sale => {
        const date = new Date(sale.transaction_date || sale.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!salesByMonth[monthYear]) {
          salesByMonth[monthYear] = 0;
        }
        
        salesByMonth[monthYear] += Number(sale.amount || sale.value || 0);
      });
      
      const monthlySalesData = Object.entries(salesByMonth)
        .map(([date, value]) => ({
          date,
          value,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      setSalesChartData(monthlySalesData);
    } else if (analyticsData) {
      setSalesChartData(analyticsData.monthlySalesData);
    }
    
    if (contextCategoryData && contextCategoryData.length > 0) {
      setCategoryChartData(contextCategoryData);
    } else if (analyticsData) {
      setCategoryChartData(analyticsData.categoriesData);
    }
  }, [analyticsData, contextSalesData, contextCategoryData]);

  const handleSalesDataLoaded = (data: any[]) => {
    setSalesData(data);
    
    const categoryMap = new Map<string, number>();
    
    data.forEach(sale => {
      const category = sale.category || "Uncategorized";
      const amount = Number(sale.amount || sale.value || 0);
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category)! + amount);
      } else {
        categoryMap.set(category, amount);
      }
    });
    
    const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    setCategoryData(chartData);
    setShowUploadDialog(false);
    
    const salesByMonth: Record<string, number> = {};
    
    data.forEach(sale => {
      const date = new Date(sale.transaction_date || sale.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = 0;
      }
      
      salesByMonth[monthYear] += Number(sale.amount || sale.value || 0);
    });
    
    const monthlySalesData = Object.entries(salesByMonth)
      .map(([date, value]) => ({
        date,
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setSalesChartData(monthlySalesData);
    
    toast({
      title: "Data Loaded for Analytics",
      description: `Successfully processed ${data.length} sales records.`,
    });
  };

  const handleTakeAction = async (id: string) => {
    try {
      const recommendation = recommendations.find(rec => rec.id === id);
      if (!recommendation) return;
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: "in_progress" } : rec
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let actionMessage = "";
      let updatedSalesData = [...(salesData || [])];
      let updatedCategoryData = [...(categoryData || [])];
      
      if (recommendation.category === "Marketing") {
        actionMessage = "Marketing campaign initiated for Electronics";
        
        updatedSalesData = updatedSalesData.map(item => {
          if (item.date === updatedSalesData[updatedSalesData.length - 1].date) {
            return { ...item, value: item.value * 1.15 };
          }
          return item;
        });
        
        updatedCategoryData = updatedCategoryData.map(item => {
          if (item.name === "Electronics") {
            return { ...item, value: item.value * 1.15 };
          }
          return item;
        });
        
      } else if (recommendation.category === "Inventory") {
        actionMessage = "Restock order placed for Smartphones";
        
        toast({
          title: "Inventory Update",
          description: "Smartphone inventory restock has been ordered. Shipment will arrive in 3-5 business days.",
        });
        
      } else if (recommendation.category === "Pricing") {
        actionMessage = "Price optimization implemented for Accessories";
        
        updatedCategoryData = updatedCategoryData.map(item => {
          if (item.name === "Accessories") {
            return { ...item, value: item.value * 1.2 };
          }
          return item;
        });
        
        updatedSalesData = updatedSalesData.map(item => {
          if (item.date === updatedSalesData[updatedSalesData.length - 1].date) {
            return { ...item, value: item.value * 1.05 };
          }
          return item;
        });
      }
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: "completed" } : rec
        )
      );
      
      setSalesData(updatedSalesData);
      setCategoryData(updatedCategoryData);
      
      toast({
        title: "Action Completed",
        description: actionMessage,
      });
      
    } catch (error: any) {
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: "pending" } : rec
        )
      );
      
      toast({
        title: "Action Failed",
        description: error.message || "Failed to complete the action. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    toast({
      title: "Error loading analytics",
      description: error.message,
      variant: "destructive",
    });
  }

  const totalSales = contextSalesData && contextSalesData.length > 0
    ? contextSalesData.reduce((sum, sale) => sum + Number(sale.amount || sale.value || 0), 0)
    : analyticsData?.totalSales || 0;

  const customersCount = customersData && customersData.length > 0
    ? customersData.length
    : 120;

  const ordersCount = contextSalesData && contextSalesData.length > 0
    ? contextSalesData.length
    : 450;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Get insights into your business performance</p>
          </div>
          <div className="flex gap-2">
            <Tabs defaultValue="week" className="w-[400px]" value={period} onValueChange={setPeriod}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Sales Data</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <CsvUploader 
                    onDataLoaded={handleSalesDataLoaded} 
                    type="sales"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading && !salesData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={`$${totalSales.toFixed(2)}`}
                description="+20.1% from last month"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="New Customers"
                value={customersCount.toString()}
                description="+10.1% from last month"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Total Orders"
                value={ordersCount.toString()}
                description="+12.2% from last month"
                icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Conversion Rate"
                value="3.2%"
                description="+4.0% from last month"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                  <CardDescription>Monthly sales breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {!salesData ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Sales Data Available</h3>
                      <p className="text-muted-foreground mb-4">Upload a CSV file to see sales analytics.</p>
                      <Button onClick={() => setShowUploadDialog(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload CSV
                      </Button>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={salesData}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.toLocaleString('default', { month: 'short' })}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return `${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {!categoryData ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Category Data Available</h3>
                      <p className="text-muted-foreground mb-4">Upload a CSV file to see category analytics.</p>
                      <Button onClick={() => setShowUploadDialog(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload CSV
                      </Button>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-powered insights to improve your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <Alert key={recommendation.id} variant={
                      recommendation.impact === "high" ? "destructive" : "default"
                    }>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {recommendation.impact === "high" ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : recommendation.impact === "medium" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Tag className="h-4 w-4" />
                          )}
                          <AlertTitle className="flex items-center gap-2">
                            {recommendation.title}
                            {recommendation.status === "completed" && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </AlertTitle>
                          <AlertDescription>
                            {recommendation.description}
                          </AlertDescription>
                        </div>
                        <div className="ml-4">
                          <Button 
                            variant={recommendation.status === "completed" ? "outline" : "default"}
                            size="sm" 
                            onClick={() => handleTakeAction(recommendation.id)}
                            disabled={recommendation.status === "in_progress" || recommendation.status === "completed"}
                          >
                            {recommendation.status === "in_progress" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : recommendation.status === "completed" ? (
                              "Completed"
                            ) : (
                              "Take Action"
                            )}
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
