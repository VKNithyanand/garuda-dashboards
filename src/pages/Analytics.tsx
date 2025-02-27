
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import {
  Brain,
  TrendingUp,
  BrainCircuit,
  LineChart,
  BarChart,
  Filter,
  Loader2,
  Calendar,
  ChevronDown,
  X,
  Check,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  LightbulbIcon,
} from "lucide-react";
import { useSalesByCategory, useSalesData, useInsights } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { toast } = useToast();
  const { data: salesByCategory = [], isLoading: isCategoryLoading, error: categoryError } = useSalesByCategory();
  const { data: salesData = [], isLoading: isSalesLoading } = useSalesData();
  const { data: insights = [], isLoading: isInsightsLoading, refetch: refetchInsights } = useInsights();
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filters, setFilters] = useState({
    category: "all",
    timeframe: "all",
  });
  const [filteredCategoryData, setFilteredCategoryData] = useState<any[]>([]);
  
  // Generate unique categories from sales data
  const categories = ["all", ...new Set(salesData.map(sale => sale.category))];
  
  useEffect(() => {
    if (salesByCategory.length > 0) {
      applyFilters();
    }
  }, [salesByCategory, filters]);
  
  const applyFilters = () => {
    let filtered = [...salesByCategory];
    
    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.name === filters.category);
    }
    
    // Apply timeframe filter - this would require actual date filtering in a real app
    // Here we're just simulating it
    if (filters.timeframe === "month") {
      filtered = filtered.map(item => ({
        ...item,
        value: item.value * (Math.random() * 0.5 + 0.5) // Simulate different values for different timeframes
      }));
    } else if (filters.timeframe === "quarter") {
      filtered = filtered.map(item => ({
        ...item,
        value: item.value * (Math.random() * 0.7 + 0.7)
      }));
    }
    
    setFilteredCategoryData(filtered);
  };

  if (categoryError) {
    toast({
      title: "Error loading data",
      description: categoryError.message,
      variant: "destructive",
    });
  }

  const generateAIInsights = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      
      if (error) throw error;
      
      await refetchInsights();
      
      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed your data and generated new insights.",
      });
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTakeAction = async (actionType: string) => {
    setActionInProgress(actionType);
    
    // Simulate API call for taking action
    try {
      // In a real app, we would call an API to perform the action
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Action Completed",
        description: `Your "${actionType}" action has been successfully implemented.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Calculate total sales
  const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
  
  // Calculate average transaction value
  const avgTransactionValue = salesData.length 
    ? totalSales / salesData.length 
    : 0;
  
  // Count unique customers
  const uniqueCustomers = new Set(salesData.map(sale => sale.customer_id)).size;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights and detailed analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              onClick={generateAIInsights}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Insights
                </>
              )}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="dashboard-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Analysis Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time Frame</label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="year">This Year</option>
                  <option value="quarter">This Quarter</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilters({ category: "all", timeframe: "all" });
                  setDateRange({ start: "", end: "" });
                }}
                className="text-sm text-muted-foreground hover:text-foreground mr-4"
              >
                Clear Filters
              </button>
              <button
                onClick={() => applyFilters()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="AI Predictions"
            value={`$${totalSales.toLocaleString('en-US', {maximumFractionDigits: 0})}`}
            description="Total Sales"
            icon={<Brain className="h-4 w-4" />}
          />
          <StatsCard
            title="Market Analysis"
            value={`$${avgTransactionValue.toLocaleString('en-US', {maximumFractionDigits: 2})}`}
            description="Average Transaction Value"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Customer Count"
            value={uniqueCustomers}
            description="Unique Customers"
            icon={<BrainCircuit className="h-4 w-4" />}
          />
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              <h2 className="text-lg font-medium">Sales by Category</h2>
            </div>
            {filters.category !== "all" && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Filtered by:</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                  {filters.category}
                  <button 
                    onClick={() => setFilters({...filters, category: "all"})}
                    className="ml-1 hover:text-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
          {isCategoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BarChartComponent data={filteredCategoryData.length > 0 ? filteredCategoryData : salesByCategory} />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="h-4 w-4" />
              <h3 className="font-medium">AI-Generated Insights</h3>
            </div>
            
            {isInsightsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      {insight.category === "Growth" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : insight.category === "Risk" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                      <div className="flex justify-between items-center w-full">
                        <span>{insight.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          insight.priority.toLowerCase() === "high" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                ))}
                <button 
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={generateAIInsights}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate New Insights
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-muted-foreground text-center">
                  No insights available yet. Generate new insights to get AI-powered recommendations.
                </p>
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={generateAIInsights}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-4 w-4" />
                  )}
                  Generate Insights
                </button>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-medium">Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Optimize Inventory Levels
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Current stock levels suggest adjusting inventory for seasonal
                    demand.
                  </p>
                </div>
                <button 
                  className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={() => handleTakeAction("Optimize Inventory")}
                  disabled={actionInProgress === "Optimize Inventory"}
                >
                  {actionInProgress === "Optimize Inventory" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Take Action
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Marketing Campaign Opportunity
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Data suggests potential for targeted email campaign focusing on top product categories.
                  </p>
                </div>
                <button 
                  className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={() => handleTakeAction("Launch Campaign")}
                  disabled={actionInProgress === "Launch Campaign"}
                >
                  {actionInProgress === "Launch Campaign" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Take Action
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Price Optimization Strategy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    AI analysis suggests adjusting prices for specific products to maximize revenue.
                  </p>
                </div>
                <button 
                  className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={() => handleTakeAction("Optimize Pricing")}
                  disabled={actionInProgress === "Optimize Pricing"}
                >
                  {actionInProgress === "Optimize Pricing" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Take Action
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
