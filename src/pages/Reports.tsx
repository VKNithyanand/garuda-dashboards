import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { useSalesByCategory, useSalesData } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { CsvUploader } from "@/components/CsvUploader";
import {
  Download,
  FileText,
  Filter,
  Calendar,
  Share2,
  Loader2,
  Search,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  File,
  FileSpreadsheet,
  UploadCloud,
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Report {
  id: number;
  name: string;
  date: string;
  format: string;
}

const Reports = () => {
  const { toast } = useToast();
  const { data: supabaseCategoryData = [], isLoading, error } = useSalesByCategory();
  const { data: supabaseSalesData = [], isLoading: isSalesLoading } = useSalesData();
  const { salesData, categoryData, setSalesData, setCategoryData, hasUploadedData } = useData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    minAmount: "",
    maxAmount: "",
  });
  const [filteredChartData, setFilteredChartData] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([
    { id: 1, name: "Q1 Sales Report", date: "1 day ago", format: "PDF" },
    { id: 2, name: "Q2 Sales Report", date: "2 days ago", format: "Excel" },
    { id: 3, name: "Q3 Sales Report", date: "3 days ago", format: "CSV" },
  ]);
  
  const effectiveSalesData = salesData.length > 0 ? salesData : supabaseSalesData;
  const effectiveCategoryData = categoryData.length > 0 ? categoryData : supabaseCategoryData;
  
  const categories = ["all", ...new Set(effectiveSalesData.map(sale => sale.category))];
  
  useEffect(() => {
    if (effectiveCategoryData.length > 0) {
      applyFilters();
    }
  }, [effectiveCategoryData, filters]);
  
  const applyFilters = () => {
    let filtered = [...effectiveCategoryData];
    
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.name === filters.category);
    }
    
    if (filters.minAmount) {
      filtered = filtered.filter(item => item.value >= Number(filters.minAmount));
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(item => item.value <= Number(filters.maxAmount));
    }
    
    setFilteredChartData(filtered);
  };
  
  if (error) {
    toast({
      title: "Error loading data",
      description: error.message,
      variant: "destructive",
    });
  }

  const handleSalesDataLoaded = (data: any[]) => {
    setSalesData(data);
    
    const categoryMap = new Map<string, number>();
    
    data.forEach(sale => {
      const category = sale.category;
      const amount = Number(sale.amount);
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category)! + amount);
      } else {
        categoryMap.set(category, amount);
      }
    });
    
    const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    setCategoryData(chartData);
    setShowUploadDialog(false);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics');
      
      if (error) throw error;
      
      const newReport = {
        id: Date.now(),
        name: `Sales Report ${new Date().toLocaleDateString()}`,
        date: "Just now",
        format: selectedFormat
      };
      
      setRecentReports([newReport, ...recentReports.slice(0, 2)]);
      
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: number) => {
    const report = recentReports.find(r => r.id === reportId);
    if (!report) return;
    
    setIsDownloading(true);
    
    const data = effectiveCategoryData.length > 0 ? effectiveCategoryData : [];
    let reportData: string;
    
    if (report.format === "CSV") {
      reportData = "Category,Value\n";
      data.forEach(item => {
        reportData += `${item.name},${item.value}\n`;
      });
    } else if (report.format === "Excel") {
      reportData = "Category,Value\n";
      data.forEach(item => {
        reportData += `${item.name},${item.value}\n`;
      });
    } else {
      reportData = "SALES REPORT\n\n";
      data.forEach(item => {
        reportData += `${item.name}: ${item.value}\n`;
      });
    }
    
    const blob = new Blob([reportData], { 
      type: report.format === "PDF" 
        ? "application/pdf" 
        : report.format === "Excel" 
          ? "application/vnd.ms-excel" 
          : "text/csv" 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name}.${report.format === "PDF" ? "pdf" : report.format === "Excel" ? "xlsx" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
    
    toast({
      title: "Report Downloaded",
      description: `${report.name} has been downloaded in ${report.format} format.`,
    });
  };

  const handleExport = () => {
    setIsDownloading(true);
    
    const dataToExport = filteredChartData.length > 0 ? filteredChartData : effectiveCategoryData;
    
    let exportData: string;
    
    if (selectedFormat === "CSV") {
      exportData = "Category,Value\n";
      dataToExport.forEach(item => {
        exportData += `${item.name},${item.value}\n`;
      });
    } else if (selectedFormat === "Excel") {
      exportData = "Category,Value\n";
      dataToExport.forEach(item => {
        exportData += `${item.name},${item.value}\n`;
      });
    } else {
      exportData = "SALES REPORT\n\n";
      dataToExport.forEach(item => {
        exportData += `${item.name}: ${item.value}\n`;
      });
    }
    
    const blob = new Blob([exportData], { 
      type: selectedFormat === "PDF" 
        ? "application/pdf" 
        : selectedFormat === "Excel" 
          ? "application/vnd.ms-excel" 
          : "text/csv" 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sales_Report_${new Date().toLocaleDateString()}.${selectedFormat === "PDF" ? "pdf" : selectedFormat === "Excel" ? "xlsx" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
    
    toast({
      title: "Report Exported",
      description: `Your report has been exported in ${selectedFormat} format.`,
    });
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      minAmount: "",
      maxAmount: "",
    });
    setFilteredChartData(categoryData);
  };

  const formatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "Excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "CSV":
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
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
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Sales Data</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <CsvUploader 
                    onDataLoaded={handleSalesDataLoaded} 
                    type="sales"
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="relative">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.start && dateRange.end 
                  ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                  : "Select Date Range"}
              </button>
              
              {showDatePicker && (
                <div className="absolute right-0 z-10 mt-2 w-72 p-4 rounded-md border border-input bg-background shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Select Date Range</h4>
                    <button onClick={() => setShowDatePicker(false)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs">Start Date</label>
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs">End Date</label>
                      <input 
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button 
                        onClick={() => setDateRange({ start: "", end: "" })}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => setShowDatePicker(false)}
                        className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              onClick={handleExport}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Sales by Category</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                  
                  {showFilterMenu && (
                    <div className="absolute right-0 z-10 mt-2 w-72 p-4 rounded-md border border-input bg-background shadow-md">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium">Filter Options</h4>
                        <button onClick={() => setShowFilterMenu(false)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs block mb-1">Category</label>
                          <select
                            value={filters.category}
                            onChange={(e) => setFilters({...filters, category: e.target.value})}
                            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category === "all" ? "All Categories" : category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs block mb-1">Amount Range</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.minAmount}
                              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.maxAmount}
                              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <button 
                            onClick={clearFilters}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear Filters
                          </button>
                          <button 
                            onClick={() => setShowFilterMenu(false)}
                            className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
            
            {isLoading && !hasUploadedData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {effectiveCategoryData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Sales Data Available</h3>
                    <p className="text-muted-foreground mb-4">Upload a CSV file to see sales analytics.</p>
                    <Button onClick={() => setShowUploadDialog(true)}>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Upload CSV
                    </Button>
                  </div>
                ) : (
                  <>
                    <BarChartComponent data={filteredChartData.length > 0 ? filteredChartData : effectiveCategoryData} />
                    {filteredChartData.length === 0 && effectiveCategoryData.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <p className="text-sm text-muted-foreground">No data matches the selected filters</p>
                      </div>
                    )}
                  </>
                )}
              </>
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
                      {formatIcon(report.format || "PDF")}
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Generated {report.date} • {report.format || "PDF"}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      onClick={() => downloadReport(report.id)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
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
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-input">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-background transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Reports</p>
                    <p className="text-xs text-muted-foreground">
                      Send reports via email
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-input">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-background transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Export Format</p>
                      <p className="text-xs text-muted-foreground">
                        Set default export format
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["PDF", "Excel", "CSV"].map(format => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                          selectedFormat === format 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-card border border-input hover:bg-accent"
                        }`}
                      >
                        {selectedFormat === format && <Check className="h-3 w-3" />}
                        {formatIcon(format)}
                        <span>{format}</span>
                      </button>
                    ))}
                  </div>
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
