
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Lightbulb, AlertTriangle, ArrowUp, ArrowDown, Loader2, Brain, UploadCloud } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";

export const PredictiveAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<"7days" | "30days" | "90days">("30days");
  const { toast } = useToast();
  const { salesData, hasUploadedData } = useData();

  const processData = () => {
    if (salesData.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Process the data by date
      const groupedByDate: Record<string, number> = {};
      
      salesData.forEach((sale) => {
        const date = new Date(sale.transaction_date);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = 0;
        }
        
        groupedByDate[dateStr] += Number(sale.amount);
      });
      
      // Convert to array format for the chart
      const chartData = Object.keys(groupedByDate).map(date => ({
        date,
        value: groupedByDate[date]
      }));
      
      // Generate prediction data
      generatePredictions(chartData);
    } catch (error: any) {
      console.error("Error processing data:", error);
      toast({
        title: "Error processing data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generatePredictions = (data: any[]) => {
    if (data.length === 0) return;
    
    // Simple prediction using moving average
    const recentData = data.slice(-30); // Last 30 days
    
    // Calculate moving average
    const movingAverage = recentData.reduce((sum, item) => sum + item.value, 0) / recentData.length;
    
    // Calculate growth rate
    const firstValue = recentData[0].value;
    const lastValue = recentData[recentData.length - 1].value;
    const growthRate = (lastValue - firstValue) / firstValue;
    
    // Generate future dates and predictions
    const lastDate = new Date(data[data.length - 1].date);
    const futurePredictions = [];
    
    for (let i = 1; i <= 14; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + i);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      // Use growth rate to predict future values
      // Add some random noise to make it look more realistic
      const noise = (Math.random() - 0.5) * 0.1; // +/- 5% noise
      const predictedValue = lastValue * (1 + (growthRate / 30) * i + noise);
      
      futurePredictions.push({
        date: dateStr,
        predicted: predictedValue
      });
    }
    
    setPredictions(futurePredictions);
  };
  
  useEffect(() => {
    processData();
  }, [salesData]);
  
  // Prepare data for the chart
  const prepareChartData = () => {
    // Determine how many historical days to show
    const days = selectedTimeFrame === "7days" ? 7 : 
                 selectedTimeFrame === "30days" ? 30 : 90;
    
    if (salesData.length === 0) return [];
    
    // Process the data by date
    const groupedByDate: Record<string, number> = {};
    
    salesData.forEach((sale) => {
      const date = new Date(sale.transaction_date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = 0;
      }
      
      groupedByDate[dateStr] += Number(sale.amount);
    });
    
    // Convert to array format for the chart
    const historicalData = Object.keys(groupedByDate).map(date => ({
      date,
      actual: groupedByDate[date],
      predicted: null as number | null
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Get the recent sales data
    const recentSales = historicalData.slice(-days);
    
    // Combine with predictions
    return [...recentSales, ...predictions.map(item => ({
      date: item.date,
      actual: null,
      predicted: item.predicted
    }))];
  };
  
  // Calculate trend indicators
  const getTrendInfo = () => {
    if (salesData.length < 2 || predictions.length === 0) return null;
    
    // Process the data by date for recent actual
    const groupedByDate: Record<string, number> = {};
    
    salesData.forEach((sale) => {
      const date = new Date(sale.transaction_date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = 0;
      }
      
      groupedByDate[dateStr] += Number(sale.amount);
    });
    
    const historicalValues = Object.values(groupedByDate);
    const recentActual = historicalValues.slice(-10);
    const recentAvg = recentActual.reduce((sum, value) => sum + value, 0) / recentActual.length;
    
    const predictedAvg = predictions.reduce((sum, item) => sum + item.predicted, 0) / predictions.length;
    
    const percentChange = ((predictedAvg - recentAvg) / recentAvg) * 100;
    
    return {
      direction: percentChange >= 0 ? "up" : "down",
      change: Math.abs(percentChange).toFixed(1),
      indicator: percentChange >= 5 ? "positive" : 
                percentChange <= -5 ? "negative" : "neutral",
      message: percentChange >= 5 ? "Strong growth expected" : 
              percentChange >= 0 ? "Slight growth expected" : 
              percentChange >= -5 ? "Slight decline expected" : 
              "Significant decline expected"
    };
  };
  
  const trendInfo = getTrendInfo();
  const chartData = prepareChartData();

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <h3 className="font-medium">Predictive Analytics</h3>
        </div>
        {hasUploadedData && (
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedTimeFrame("7days")}
              className={`text-xs px-2 py-1 rounded-md ${
                selectedTimeFrame === "7days" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setSelectedTimeFrame("30days")}
              className={`text-xs px-2 py-1 rounded-md ${
                selectedTimeFrame === "30days" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setSelectedTimeFrame("90days")}
              className={`text-xs px-2 py-1 rounded-md ${
                selectedTimeFrame === "90days" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              90 Days
            </button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !hasUploadedData ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-medium text-lg mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4 text-center">Upload your datasets first to see predictive analytics.</p>
        </div>
      ) : (
        <>
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Value"]}
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Actual Sales"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Sales"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {trendInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {trendInfo.direction === "up" ? (
                  <ArrowUp className={`h-5 w-5 ${trendInfo.indicator === "positive" ? "text-green-500" : "text-primary"}`} />
                ) : (
                  <ArrowDown className={`h-5 w-5 ${trendInfo.indicator === "negative" ? "text-red-500" : "text-primary"}`} />
                )}
                <span className="font-medium text-sm">
                  {trendInfo.direction === "up" ? "Projected to increase" : "Projected to decrease"} 
                  by {trendInfo.change}%
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${
                  trendInfo.indicator === "positive" ? "bg-green-50" : 
                  trendInfo.indicator === "negative" ? "bg-red-50" : 
                  "bg-primary/5"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {trendInfo.indicator === "positive" ? (
                      <Lightbulb className="h-4 w-4 text-green-500" />
                    ) : trendInfo.indicator === "negative" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                    <h4 className="text-sm font-medium">Forecast</h4>
                  </div>
                  <p className="text-sm">{trendInfo.message}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-primary/5">
                  <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                  <p className="text-sm">
                    {trendInfo.indicator === "positive" 
                      ? "Consider increasing inventory to meet projected demand."
                      : trendInfo.indicator === "negative"
                      ? "Review pricing strategy and consider promotional campaigns."
                      : "Monitor sales closely for any significant changes."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
