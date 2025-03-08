
import React, { useState } from "react";
import { processNLPQuery } from "@/lib/api";
import { Brain, Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { QuerySuggestions } from "./QuerySuggestions";
import { QueryHistory } from "./QueryHistory";
import { QueryResults } from "./QueryResults";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";

export const QueryInput = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(true);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const { hasUploadedData } = useData();
  const [suggestions] = useState([
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
    
    if (!hasUploadedData) {
      toast({
        title: "No Data Available",
        description: "Please upload your datasets first to use the AI Query Assistant.",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="dashboard-card">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <h3 className="font-medium">AI Query Assistant</h3>
        </div>
        
        {!hasUploadedData ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4 text-center">Upload your datasets first to start using the AI Query Assistant.</p>
          </div>
        ) : (
          <>
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
              <QuerySuggestions 
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}

            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <QueryResults 
                result={result} 
                expanded={expanded}
                setExpanded={setExpanded}
              />
            )}

            {/* Query history */}
            {queryHistory.length > 0 && !isLoading && (
              <QueryHistory 
                queryHistory={queryHistory}
                onHistoryItemClick={(historyItem) => {
                  setQuery(historyItem);
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleSubmit(fakeEvent);
                }}
              />
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Try queries like: "Show marketing campaign performance", "Identify growth opportunities", "Customer retention trends"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
