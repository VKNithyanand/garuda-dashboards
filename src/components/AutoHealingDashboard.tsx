
import React, { useState } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  CheckCircle2, 
  CircleDashed, 
  CloudOff,
  CloudRain,
  Database,
  ServerCrash,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Mock data for auto-healing dashboard
const dataQualityScores = {
  current: 87,
  previous: 82,
  trend: 6.1,
  issues: 7,
  resolvedIssues: 24,
  pendingIssues: 2,
};

const dataAutohealingActivity = [
  {
    id: 1,
    timestamp: "2023-08-12T14:22:00Z",
    issueType: "Missing Data",
    status: "Healed",
    source: "API Timeout",
    confidence: 94,
    description: "Predicted 27 missing sales transactions using historical patterns"
  },
  {
    id: 2,
    timestamp: "2023-08-11T09:15:00Z",
    issueType: "Invalid Values",
    status: "Healed",
    source: "Database Constraint",
    confidence: 88,
    description: "Corrected invalid date formats in customer registration data"
  },
  {
    id: 3,
    timestamp: "2023-08-10T17:45:00Z",
    issueType: "Null References",
    status: "Healed",
    source: "Integration Error",
    confidence: 96,
    description: "Added missing product category references based on similar products"
  },
  {
    id: 4,
    timestamp: "2023-08-09T11:30:00Z",
    issueType: "Data Drift",
    status: "Monitoring",
    source: "Seasonal Pattern",
    confidence: 78,
    description: "Detected shift in customer behavior patterns, monitoring for confirmation"
  },
  {
    id: 5,
    timestamp: "2023-08-08T16:05:00Z",
    issueType: "Duplicate Records",
    status: "Healed",
    source: "Sync Failure",
    confidence: 92,
    description: "Merged 16 duplicate customer profiles while preserving all unique data"
  }
];

const dataHealingMetrics = {
  totalHealed: 1247,
  healingAccuracy: 94.2,
  avgResponseTime: "1.3s",
  dataSourcesCovered: 8,
  monitoredMetrics: 42,
};

const dataIssueTypes = [
  { type: "Missing Values", count: 322, percentage: 25.8 },
  { type: "Invalid Formats", count: 283, percentage: 22.7 },
  { type: "Duplicates", count: 218, percentage: 17.5 },
  { type: "Outliers", count: 176, percentage: 14.1 },
  { type: "Inconsistent References", count: 154, percentage: 12.4 },
  { type: "Other Issues", count: 94, percentage: 7.5 },
];

const dataSourceHealth = [
  { name: "CRM API", status: "Healthy", uptime: 99.8, healingEvents: 42 },
  { name: "Sales Database", status: "Degraded", uptime: 97.2, healingEvents: 128 },
  { name: "Marketing Analytics", status: "Healthy", uptime: 99.9, healingEvents: 17 },
  { name: "Inventory System", status: "Critical", uptime: 85.4, healingEvents: 214 },
  { name: "Customer Feedback", status: "Healthy", uptime: 99.5, healingEvents: 36 },
];

export const AutoHealingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healed":
        return "bg-success text-success-foreground";
      case "Monitoring":
        return "bg-warning text-warning-foreground";
      case "Failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "Healthy":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "Degraded":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "Critical":
        return <ServerCrash className="h-4 w-4 text-destructive" />;
      default:
        return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Auto-Healing Dashboard</h1>
        <p className="text-muted-foreground">
          Automatically detect & fix broken data pipelines using AI-powered predictive imputation
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Data Quality Score"
              value={`${dataQualityScores.current}%`}
              icon={<Sparkles className="h-4 w-4 text-brand-purple" />}
              trend={{ value: dataQualityScores.trend, label: "vs last month" }}
              color="purple"
            />
            
            <StatsCard 
              title="Issues Detected"
              value={dataQualityScores.issues}
              icon={<AlertCircle className="h-4 w-4 text-brand-orange" />}
              trend={{ value: -12.5, label: "vs last month" }}
              color="orange"
            />
            
            <StatsCard 
              title="Auto-Healed Issues"
              value={dataQualityScores.resolvedIssues}
              icon={<CheckCircle2 className="h-4 w-4 text-brand-green" />}
              trend={{ value: 18.2, label: "vs last month" }}
              color="green"
            />
            
            <StatsCard 
              title="Healing Accuracy"
              value={`${dataHealingMetrics.healingAccuracy}%`}
              icon={<Database className="h-4 w-4 text-brand-blue" />}
              trend={{ value: 2.1, label: "vs last month" }}
              color="blue"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Auto-Healing Progress</span>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Powered</span>
                  </Badge>
                </CardTitle>
                <CardDescription>Real-time data healing operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {dataIssueTypes.map((issue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{issue.type}</span>
                      <span className="text-sm text-muted-foreground">{issue.count} issues</span>
                    </div>
                    <Progress 
                      value={issue.percentage} 
                      className={`h-2 ${index % 2 === 0 ? 'bg-muted' : 'bg-muted/50'}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Auto-Healing Activity</CardTitle>
                <CardDescription>Last 5 data quality issues resolved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataAutohealingActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status === "Healed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <CircleDashed className="h-4 w-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{activity.issueType}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDate(activity.timestamp)}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Issues</CardTitle>
              <CardDescription>All detected issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Issues content will go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Healing Activity Log</CardTitle>
              <CardDescription>Complete history of auto-healing operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Activity log content will go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources Health</CardTitle>
              <CardDescription>Monitoring and healing status for connected data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dataSourceHealth.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-4">
                      {getHealthStatusIcon(source.status)}
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{source.uptime}% uptime</span>
                          <span className="mx-1">•</span>
                          <span>{source.healingEvents} healing events</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      source.status === "Healthy" ? "outline" : 
                      source.status === "Degraded" ? "secondary" : "destructive"
                    }>
                      {source.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
