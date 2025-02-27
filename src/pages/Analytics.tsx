
import React, { useState } from "react";
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
  Loader2
} from "lucide-react";
import { useSalesByCategory, useSalesData } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { toast } = useToast();
  const { data: salesByCategory = [], isLoading: isCategoryLoading, error: categoryError } = useSalesByCategory();
  const { data: salesData = [], isLoading: isSalesLoading } = useSalesData();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIInsights = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      
      if (error) throw error;
      
      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed your data and generated new insights.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (categoryError) {
    toast({
      title: "Error loading data",
      description: categoryError.message,
      variant: "destructive",
    });
  }

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
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights and detailed analysis
          </p>
        </div>

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
            <h2 className="text-lg font-medium">Sales by Category</h2>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
          {isCategoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BarChartComponent data={salesByCategory} />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="dashboard-card">
            <h3 className="font-medium mb-4">AI-Generated Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Brain className="h-4 w-4" />
                  Sales Trend Analysis
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on current data, sales are projected to increase by 15% in
                  the next quarter. Consider increasing inventory for top-performing
                  categories.
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <BrainCircuit className="h-4 w-4" />
                  Customer Behavior
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer retention rate has improved by 12%. The AI suggests
                  focusing on personalized marketing campaigns for better
                  engagement.
                </p>
              </div>
              <button 
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
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
                    <Brain className="mr-2 h-4 w-4" />
                    Generate New Insights
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-medium mb-4">Recommendations</h3>
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
                <button className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  Take Action
                </button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Marketing Campaign Opportunity
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Data suggests potential for targeted email campaign.
                  </p>
                </div>
                <button className="shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  Take Action
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
