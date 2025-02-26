
import React from "react";
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
} from "lucide-react";

const categoryData = [
  { name: "Electronics", value: 4000 },
  { name: "Clothing", value: 3000 },
  { name: "Food", value: 2000 },
  { name: "Books", value: 2780 },
  { name: "Other", value: 1890 },
];

const Analytics = () => {
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
            value="High Growth"
            description="AI suggests positive trend"
            icon={<Brain className="h-4 w-4" />}
          />
          <StatsCard
            title="Market Analysis"
            value="Expanding"
            description="Based on current metrics"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Anomaly Detection"
            value="No Issues"
            description="All metrics within normal range"
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
          <BarChartComponent data={categoryData} />
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
