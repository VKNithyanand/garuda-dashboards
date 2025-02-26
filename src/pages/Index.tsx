import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RealTimeMetrics } from "@/components/RealTimeMetrics";
import { NLPQueryInput } from "@/components/NLPQueryInput";
import {
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
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

const revenueData = [
  { month: "Jan", revenue: 2400 },
  { month: "Feb", revenue: 1398 },
  { month: "Mar", revenue: 9800 },
  { month: "Apr", revenue: 3908 },
  { month: "May", revenue: 4800 },
  { month: "Jun", revenue: 3800 },
  { month: "Jul", revenue: 4300 },
];

const recentSales = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    amount: "$250.00",
    date: "2024-03-15",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael@example.com",
    amount: "$1,000.00",
    date: "2024-03-14",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@example.com",
    amount: "$450.00",
    date: "2024-03-14",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james@example.com",
    amount: "$800.00",
    date: "2024-03-13",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa@example.com",
    amount: "$150.00",
    date: "2024-03-13",
  },
];

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
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
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
          </div>
          <div className="dashboard-card md:col-span-3">
            <h3 className="font-medium">Recent Sales</h3>
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
                          .map((n) => n[0])
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
                        {new Date(sale.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RealTimeMetrics />
          <NLPQueryInput />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
