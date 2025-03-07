import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { useSalesByCategory, useSalesData } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  Filter,
  Calendar,
  Share2,
  Loader2,
  X,
  ChevronDown,
  Check,
  File,
  FileSpreadsheet,
  Upload,
  Info,
} from "lucide-react";

// Create a file downloader utility function
const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

// Helper function to get edge function URL - fixed to use proper method
const getFunctionUrl = (functionName: string): string => {
  const url = supabase.functions.url(functionName);
  return url || '';
};

const Reports = () => {
  const { toast } = useToast();
  const { data: categoryData = [], isLoading, error } = useSalesByCategory();
  const { data: salesData = [], isLoading: isSalesLoading } = useSalesData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    minAmount: "",
    maxAmount: "",
  });
  const [filteredChartData, setFilteredChartData] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState([
    { id: 1, name: "Q1 Sales Report", date: "1 day ago", format: "PDF" },
    { id: 2, name: "Q2 Sales Report", date: "2 days ago", format: "Excel" },
    { id: 3, name: "Q3 Sales Report", date: "3 days ago", format: "CSV" },
  ]);
  
  // New state for custom data upload
  const [isUploading, setIsUploading] = useState(false);
  const [customData, setCustomData] = useState<any[] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate unique categories from sales data
  const categories = ["all", ...new Set(salesData.map(sale => sale.category))];
  
  useEffect(() => {
    if (categoryData.length > 0) {
      applyFilters();
    }
  }, [categoryData, filters]);
  
  const applyFilters = () => {
    let filtered = [...categoryData];
    
    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.name === filters.category);
    }
    
    // Apply amount range filters
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

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Call the analytics function
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: customData ? { customData } : undefined
      });
      
      if (error) throw error;
      
      // Add new report to the list
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

  const downloadReport = async (reportId: number) => {
    const report = recentReports.find(r => r.id === reportId);
    if (!report) return;
    
    setIsDownloading(true);
    
    try {
      // Get the function URL in a type-safe way
      const functionUrl = `${getFunctionUrl('get-analytics')}?format=${report.format.toLowerCase()}`;
      
      // Download the file with the appropriate name
      const success = await downloadFile(
        functionUrl, 
        `Sales_Report_${new Date().toISOString().split('T')[0]}.${report.format.toLowerCase()}`
      );
      
      if (success) {
        toast({
          title: "Report Downloaded",
          description: `${report.name} has been downloaded in ${report.format} format.`,
        });
      } else {
        throw new Error("Failed to download the report.");
      }
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExport = async () => {
    setIsDownloading(true);
    
    try {
      // Get the function URL in a type-safe way
      const functionUrl = `${getFunctionUrl('get-analytics')}?format=${selectedFormat.toLowerCase()}`;
      
      if (customData) {
        // If we have custom data, use POST method to send it
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ customData }),
        });
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Sales_Report_${new Date().toISOString().split('T')[0]}.${selectedFormat.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
      } else {
        // Without custom data, use the download utility
        await downloadFile(
          functionUrl, 
          `Sales_Report_${new Date().toISOString().split('T')[0]}.${selectedFormat.toLowerCase()}`
        );
      }
      
      toast({
        title: "Report Exported",
        description: `Your report has been exported in ${selectedFormat} format.`,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
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
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse CSV or JSON based on file type
        let parsedData;
        if (file.type === 'application/json') {
          parsedData = JSON.parse(e.target?.result as string);
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          parsedData = parseCSV(e.target?.result as string);
        } else {
          throw new Error('Unsupported file format. Please upload CSV or JSON.');
        }
        
        // Validate the data structure
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setCustomData(parsedData);
          toast({
            title: "Data Uploaded",
            description: `Successfully uploaded ${parsedData.length} records.`,
          });
          setShowUploadModal(false);
        } else {
          throw new Error('Invalid data format. Please upload a valid dataset.');
        }
      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: error.message || "Failed to parse the uploaded file.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    if (file.type === 'application/json' || file.type === 'text/csv' || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      toast({
        title: "Unsupported Format",
        description: "Please upload a CSV or JSON file.",
        variant: "destructive",
      });
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Parse CSV to JSON
  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as Record<string, string>);
    });
  };
  
  // Clear custom data
  const clearCustomData = () => {
    setCustomData(null);
    toast({
      title: "Custom Data Cleared",
      description: "Reverted to default database data.",
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </button>
            
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

        {customData && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium">Using Custom Dataset</p>
                <p className="text-xs text-muted-foreground">
                  Showing visualization based on your uploaded data ({customData.length} records)
                </p>
              </div>
            </div>
            <button 
              onClick={clearCustomData}
              className="text-xs text-primary hover:underline"
            >
              Revert to Default Data
            </button>
          </div>
        )}

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
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <BarChartComponent data={filteredChartData.length > 0 ? filteredChartData : categoryData} />
                {filteredChartData.length === 0 && categoryData.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <p className="text-sm text-muted-foreground">No data matches the selected filters</p>
                  </div>
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

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Upload Dataset</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a CSV or JSON file to visualize your own data. The data will be used for visualization and export but won't be saved to the database.
                </p>
                
                <div className="border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drag & drop file or click to browse</p>
                  <p className="text-xs text-muted-foreground mb-2">Supports CSV and JSON formats</p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.json,application/json,text/csv"
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-2"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>Browse Files</>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input h-9 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  disabled={isUploading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
