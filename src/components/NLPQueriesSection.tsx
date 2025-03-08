
import React, { useState } from "react";
import { Brain } from "lucide-react";
import { QueryInput } from "./nlp/QueryInput";
import { Button } from "./ui/button";

export const NLPQueriesSection = () => {
  const [showExamples, setShowExamples] = useState(false);
  const exampleQueries = [
    "Show revenue trends by quarter",
    "What were our top-selling products last month?",
    "Compare this year's performance to last year",
    "Show customer retention rate over time",
    "Identify our highest growth markets",
    "Analyze marketing campaign effectiveness"
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight">Natural Language Queries</h2>
      </div>
      <p className="text-muted-foreground">
        Ask business questions in natural language to get instant insights. Use the voice button for hands-free operation.
      </p>
      
      <Button 
        variant="outline" 
        onClick={() => setShowExamples(!showExamples)}
        className="mb-2"
      >
        {showExamples ? "Hide Examples" : "Show Example Queries"}
      </Button>
      
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
      
      <QueryInput />
    </div>
  );
};
