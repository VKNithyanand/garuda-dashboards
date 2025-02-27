
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInsights } from "@/lib/supabase-client";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Insights = () => {
  const { toast } = useToast();
  const { data: insightsData = [], isLoading, error } = useInsights();
  
  if (error) {
    toast({
      title: "Error loading insights",
      description: error.message,
      variant: "destructive",
    });
  }

  // Get insights by category
  const getInsightsByCategory = (category: string) => {
    return insightsData.filter(insight => insight.category === category);
  };

  const growthInsights = getInsightsByCategory("Growth");
  const riskInsights = getInsightsByCategory("Risk");

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="dashboard-card">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-5 w-5" />
                <h2 className="text-lg font-medium">Key Insights</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {growthInsights.length > 0 ? (
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <h3 className="font-medium">{growthInsights[0].title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {growthInsights[0].description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <h3 className="font-medium">Growth Opportunities</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Market analysis suggests potential for 25% growth in the electronics category.
                      Consider expanding inventory.
                    </p>
                  </div>
                )}
                
                {riskInsights.length > 0 ? (
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <h3 className="font-medium">{riskInsights[0].title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {riskInsights[0].description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <h3 className="font-medium">Risk Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Seasonal fluctuations may impact Q4 sales. Recommend adjusting
                      pricing strategy.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="dashboard-card">
                <h3 className="font-medium mb-4">Action Items</h3>
                <div className="space-y-4">
                  {insightsData.length > 0 
                    ? insightsData.slice(0, 3).map((insight, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span className="text-sm">{insight.title}</span>
                        </div>
                      ))
                    : ["Review inventory levels", "Optimize pricing strategy", "Launch marketing campaign"].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))
                  }
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="font-medium mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: "Customer Satisfaction", value: "92%" },
                    { label: "Revenue Growth", value: "+15%" },
                    { label: "Market Share", value: "28%" },
                  ].map((metric, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                    >
                      <span className="text-sm">{metric.label}</span>
                      <span className="text-sm font-medium">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;
