
import React, { useState, useEffect } from "react";
import { processNLPQuery } from "@/lib/api";
import { Brain, Loader2, RefreshCw, Mic, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { QuerySuggestions } from "./QuerySuggestions";
import { QueryHistory } from "./QueryHistory";
import { QueryResults } from "./QueryResults";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import speechRecognition, { RecognitionStatus } from "@/utils/speechRecognition";
import textToSpeech from "@/utils/textToSpeech";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const QueryInput = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(true);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const { hasUploadedData } = useData();
  const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('inactive');
  const [showExamples, setShowExamples] = useState(false);
  const [exampleQueries] = useState([
    "Show revenue trends by quarter",
    "What were our top-selling products last month?",
    "Compare this year's performance to last year",
    "Show customer retention rate over time",
    "Identify our highest growth markets",
    "Analyze marketing campaign effectiveness"
  ]);
  const { toast } = useToast();

  const isVoiceSupported = speechRecognition.checkSupport();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        
        if (response.summary) {
          textToSpeech.speak(response.summary);
        }
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
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  const clearResults = () => {
    setResult(null);
    setQuery("");
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
    toast({
      title: "History Cleared",
      description: "Your query history has been cleared.",
    });
  };
  
  const startVoiceRecognition = () => {
    if (recognitionStatus === 'listening') {
      speechRecognition.stop();
      return;
    }
    
    if (!hasUploadedData) {
      toast({
        title: "No Data Available",
        description: "Please upload your datasets first to use voice recognition.",
        variant: "destructive",
      });
      return;
    }
    
    speechRecognition.start(
      (text) => {
        setQuery(text);
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      },
      (status) => setRecognitionStatus(status)
    );
  };
  
  useEffect(() => {
    return () => {
      speechRecognition.stop();
    };
  }, []);

  return (
    <div className="dashboard-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <h3 className="font-medium">AI Query Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowExamples(!showExamples)}
              size="sm"
              className="text-xs"
            >
              {showExamples ? "Hide Examples" : "Show Examples"}
            </Button>
            {queryHistory.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearHistory}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear History
              </Button>
            )}
          </div>
        </div>
        
        {showExamples && (
          <div className="grid gap-2 mb-4 p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium">Try these example queries:</h3>
            <ul className="space-y-2">
              {exampleQueries.map((query, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>{query}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your data..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Example Queries</h4>
                        <div className="flex flex-col gap-2">
                          {exampleQueries.map((example, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setQuery(example);
                                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                                handleSubmit(fakeEvent);
                              }}
                              className="text-sm text-left px-2 py-1 hover:bg-accent rounded-md"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {speechRecognition.checkSupport() && (
                    <button
                      type="button"
                      onClick={startVoiceRecognition}
                      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-7 w-7 ${
                        recognitionStatus === 'listening' 
                          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Ask"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {!isLoading && !result && !showExamples && (
              <QuerySuggestions 
                suggestions={exampleQueries.slice(0, 5)}
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
                clearResults={clearResults}
              />
            )}

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
