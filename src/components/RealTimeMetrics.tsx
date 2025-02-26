
import React, { useEffect, useState } from "react";
import { generateRealtimeData } from "@/lib/api";
import { StatsCard } from "./StatsCard";
import { LineChart, Activity } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateRealtimeData();
      setMetrics((prev) => [...prev.slice(-4), newData]);
      
      // Show toast for significant changes
      if (newData.value > 8000) {
        toast({
          title: "High Activity Detected",
          description: `Unusual ${newData.category} activity: ${newData.value}`,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Real-Time Activity</h3>
          <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
            >
              <div>
                <p className="text-sm font-medium">{metric.category}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <p className="text-sm font-medium">{metric.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
