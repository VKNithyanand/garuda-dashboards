
import React, { useEffect, useState } from "react";
import { generateRealtimeData } from "@/lib/api";
import { StatsCard } from "./StatsCard";
import { LineChart, Activity, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";

export const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const { toast } = useToast();
  const { hasUploadedData } = useData();

  useEffect(() => {
    if (!hasUploadedData) return;
    
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
  }, [toast, hasUploadedData]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Real-Time Activity</h3>
          <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
        </div>
        
        {!hasUploadedData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4 text-center">Upload your datasets first to see real-time metrics.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
