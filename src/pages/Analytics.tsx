
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatsCard } from "@/components/StatsCard";
import { Loader2, AlertCircle, TrendingUp, DollarSign, Users, ShoppingCart, Tag, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  
  // Track chart data changes for visualization
  const [salesData, setSalesData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);

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
  
  // Set initial data when analytics loads
  useEffect(() => {
    if (analyticsData) {
      setSalesData(analyticsData.monthlySalesData);
      setCategoryData(analyticsData.categoriesData);
    }
  }, [analyticsData]);

  const handleTakeAction = async (id: string) => {
    try {
      const recommendation = recommendations.find(rec => rec.id === id);
      if (!recommendation) return;
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: "in_progress" } : rec
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let actionMessage = "";
      let updatedSalesData = [...(salesData || [])];
      let updatedCategoryData = [...(categoryData || [])];
      
      if (recommendation.category === "Marketing") {
        // Simulate marketing campaign effect - increase sales of electronics
        actionMessage = "Marketing campaign initiated for Electronics";
        
        // Update sales data to reflect the marketing campaign
        updatedSalesData = updatedSalesData.map(item => {
          if (item.date === updatedSalesData[updatedSalesData.length - 1].date) {
            return { ...item, value: item.value * 1.15 }; // 15% increase in latest month
          }
          return item;
        });
        
        // Update category data to reflect the marketing campaign
        updatedCategoryData = updatedCategoryData.map(item => {
          if (item.name === "Electronics") {
            return { ...item, value: item.value * 1.15 }; // 15% increase for Electronics
          }
          return item;
        });
        
      } else if (recommendation.category === "Inventory") {
        // Simulate inventory restock effect
        actionMessage = "Restock order placed for Smartphones";
        
        // Inventory restocking doesn't directly affect sales charts immediately
        toast({
          title: "Inventory Update",
          description: "Smartphone inventory restock has been ordered. Shipment will arrive in 3-5 business days.",
        });
        
      } else if (recommendation.category === "Pricing") {
        // Simulate price optimization effect - increase sales volume for accessories
        actionMessage = "Price optimization implemented for Accessories";
        
        // Update category data to reflect the price optimization
        updatedCategoryData = updatedCategoryData.map(item => {
          if (item.name === "Accessories") {
            return { ...item, value: item.value * 1.2 }; // 20% increase for Accessories
          }
          return item;
        });
        
        // Small boost in overall sales
        updatedSalesData = updatedSalesData.map(item => {
          if (item.date === updatedSalesData[updatedSalesData.length - 1].date) {
            return { ...item, value: item.value * 1.05 }; // 5% increase in latest month
          }
          return item;
        });
      }
      
      // Update recommendation status
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: "completed" } : rec
        )
      );
      
      // Update chart data to reflect the changes
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Get insights into your business performance</p>
          </div>
          <Tabs defaultValue="week" className="w-[400px]" value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={analyticsData?.totalSales ? `$${analyticsData.totalSales.toFixed(2)}` : "$0.00"}
                description="+20.1% from last month"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="New Customers"
                value="120"
                description="+10.1% from last month"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard
                title="Total Orders"
                value="450"
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
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesData || analyticsData?.monthlySalesData || []}>
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
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData || analyticsData?.categoriesData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(categoryData || analyticsData?.categoriesData || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
