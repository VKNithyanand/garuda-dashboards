
import React from "react";
import { cn } from "@/lib/utils";

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
}

export const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn("dashboard-card", className)}>
      <div className="flex items-start justify-between">
        {icon && <div className="p-2 bg-primary/10 rounded-full">{icon}</div>}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value > 0
                    ? "text-emerald-600"
                    : trend.value < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
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
    </div>
  );
};
