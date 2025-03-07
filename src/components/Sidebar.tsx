
import React from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  BarChart,
  PieChart,
  Settings,
  Users,
  Home,
} from "lucide-react";

export const Sidebar = () => {
  const links = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Analytics", icon: LineChart, path: "/analytics" },
    { name: "Reports", icon: BarChart, path: "/reports" },
    { name: "Insights", icon: PieChart, path: "/insights" },
    { name: "Users", icon: Users, path: "/users" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r">
      <div className="p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
      </div>
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
