
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X, MessageSquareHeart, ArrowUp, ArrowDown, MessageCircleWarning } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

interface FeedbackItem {
  id: string;
  source: 'review' | 'email' | 'social';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  date: string;
}

// Example sentiment analysis function (simulated)
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'neutral' | 'negative', score: number } => {
  // In a real app, this would call a machine learning model like BERT or use Vader
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based analysis for demo purposes
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'awesome'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointed'];
  
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });
  
  // Normalize score between -1 and 1
  const maxPossible = Math.max(positiveWords.length, negativeWords.length);
  score = score / maxPossible;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 0.2) sentiment = 'positive';
  else if (score < -0.2) sentiment = 'negative';
  
  return { sentiment, score };
};

interface FeedbackTabProps {
  userId: string | undefined;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ userId }) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [source, setSource] = useState<'review' | 'email' | 'social'>('review');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    message: string;
    type: "success" | "error" | "loading" | null;
  }>({ message: "", type: null });
  
  // Feedback history state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('submit');
  
  // Example data for the chart - in a real app, this would be generated from feedbackItems
  const [sentimentTrends, setSentimentTrends] = useState<any[]>([]);
  
  // Generate random feedback data for demonstration
  useEffect(() => {
    if (userId) {
      // Simulate loading feedback data
      const mockFeedbackData: FeedbackItem[] = [];
      const sources: ('review' | 'email' | 'social')[] = ['review', 'email', 'social'];
      const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
      const mockContents = [
        "I love this product, it's amazing!",
        "The service was okay, nothing special.",
        "Disappointed with the quality, wouldn't recommend.",
        "Great customer support, very helpful.",
        "Average experience, could be better.",
        "Terrible response time, waited forever.",
        "Best purchase I've made this year!",
        "It's alright, does what it says.",
        "Completely unsatisfied with my experience."
      ];
      
      // Generate random feedback for demo
      const today = new Date();
      const trendData: Record<string, {positive: number, neutral: number, negative: number}> = {};
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        trendData[dateStr] = { positive: 0, neutral: 0, negative: 0 };
        
        // Generate 1-3 feedback items per day
        const numItems = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numItems; j++) {
          const source = sources[Math.floor(Math.random() * sources.length)];
          const contentIndex = Math.floor(Math.random() * mockContents.length);
          const content = mockContents[contentIndex];
          
          const { sentiment, score } = analyzeSentiment(content);
          
          mockFeedbackData.push({
            id: `feedback-${i}-${j}`,
            source,
            content,
            sentiment,
            score,
            date: dateStr
          });
          
          // Update trend data
          trendData[dateStr][sentiment]++;
        }
      }
      
      // Transform trend data for chart
      const chartData = Object.entries(trendData)
        .map(([date, counts]) => ({
          date,
          positive: counts.positive,
          neutral: counts.neutral,
          negative: counts.negative
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      setFeedbackItems(mockFeedbackData);
      setSentimentTrends(chartData);
    }
  }, [userId]);
  
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter some feedback.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionStatus({
      message: "Analyzing feedback...",
      type: "loading"
    });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze sentiment
      const { sentiment, score } = analyzeSentiment(feedback);
      
      // Create new feedback item
      const newFeedback: FeedbackItem = {
        id: `feedback-${Date.now()}`,
        source,
        content: feedback,
        sentiment,
        score,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Add to list
      setFeedbackItems(prev => [newFeedback, ...prev]);
      
      // Update trends data
      setSentimentTrends(prev => {
        const today = new Date().toISOString().split('T')[0];
        const updatedTrends = [...prev];
        
        // Find today's data or create it
        const todayIndex = updatedTrends.findIndex(item => item.date === today);
        if (todayIndex >= 0) {
          updatedTrends[todayIndex] = {
            ...updatedTrends[todayIndex],
            [sentiment]: (updatedTrends[todayIndex][sentiment] || 0) + 1
          };
        } else {
          updatedTrends.push({
            date: today,
            positive: sentiment === 'positive' ? 1 : 0,
            neutral: sentiment === 'neutral' ? 1 : 0,
            negative: sentiment === 'negative' ? 1 : 0
          });
        }
        
        return updatedTrends.sort((a, b) => a.date.localeCompare(b.date));
      });
      
      setSubmissionStatus({
        message: `Feedback submitted and classified as ${sentiment.toUpperCase()}`,
        type: "success"
      });
      
      toast({
        title: "Success",
        description: "Your feedback has been submitted and analyzed.",
      });
      
      // Reset form
      setFeedback("");
      setEmail("");
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSubmissionStatus({ message: "", type: null });
      }, 3000);
      
    } catch (error: any) {
      setSubmissionStatus({
        message: error.message || "Failed to submit feedback",
        type: "error"
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setSubmissionStatus({ message: "", type: null });
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'positive':
        return <ArrowUp className="text-green-500 h-4 w-4" />;
      case 'negative':
        return <ArrowDown className="text-red-500 h-4 w-4" />;
      default:
        return <MessageCircleWarning className="text-yellow-500 h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquareHeart className="h-5 w-5" />
        <h3 className="text-lg font-medium">Customer Feedback & Sentiment Analysis</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Feedback</CardTitle>
              <CardDescription>
                Share your thoughts, suggestions, or concerns
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {submissionStatus.type && (
                <Alert variant={submissionStatus.type === "error" ? "destructive" : "default"}>
                  {submissionStatus.type === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : submissionStatus.type === "success" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  <AlertTitle>Submission Status</AlertTitle>
                  <AlertDescription>{submissionStatus.message}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="source">Feedback Source</Label>
                <Select
                  value={source}
                  onValueChange={(value) => setSource(value as 'review' | 'email' | 'social')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Customer Review</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Feedback</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>
                View and analyze previous feedback
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {feedbackItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No feedback submitted yet
                  </div>
                ) : (
                  feedbackItems.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-sm font-medium">
                            {item.source}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getSentimentIcon(item.sentiment)}
                          <span className="text-xs capitalize">
                            {item.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends</CardTitle>
              <CardDescription>
                Analyze sentiment patterns over time
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="positive" 
                      stroke="#10b981" 
                      name="Positive" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="neutral" 
                      stroke="#f59e0b" 
                      name="Neutral" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="negative" 
                      stroke="#ef4444" 
                      name="Negative" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Sentiment Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md">
                    <div>
                      <span className="text-xs text-muted-foreground">Positive</span>
                      <p className="text-lg font-semibold">{feedbackItems.filter(item => item.sentiment === 'positive').length}</p>
                    </div>
                    <ArrowUp className="text-green-500 h-5 w-5" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
                    <div>
                      <span className="text-xs text-muted-foreground">Neutral</span>
                      <p className="text-lg font-semibold">{feedbackItems.filter(item => item.sentiment === 'neutral').length}</p>
                    </div>
                    <MessageCircleWarning className="text-yellow-500 h-5 w-5" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-md">
                    <div>
                      <span className="text-xs text-muted-foreground">Negative</span>
                      <p className="text-lg font-semibold">{feedbackItems.filter(item => item.sentiment === 'negative').length}</p>
                    </div>
                    <ArrowDown className="text-red-500 h-5 w-5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackTab;
