
import React, { useState } from "react";
import { processNLPQuery } from "@/lib/api";
import { Brain, Loader2, ChevronDown, ChevronUp, BarChart, LineChart, Users, LightbulbIcon, TrendingUp, Target, PercentIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const NLPQueryInput = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(true);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState([
    "Show revenue trends by quarter",
    "Identify top-performing marketing channels",
    "Analyze customer engagement metrics",
    "Compare campaign conversion rates",
    "Find growth opportunities in current market"
  ]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await processNLPQuery(query);
      setResult(response);
      setExpanded(true);
      
      // Add to query history if not already present
      if (!queryHistory.includes(query)) {
        setQueryHistory(prev => [query, ...prev].slice(0, 5));
      }
      
      if (response.type === "unknown") {
        toast({
          title: "Query Not Understood",
          description: response.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Found insights related to ${response.type}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process your query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Auto-submit the suggestion
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  const renderIcon = (type: string) => {
    switch(type) {
      case 'sales':
        return <BarChart className="h-4 w-4" />;
      case 'trend':
        return <LineChart className="h-4 w-4" />;
      case 'customers':
        return <Users className="h-4 w-4" />;
      case 'insights':
        return <LightbulbIcon className="h-4 w-4" />;
      case 'marketing':
        return <Target className="h-4 w-4" />;
      case 'performance':
        return <PercentIcon className="h-4 w-4" />;
      case 'growth':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const renderResult = () => {
    if (!result || result.type === "unknown" || result.type === "error") return null;

    return (
      <div className="space-y-2">
        <div 
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-primary/10 rounded-md"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {renderIcon(result.type)}
            <h4 className="text-sm font-medium">{result.summary || "Results"}</h4>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>

        {expanded && (
          <div className="p-3 bg-primary/5 rounded-lg overflow-hidden">
            {/* Different displays based on result type */}
            {result.type === "summary" && (
              <div className="text-center p-4">
                <div className="text-3xl font-bold">${result.data.total}</div>
                <div className="text-sm text-muted-foreground">{result.data.metric} ({result.data.count} transactions)</div>
              </div>
            )}
            
            {(result.type === "sales" || result.type === "trend" || result.type === "marketing" || result.type === "performance") && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(result.data[0] || {}).map((key) => (
                        <th key={key} className="text-left p-2">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((item: any, index: number) => (
                      <tr key={index} className="border-b last:border-0">
                        {Object.values(item).map((value: any, i: number) => (
                          <td key={i} className="p-2">
                            {typeof value === 'number' && Object.keys(item)[i].toLowerCase().includes('amount') 
                              ? `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {result.type === "customers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(result.data[0] || {}).map((key) => (
                        <th key={key} className="text-left p-2">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((customer: any, index: number) => (
                      <tr key={index} className="border-b last:border-0">
                        {Object.values(customer).map((value: any, i: number) => (
                          <td key={i} className="p-2">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {(result.type === "insights" || result.type === "growth") && (
              <div className="space-y-3">
                {result.data.map((insight: any, index: number) => (
                  <div key={index} className="p-3 bg-background rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{insight.title}</h5>
                      {insight.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.priority.toLowerCase() === "high" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {insight.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">
                        {insight.category}
                      </span>
                    )}
                    {insight.action && (
                      <p className="text-xs text-blue-600 mt-2">
                        Recommended action: {insight.action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <h3 className="font-medium">AI Query Assistant</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your data (e.g., 'Show me recent sales', 'User trends', 'Insights')"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ask"
              )}
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        {!isLoading && !result && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-primary/5 hover:bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          renderResult()
        )}

        {/* Query history */}
        {queryHistory.length > 0 && !isLoading && (
          <div className="pt-2">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Queries</h4>
            <div className="space-y-1">
              {queryHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(historyItem);
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSubmit(fakeEvent);
                  }}
                  className="text-xs w-full text-left truncate hover:bg-primary/5 p-1 rounded"
                >
                  {historyItem}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Try queries like: "Show marketing campaign performance", "Identify growth opportunities", "Customer retention trends"
          </p>
        </div>
      </div>
    </div>
  );
};
