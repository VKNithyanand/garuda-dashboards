
import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  color?: "default" | "purple" | "blue" | "green" | "orange" | "pink";
}

export const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  color = "default"
}: StatsCardProps) => {
  const getGradientClass = () => {
    switch (color) {
      case "purple": return "bg-gradient-purple";
      case "blue": return "bg-gradient-blue";
      case "green": return "bg-gradient-green";
      case "orange": return "bg-gradient-orange";
      case "pink": return "bg-gradient-pink";
      default: return "bg-primary/10";
    }
  };

  const getIconBgClass = () => {
    switch (color) {
      case "purple": return "bg-brand-purple/20";
      case "blue": return "bg-brand-blue/20";
      case "green": return "bg-brand-green/20";
      case "orange": return "bg-brand-orange/20";
      case "pink": return "bg-brand-pink/20";
      default: return "bg-primary/10";
    }
  };

  const getValueClass = () => {
    switch (color) {
      case "purple": return "text-brand-purple";
      case "blue": return "text-brand-blue";
      case "green": return "text-brand-green";
      case "orange": return "text-brand-orange";
      case "pink": return "text-brand-pink";
      default: return "";
    }
  };

  return (
    <div className={cn("dashboard-card overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className={cn("p-2 rounded-full", getIconBgClass())}>
            {icon}
          </div>
        )}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            {title}
            {trend && trend.value > 10 && <Sparkles className="h-3 w-3 text-amber-500" />}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className={cn("text-2xl font-semibold", getValueClass())}>{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium rounded-full px-1.5 py-0.5",
                  trend.value > 0
                    ? "text-emerald-600 bg-emerald-100"
                    : trend.value < 0
                    ? "text-red-600 bg-red-100"
                    : "text-muted-foreground bg-muted"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className={cn("h-1 mt-4 rounded-full w-full opacity-30", getGradientClass())}></div>
    </div>
  );
};
