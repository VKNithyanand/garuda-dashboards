import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BarChart2, TrendingUp, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface CompetitorBenchmarkingProps {
  industry?: string;
}

export const CompetitorBenchmarking: React.FC<CompetitorBenchmarkingProps> = ({ 
  industry: initialIndustry = "retail"
}) => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState(initialIndustry);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [competitors, setCompetitors] = useState<string[]>(["Competitor A", "Competitor B", "Competitor C"]);
  const [activeTab, setActiveTab] = useState("performance");
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["competitorBenchmarking", industry, competitors],
    queryFn: async () => {
      try {
        const response = await supabase.functions.invoke("competitor-benchmarking", {
          body: { industry, competitors }
        });
        
        if (response.error) throw new Error(response.error.message);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching benchmarking data:", error);
        throw error;
      }
    }
  });

  const handleRefreshData = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest competitor benchmarking data...",
    });
    refetch();
  };

  const handleAddCompetitor = () => {
    if (newCompetitor && !competitors.includes(newCompetitor)) {
      setCompetitors([...competitors, newCompetitor]);
      setNewCompetitor("");
      toast({
        title: "Competitor added",
        description: `${newCompetitor} has been added to benchmarking`,
      });
    }
  };

  const handleChangeIndustry = (newIndustry: string) => {
    setIndustry(newIndustry);
    toast({
      title: "Industry updated",
      description: `Benchmarking against ${newIndustry} industry`,
    });
  };

  const formatBenchmarkingData = (metricIndex: number) => {
    if (!data) return [];
    
    const results = [];
    
    // Add your business
    results.push({
      name: data.yourBusiness.name,
      value: data.yourBusiness.values[metricIndex]
    });
    
    // Add competitors
    data.competitors.forEach((competitor: any) => {
      results.push({
        name: competitor.name,
        value: competitor.values[metricIndex]
      });
    });
    
    // Add industry average
    results.push({
      name: "Industry Average",
      value: data.industryAverages[metricIndex]
    });
    
    return results;
  };

  const formatTrendsData = () => {
    if (!data?.trends) return [];
    
    return data.trends.map((trend: any) => ({
      name: trend.name,
      value: trend.value,
      change: trend.change
    }));
  };
  
  // Function to get bar fill color based on entry name
  const getBarColor = (name: string) => {
    if (name === "Your Business") return "#3b82f6";
    if (name === "Industry Average") return "#6b7280";
    return "#10b981";
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load competitor benchmarking data.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Competitor Benchmarking & Market Trends</CardTitle>
            <CardDescription>Compare your performance with industry averages and competitors</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={industry}
                  onChange={(e) => handleChangeIndustry(e.target.value)}
                >
                  <option value="retail">Retail</option>
                  <option value="technology">Technology</option>
                  <option value="food">Food & Beverage</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Add Competitor</label>
                <div className="flex gap-2">
                  <Input 
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    placeholder="Competitor name"
                    className="flex-1"
                  />
                  <Button onClick={handleAddCompetitor}>Add</Button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="performance">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Market Trends
                </TabsTrigger>
                <TabsTrigger value="news">
                  <FileText className="mr-2 h-4 w-4" />
                  Industry News
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4">
                {data?.metrics.map((metric: string, index: number) => (
                  <div key={metric} className="mt-4">
                    <h3 className="text-lg font-medium mb-2">{metric}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={formatBenchmarkingData(index)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          name="Value"
                          fill="#10b981"
                        >
                          {formatBenchmarkingData(index).map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={getBarColor(entry.name)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="trends">
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Current Market Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatTrendsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Current Value (%)" 
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="change" 
                        name="Change (%)" 
                        stroke="#ef4444" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {data?.trends.map((trend: any) => (
                      <Card key={trend.name}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{trend.name}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trend.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </div>
                          </div>
                          <p className="text-2xl font-bold mt-2">{trend.value}%</p>
                          <p className="text-sm text-muted-foreground mt-1">Current market adoption</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="news">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-2">Latest Industry News</h3>
                  {data?.news.map((item: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Source: {item.source}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};
