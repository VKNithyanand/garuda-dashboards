
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import speechRecognition, { RecognitionStatus } from '@/utils/speechRecognition';
import textToSpeech from '@/utils/textToSpeech';
import { processNLPQuery } from '@/lib/api';
import { useData } from '@/contexts/DataContext';

interface VoiceAssistantProps {
  onQuerySubmit?: (query: string) => void;
}

// Define response type interfaces for proper type checking
interface BaseSummaryData {
  type: string;
  summary?: string;
}

interface SummaryResponseData extends BaseSummaryData {
  type: "summary";
  data: {
    total: string;
    count: number;
    currency: string;
    metric: string;
  };
}

interface SalesResponseData extends BaseSummaryData {
  type: "sales";
  data: Array<{
    date: string;
    amount: number;
    product?: string;
    category?: string;
  }>;
}

interface TrendResponseData extends BaseSummaryData {
  type: "trend";
  data: Array<{
    period: string;
    value: number;
  }>;
}

interface CustomersResponseData extends BaseSummaryData {
  type: "customers";
  data: Array<{
    name: string;
    email: string;
    joined?: string;
    lastActive?: string;
  }>;
}

interface InsightsResponseData extends BaseSummaryData {
  type: "insights" | "growth";
  data: Array<{
    title: string;
    description: string;
    category?: string;
    priority?: string;
    action?: string;
  }>;
}

interface StoryResponseData extends BaseSummaryData {
  type: "story";
  data: {
    title: string;
    summary: string;
    highlights: Array<{title: string; content: string}>;
    insights: Array<{title: string; content: string}>;
    recommendations: Array<{title: string; content: string}>;
    conclusion: string;
  };
}

interface ErrorResponseData extends BaseSummaryData {
  type: "error" | "unknown";
  message: string;
}

type NLPResponseData = SummaryResponseData | SalesResponseData | TrendResponseData | 
                       CustomersResponseData | InsightsResponseData | StoryResponseData | 
                       ErrorResponseData;

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onQuerySubmit }) => {
  const { toast } = useToast();
  const { hasUploadedData } = useData();
  const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('inactive');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isSupported = speechRecognition.checkSupport() && textToSpeech.isAvailable();
  
  useEffect(() => {
    // Check if the browser supports both speech recognition and speech synthesis
    if (!isSupported) {
      toast({
        title: "Voice Features Unavailable",
        description: "Your browser doesn't support voice recognition or speech synthesis. Try using Chrome for the best experience.",
        variant: "destructive",
      });
    }
    
    // Close the assistant panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Ensure speech recognition and speech synthesis are stopped when unmounting
      speechRecognition.stop();
      textToSpeech.stop();
    };
  }, [isSupported, toast]);

  const handleVoiceRecognition = () => {
    if (recognitionStatus === 'listening') {
      speechRecognition.stop();
      return;
    }
    
    if (!hasUploadedData) {
      toast({
        title: "No Data Available",
        description: "Please upload your datasets first to use the Voice Assistant.",
        variant: "destructive",
      });
      return;
    }
    
    speechRecognition.start(
      (text) => {
        setTranscript(text);
        processVoiceCommand(text);
      },
      (status) => setRecognitionStatus(status)
    );
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Handle specific system commands
      if (command.toLowerCase().includes('stop speaking')) {
        textToSpeech.stop();
        respondToUser("I've stopped speaking.");
        setIsProcessing(false);
        return;
      }
      
      // Process the query
      const response = await processNLPQuery(command) as NLPResponseData;
      
      // Pass the query to the parent component if provided
      if (onQuerySubmit) {
        onQuerySubmit(command);
      }
      
      // Generate a spoken response based on the query result
      let spokenResponse = "";
      
      if (response.type === "unknown") {
        spokenResponse = "I didn't understand that query. Could you please try again?";
      } else if (response.type === "error") {
        spokenResponse = "I encountered an error processing your request. Please try again.";
      } else {
        // Generate a spoken response based on the result type and data
        switch (response.type) {
          case "summary":
            spokenResponse = `The total ${response.data.metric.toLowerCase()} is $${response.data.total} from ${response.data.count} transactions.`;
            break;
          case "sales":
            spokenResponse = `I found ${response.data.length} sales records. `;
            if (response.data.length > 0) {
              const total = response.data.reduce((sum, item) => sum + (item.amount || 0), 0);
              spokenResponse += `The total amount is $${total.toFixed(2)}.`;
            }
            break;
          case "trend":
            spokenResponse = response.summary || "I've analyzed the trends in your data.";
            break;
          case "customers":
            spokenResponse = `I found ${response.data.length} customer records.`;
            break;
          case "insights":
          case "growth":
            spokenResponse = response.summary || "I've identified some key insights from your data.";
            if (response.data.length > 0) {
              spokenResponse += " Here are the top insights: ";
              response.data.slice(0, 3).forEach((insight, index) => {
                spokenResponse += `${index + 1}: ${insight.title}. ${insight.description} `;
              });
            }
            break;
          case "story":
            spokenResponse = `${response.data.title}. ${response.data.summary}`;
            break;
          default:
            spokenResponse = "I found some data that might interest you. Check the dashboard for details.";
        }
      }
      
      // Speak the response if speech is enabled
      respondToUser(spokenResponse);
      
    } catch (error) {
      console.error("Error processing voice command:", error);
      respondToUser("I'm sorry, I encountered an error processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const respondToUser = (message: string) => {
    setAssistantMessage(message);
    
    if (isSpeechEnabled) {
      textToSpeech.speak(message);
    }
  };
  
  const toggleSpeech = () => {
    if (textToSpeech.isSpeakingNow()) {
      textToSpeech.stop();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };
  
  if (!isSupported) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 w-80 bg-background rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="p-4 bg-gradient-blue text-white">
            <h3 className="font-medium">Voice Assistant</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {transcript && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">You said:</p>
                <p className="text-sm">{transcript}</p>
              </div>
            )}
            
            {assistantMessage && (
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm font-medium">Assistant:</p>
                <p className="text-sm">{assistantMessage}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeech}
                className={isSpeechEnabled ? "text-primary" : "text-muted-foreground"}
              >
                {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={handleVoiceRecognition}
                disabled={recognitionStatus === 'processing' || isProcessing}
                variant={recognitionStatus === 'listening' ? "destructive" : "default"}
                size="sm"
                className="gap-2"
              >
                {recognitionStatus === 'listening' ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Listening
                  </>
                ) : recognitionStatus === 'processing' || isProcessing ? (
                  <>
                    <span className="animate-pulse">Processing...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <Info className="h-3 w-3" />
              <span>Try: "Show me recent sales" or "What are the key insights?"</span>
            </div>
          </div>
        </div>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`rounded-full h-12 w-12 p-0 shadow-lg ${recognitionStatus === 'listening' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
      >
        {recognitionStatus === 'listening' ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};
