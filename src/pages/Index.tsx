
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import {
  LineChart,
  BarChart,
  PieChart,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const Index = () => {
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
            value="$45,231.89"
            trend={{ value: 20.1, label: "from last month" }}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Users"
            value="2,420"
            trend={{ value: 10.1, label: "from last month" }}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Sales"
            value="1,437"
            trend={{ value: -5.1, label: "from last month" }}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatsCard
            title="Growth"
            value="+12.40%"
            trend={{ value: 4.1, label: "from last month" }}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="dashboard-card md:col-span-4">
            <h3 className="font-medium">Revenue Over Time</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be implemented in next iteration
            </div>
          </div>
          <div className="dashboard-card md:col-span-3">
            <h3 className="font-medium">Recent Sales</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Table will be implemented in next iteration
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
