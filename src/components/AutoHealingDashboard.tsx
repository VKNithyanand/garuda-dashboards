
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, BrainCircuit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StatsCard } from "./StatsCard";

export const AutoHealingDashboard = () => {
  const [dataHealth, setDataHealth] = useState<{
    status: "checking" | "healthy" | "issues" | "healing";
    issues: {
      type: "missing" | "anomaly" | "api-failure";
      source: string;
      description: string;
      severity: "low" | "medium" | "high";
      fixable: boolean;
      status: "detected" | "fixing" | "fixed";
    }[];
    lastChecked: Date | null;
    completeness: number;
  }>({
    status: "checking",
    issues: [],
    lastChecked: null,
    completeness: 0,
  });
  
  const [healingProgress, setHealingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { salesData, hasUploadedData } = useData();

  useEffect(() => {
    if (hasUploadedData) {
      checkDataHealth();
    }
  }, [salesData, hasUploadedData]);

  const checkDataHealth = () => {
    setDataHealth(prev => ({ ...prev, status: "checking" }));
    
    // Simulate checking data health with a delay
    setTimeout(() => {
      // Analyze the data for issues
      const issues = [];
      let missingCount = 0;
      let anomalyCount = 0;
      
      if (salesData.length > 0) {
        // Check for missing values in critical fields
        salesData.forEach((sale, index) => {
          if (!sale.amount || sale.amount <= 0) {
            missingCount++;
            issues.push({
              type: "missing" as const,
              source: "sales.amount",
              description: `Missing or invalid amount value at record ${index}`,
              severity: "high" as const,
              fixable: true,
              status: "detected" as const
            });
          }
          
          if (!sale.transaction_date) {
            missingCount++;
            issues.push({
              type: "missing" as const,
              source: "sales.transaction_date",
              description: `Missing transaction date at record ${index}`,
              severity: "medium" as const,
              fixable: true,
              status: "detected" as const
            });
          }
          
          // Detect potential anomalies (for demo, consider very high values as anomalies)
          if (sale.amount && sale.amount > 10000) {
            anomalyCount++;
            issues.push({
              type: "anomaly" as const,
              source: "sales.amount",
              description: `Unusually high amount ($${sale.amount}) at record ${index}`,
              severity: "medium" as const,
              fixable: false,
              status: "detected" as const
            });
          }
        });
      }
      
      // Add a simulated API failure issue for demonstration
      if (salesData.length > 10) {
        issues.push({
          type: "api-failure" as const,
          source: "external-api",
          description: "Failed to fetch external market comparison data",
          severity: "low" as const,
          fixable: true,
          status: "detected" as const
        });
      }
      
      // Calculate data completeness score (100% - percentage of issues)
      const totalRecords = salesData.length;
      const completeness = totalRecords > 0 
        ? Math.min(100, Math.max(0, 100 - (100 * (missingCount + anomalyCount) / (totalRecords * 2)))) 
        : 100;
      
      setDataHealth({
        status: issues.length > 0 ? "issues" : "healthy",
        issues,
        lastChecked: new Date(),
        completeness
      });
      
      // Notify if issues were found
      if (issues.length > 0) {
        toast({
          title: "Data issues detected",
          description: `Found ${issues.length} issues that may affect your dashboard performance.`,
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const startHealing = () => {
    if (dataHealth.issues.length === 0) return;
    
    setDataHealth(prev => ({ ...prev, status: "healing" }));
    setHealingProgress(0);
    
    // Simulate the healing process
    const totalIssues = dataHealth.issues.length;
    let fixedCount = 0;
    
    const healInterval = setInterval(() => {
      fixedCount++;
      const progress = Math.round((fixedCount / totalIssues) * 100);
      setHealingProgress(progress);
      
      // Update the status of issues being fixed
      setDataHealth(prev => {
        const updatedIssues = [...prev.issues];
        if (updatedIssues[fixedCount - 1] && updatedIssues[fixedCount - 1].fixable) {
          updatedIssues[fixedCount - 1].status = "fixing";
          
          // After a delay, mark as fixed
          setTimeout(() => {
            setDataHealth(prev => {
              const newIssues = [...prev.issues];
              if (newIssues[fixedCount - 1]) {
                newIssues[fixedCount - 1].status = "fixed";
              }
              return { ...prev, issues: newIssues };
            });
          }, 800);
        }
        
        return { ...prev, issues: updatedIssues };
      });
      
      // Complete the healing process
      if (fixedCount >= totalIssues) {
        clearInterval(healInterval);
        
        setTimeout(() => {
          // Count how many issues were actually fixable and fixed
          const fixableIssues = dataHealth.issues.filter(issue => issue.fixable).length;
          
          setDataHealth(prev => ({ 
            ...prev, 
            status: fixableIssues < prev.issues.length ? "issues" : "healthy",
            completeness: prev.completeness + (100 - prev.completeness) * (fixableIssues / prev.issues.length)
          }));
          
          toast({
            title: "Auto-healing complete",
            description: `Fixed ${fixableIssues} out of ${totalIssues} detected issues.`,
            variant: "default"
          });
        }, 1000);
      }
    }, 1000);
  };

  const getStatusIcon = () => {
    switch (dataHealth.status) {
      case "checking":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "issues":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "healing":
        return <BrainCircuit className="h-5 w-5 text-brand-purple animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (dataHealth.status) {
      case "checking": return "bg-primary/10";
      case "healthy": return "bg-success/10";
      case "issues": return "bg-warning/10";
      case "healing": return "bg-brand-purple/10";
      default: return "bg-muted";
    }
  };

  const getIssueTypeIcon = (type: "missing" | "anomaly" | "api-failure") => {
    switch (type) {
      case "missing":
        return <div className="p-1 rounded-full bg-red-100 text-red-600"><AlertTriangle className="h-3 w-3" /></div>;
      case "anomaly":
        return <div className="p-1 rounded-full bg-amber-100 text-amber-600"><AlertTriangle className="h-3 w-3" /></div>;
      case "api-failure":
        return <div className="p-1 rounded-full bg-blue-100 text-blue-600"><AlertTriangle className="h-3 w-3" /></div>;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (dataHealth.status) {
      case "checking":
        return "Checking data health...";
      case "healthy":
        return "All data systems operational";
      case "issues":
        return `${dataHealth.issues.length} issues detected`;
      case "healing":
        return "AI healing in progress...";
      default:
        return "";
    }
  };

  const getSeverityClass = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  const getProgressColor = () => {
    if (dataHealth.completeness >= 90) return "bg-success";
    if (dataHealth.completeness >= 70) return "bg-amber-500";
    return "bg-destructive";
  };

  // If data hasn't been uploaded yet, show a message
  if (!hasUploadedData) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <BrainCircuit className="h-12 w-12 text-brand-purple/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">AI Auto-Healing Dashboard</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Our AI system can automatically detect and fix data issues, ensuring your dashboards always display accurate information.
          </p>
          <p className="text-sm text-muted-foreground">
            Upload your data to start using the auto-healing capabilities.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-brand-purple" />
          <h3 className="font-medium">AI Auto-Healing Dashboard</h3>
        </div>
        <Button
          size="sm"
          onClick={checkDataHealth}
          disabled={dataHealth.status === "checking" || dataHealth.status === "healing"}
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-lg p-4 ${getStatusColor()} flex items-center gap-3`}>
          {getStatusIcon()}
          <div>
            <h4 className="text-sm font-medium">Status</h4>
            <p className="text-sm">{getStatusText()}</p>
          </div>
        </div>
        
        <div className="rounded-lg p-4 bg-primary/5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Data Completeness</h4>
            <span className="text-sm font-medium">{Math.round(dataHealth.completeness)}%</span>
          </div>
          <Progress value={dataHealth.completeness} className="h-2" indicatorClassName={getProgressColor()} />
        </div>
        
        <div className="rounded-lg p-4 bg-primary/5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Last Check</h4>
            <p className="text-sm">
              {dataHealth.lastChecked 
                ? new Date(dataHealth.lastChecked).toLocaleTimeString() 
                : "Never"}
            </p>
          </div>
          {dataHealth.issues.length > 0 && dataHealth.status !== "healing" && (
            <Button 
              onClick={startHealing} 
              className="gap-1 bg-brand-purple hover:bg-brand-purple/90"
            >
              <BrainCircuit className="h-4 w-4" />
              Heal
            </Button>
          )}
        </div>
      </div>

      {dataHealth.status === "healing" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Healing Progress</h4>
            <span className="text-sm">{healingProgress}%</span>
          </div>
          <Progress value={healingProgress} className="h-2" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues {dataHealth.issues.length > 0 && `(${dataHealth.issues.length})`}</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="AI Healing Success Rate"
              value="92%"
              description="Based on 24 healing operations"
              color="purple"
              trend={{ value: 8, label: "from last month" }}
            />
            
            <StatsCard
              title="Average Data Quality"
              value={`${Math.round(dataHealth.completeness)}%`}
              description="Based on completeness & accuracy"
              color="blue"
              trend={{ value: dataHealth.completeness > 90 ? 3 : -2, label: "from baseline" }}
            />
          </div>
          
          <div className="rounded-lg p-5 bg-primary/5">
            <h4 className="font-medium mb-3">Data Quality Distribution</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Complete", value: Math.round(dataHealth.completeness) },
                    { name: "Missing", value: Math.max(0, Math.round(100 - dataHealth.completeness - (100 - dataHealth.completeness) * 0.3)) },
                    { name: "Anomalies", value: Math.max(0, Math.round((100 - dataHealth.completeness) * 0.3)) }
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: '%', position: 'insideLeft', angle: -90, dx: -10 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" name="Percentage">
                    {[
                      { name: "Complete", color: "#22c55e" },
                      { name: "Missing", color: "#ef4444" },
                      { name: "Anomalies", color: "#f59e0b" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="issues">
          {dataHealth.issues.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {dataHealth.issues.map((issue, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-primary/5">
                  {getIssueTypeIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{issue.source}</h5>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{issue.type}</span>
                      {issue.status === "fixed" ? (
                        <span className="text-xs font-medium text-success flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Fixed
                        </span>
                      ) : issue.status === "fixing" ? (
                        <span className="text-xs font-medium text-brand-purple flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Fixing...
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          {issue.fixable ? "Fixable" : "Manual review needed"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-8 w-8 text-success mb-2" />
              <h4 className="font-medium">No Issues Detected</h4>
              <p className="text-sm text-muted-foreground">Your data is healthy and ready for analysis.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="predictions">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-brand-purple/10 border border-brand-purple/20">
              <div className="flex items-start gap-3">
                <BrainCircuit className="h-5 w-5 text-brand-purple mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">AI Prediction & Imputation</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI system analyzes your data patterns and predicts likely values for missing data points.
                    This ensures your dashboards remain accurate even when facing data pipeline issues.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5">
                <h5 className="text-sm font-medium mb-2">Prediction Methods</h5>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Time-series forecasting for temporal data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Regression models for continuous values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Classification for categorical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-green-100 text-green-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Collaborative filtering for relational data</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/5">
                <h5 className="text-sm font-medium mb-2">Data Sources</h5>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Historical patterns in your existing data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Similar records from related data sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Industry benchmarks and seasonal trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Correlation analysis with related metrics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
