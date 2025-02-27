
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { useSalesByCategory } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  Filter,
  Calendar,
  Share2,
  Loader2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const { toast } = useToast();
  const { data: categoryData = [], isLoading, error } = useSalesByCategory();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState([
    { id: 1, name: "Q1 Sales Report", date: "1 day ago" },
    { id: 2, name: "Q2 Sales Report", date: "2 days ago" },
    { id: 3, name: "Q3 Sales Report", date: "3 days ago" },
  ]);
  
  if (error) {
    toast({
      title: "Error loading data",
      description: error.message,
      variant: "destructive",
    });
  }

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Call the analytics function
      const { data, error } = await supabase.functions.invoke('get-analytics');
      
      if (error) throw error;
      
      // Add new report to the list
      const newReport = {
        id: Date.now(),
        name: `Sales Report ${new Date().toLocaleDateString()}`,
        date: "Just now"
      };
      
      setRecentReports([newReport, ...recentReports.slice(0, 2)]);
      
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    // This would normally generate a PDF or Excel file
    toast({
      title: "Report Exported",
      description: "Your report has been exported successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and manage business reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Calendar className="mr-2 h-4 w-4" />
              Select Date
            </button>
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              onClick={exportReport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Sales by Category</h2>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </button>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <BarChartComponent data={categoryData} />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="dashboard-card">
              <h3 className="font-medium mb-4">Recent Reports</h3>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Generated {report.date}
                        </p>
                      </div>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <button 
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={generateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate New Report
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="font-medium mb-4">Report Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-generate Reports</p>
                    <p className="text-xs text-muted-foreground">
                      Generate reports automatically
                    </p>
                  </div>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Reports</p>
                    <p className="text-xs text-muted-foreground">
                      Send reports via email
                    </p>
                  </div>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    Configure
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Format</p>
                    <p className="text-xs text-muted-foreground">
                      Set default export format
                    </p>
                  </div>
                  <select className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
