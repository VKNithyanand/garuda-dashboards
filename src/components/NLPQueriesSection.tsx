
import React from "react";
import { Brain } from "lucide-react";
import { QueryInput } from "./nlp/QueryInput";

export const NLPQueriesSection = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight">AI Query Assistance</h2>
      </div>
      <p className="text-muted-foreground">
        Ask business questions in natural language to get instant insights. Use the voice button for hands-free operation.
      </p>
      
      <QueryInput />
    </div>
  );
};
