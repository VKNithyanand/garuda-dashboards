
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NLPQueriesSection } from "@/components/NLPQueriesSection";
import { useInsights } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Loader2, 
  Filter, 
  Search,
  Check,
  X,
  BookmarkIcon,
  ChevronDown,
  Share2,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { QueryResults } from "@/components/nlp/QueryResults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompetitorBenchmarking } from "@/components/CompetitorBenchmarking";

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  created_at: string;
}

const Insights = () => {
  const { toast } = useToast();
  const { salesData, customersData, insightsData } = useData();
  const { data: fetchedInsights = [], isLoading, error, refetch } = useInsights();
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [showInsightDetail, setShowInsightDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    priority: "all",
  });
  const [bookmarkedInsights, setBookmarkedInsights] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [businessStory, setBusinessStory] = useState<any>(null);
  const [storyExpanded, setStoryExpanded] = useState(true);
  
  const effectiveInsightsData = insightsData.length > 0 ? insightsData : fetchedInsights;
  
  if (error) {
    toast({
      title: "Error loading insights",
      description: error.message,
      variant: "destructive",
    });
  }

  const filteredInsights = effectiveInsightsData.filter((insight: Insight) => {
    const matchesSearch = searchTerm === "" || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === "all" || 
      insight.category.toLowerCase() === filters.category.toLowerCase();
      
    const matchesPriority = filters.priority === "all" || 
      insight.priority.toLowerCase() === filters.priority.toLowerCase();
      
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = ["all", ...Array.from(new Set(effectiveInsightsData.map((insight: Insight) => insight.category)))];
  const priorities = ["all", ...Array.from(new Set(effectiveInsightsData.map((insight: Insight) => insight.priority)))];

  const implementInsight = async (insightId: string) => {
    setIsImplementing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Insight Implemented",
        description: "The recommended action has been successfully implemented.",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to implement insight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImplementing(false);
    }
  };

  const toggleBookmark = (insightId: string) => {
    if (bookmarkedInsights.includes(insightId)) {
      setBookmarkedInsights(bookmarkedInsights.filter(id => id !== insightId));
      toast({
        title: "Bookmark Removed",
        description: "Insight has been removed from your bookmarks",
      });
    } else {
      setBookmarkedInsights([...bookmarkedInsights, insightId]);
      toast({
        title: "Insight Bookmarked",
        description: "Insight has been added to your bookmarks",
      });
    }
  };

  const shareInsight = (insight: Insight) => {
    navigator.clipboard.writeText(`${insight.title}: ${insight.description}`);
    toast({
      title: "Insight Copied to Clipboard",
      description: "You can now paste the insight text to share it.",
    });
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      priority: "all",
    });
    setSearchTerm("");
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'growth':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">High</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Medium</span>;
      case 'low':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const generateBusinessStory = async () => {
    setIsGeneratingStory(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-business-story", {
        body: {
          salesData,
          customersData,
          insightsData: effectiveInsightsData,
          timeframe: "last-quarter"
        }
      });
      
      if (error) throw error;
      
      setBusinessStory({
        type: "story",
        summary: "AI-Generated Business Story",
        data: data.story
      });
      
      toast({
        title: "Business Story Generated",
        description: "Your personalized business report is ready to view or download.",
      });
    } catch (error: any) {
      console.error("Error generating business story:", error);
      toast({
        title: "Failed to Generate Story",
        description: error.message || "There was an error generating your business story.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const clearBusinessStory = () => {
    setBusinessStory(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Data-driven insights to help you make better business decisions
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Business Insights</h1>
            <p className="text-muted-foreground">AI-powered analysis and recommendations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={generateBusinessStory}
              disabled={isGeneratingStory || (!salesData.length && !fetchedInsights.length)}
              className="flex items-center gap-2"
            >
              {isGeneratingStory ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Business Story
                </>
              )}
            </Button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        {businessStory && (
          <div className="dashboard-card">
            <QueryResults 
              result={businessStory}
              expanded={storyExpanded}
              setExpanded={setStoryExpanded}
              clearResults={clearBusinessStory}
            />
          </div>
        )}

        <div className="dashboard-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority === "all" ? "All Priorities" : priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground mr-4"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          
          {(filters.category !== "all" || filters.priority !== "all" || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category !== "all" && (
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                  Category: {filters.category}
                  <button 
                    onClick={() => setFilters({...filters, category: "all"})}
                    className="ml-1 hover:text-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.priority !== "all" && (
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                  Priority: {filters.priority}
                  <button 
                    onClick={() => setFilters({...filters, priority: "all"})}
                    className="ml-1 hover:text-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {searchTerm && (
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {(filters.category !== "all" || filters.priority !== "all" || searchTerm) && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {showInsightDetail && selectedInsight ? (
              <div className="dashboard-card">
                <div className="flex justify-between mb-6">
                  <button 
                    onClick={() => {
                      setShowInsightDetail(false);
                      setSelectedInsight(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to insights
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleBookmark(selectedInsight.id)}
                      className="rounded-full p-2 hover:bg-accent"
                    >
                      <BookmarkIcon 
                        className={`h-4 w-4 ${bookmarkedInsights.includes(selectedInsight.id) ? "fill-primary text-primary" : ""}`}
                      />
                    </button>
                    <button 
                      onClick={() => shareInsight(selectedInsight)}
                      className="rounded-full p-2 hover:bg-accent"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(selectedInsight.category)}
                      <h2 className="text-xl font-medium">{selectedInsight.title}</h2>
                    </div>
                    {getPriorityBadge(selectedInsight.priority)}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-muted-foreground">{selectedInsight.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Impact Analysis</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Potential revenue increase
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Improved customer satisfaction
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Enhanced operational efficiency
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Implementation Complexity</h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Effort:</span>
                          <span className="text-sm">Medium</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Time required:</span>
                          <span className="text-sm">1-2 weeks</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Resources needed:</span>
                          <span className="text-sm">2-3 team members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                    onClick={() => implementInsight(selectedInsight.id)}
                    disabled={isImplementing}
                  >
                    {isImplementing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Implementing...
                      </>
                    ) : (
                      "Implement This Insight"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="dashboard-card">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Key Insights</h2>
                  </div>
                  
                  {filteredInsights.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No insights match your current filters</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-sm text-primary hover:text-primary/80"
                      >
                        Clear filters to see all insights
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInsights.map((insight: Insight) => (
                        <div
                          key={insight.id}
                          className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedInsight(insight);
                            setShowInsightDetail(true);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(insight.category)}
                              <h3 className="font-medium">{insight.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(insight.priority)}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(insight.id);
                                }}
                                className="p-1 hover:bg-background rounded-md"
                              >
                                <BookmarkIcon 
                                  className={`h-4 w-4 ${bookmarkedInsights.includes(insight.id) ? "fill-primary text-primary" : ""}`}
                                />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Category: {insight.category} • Created: {new Date(insight.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="dashboard-card">
                    <h3 className="font-medium mb-4">Action Items</h3>
                    <div className="space-y-4">
                      {filteredInsights.length > 0 
                        ? filteredInsights.slice(0, 3).map((insight: Insight, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedInsight(insight);
                                setShowInsightDetail(true);
                              }}
                            >
                              {getCategoryIcon(insight.category)}
                              <span className="text-sm">{insight.title}</span>
                            </div>
                          ))
                        : ["Review inventory levels", "Optimize pricing strategy", "Launch marketing campaign"].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                            >
                              <Lightbulb className="h-4 w-4" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))
                      }
                    </div>
                  </div>

                  <div className="dashboard-card">
                    <h3 className="font-medium mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Customer Satisfaction", value: "92%" },
                        { label: "Revenue Growth", value: "+15%" },
                        { label: "Market Share", value: "28%" },
                      ].map((metric, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                        >
                          <span className="text-sm">{metric.label}</span>
                          <span className="text-sm font-medium">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <section className="mt-12 pt-8 border-t">
        <NLPQueriesSection />
      </section>

      <CompetitorBenchmarking />
    </DashboardLayout>
  );
};

export default Insights;
