
import React from "react";

interface QuerySuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="text-xs bg-primary/5 hover:bg-primary/10 text-primary px-2 py-1 rounded-full"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
