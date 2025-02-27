
import React, { useState } from "react";
import { processNLPQuery } from "@/lib/api";
import { Brain, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const NLPQueryInput = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await processNLPQuery(query);
      setResult(response);
      
      if (response.type === "unknown") {
        toast({
          title: "Query Not Understood",
          description: response.message,
          variant: "destructive",
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
              placeholder="Ask about your data (e.g., 'Show me recent sales')"
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

        {result && result.type !== "unknown" && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Results</h4>
            <pre className="text-sm text-muted-foreground overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
