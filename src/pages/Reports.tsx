
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFunctionUrl, getAuthHeader } from "@/lib/supabase-functions";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedType, setSelectedType] = useState("summary");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const url = getFunctionUrl('get-analytics');
      const headers = await getAuthHeader();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ 
          period: selectedPeriod,
          type: selectedType
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setReportData(data);
      
      toast({
        title: "Reports Loaded",
        description: `Successfully loaded ${selectedPeriod} ${selectedType} reports.`
      });
      
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError(String(error));
      
      toast({
        title: "Error Loading Reports",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, selectedType]);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Reports</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReports}>Refresh Reports</Button>
          </div>
        </div>
        
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Make sure the Edge Function is deployed and working correctly.
              </p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && reportData.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No reports available for the selected criteria.</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{report.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
