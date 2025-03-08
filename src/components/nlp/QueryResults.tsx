
import React from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { ResultRenderer } from "./ResultRenderer";
import { ResultIcon } from "./ResultIcon";
import { Button } from "@/components/ui/button";

interface QueryResultsProps {
  result: any;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  clearResults?: () => void;
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  result,
  expanded,
  setExpanded,
  clearResults
}) => {
  if (!result || result.type === "unknown" || result.type === "error") return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-primary/10 rounded-md flex-grow"
          onClick={() => setExpanded(!expanded)}
        >
          <ResultIcon type={result.type} />
          <h4 className="text-sm font-medium">{result.summary || "Results"}</h4>
          {expanded ? (
            <ChevronUp className="h-4 w-4 ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-auto" />
          )}
        </div>
        {clearResults && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              clearResults();
            }}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="p-3 bg-primary/5 rounded-lg overflow-hidden">
          <ResultRenderer result={result} resultType={result.type} />
        </div>
      )}
    </div>
  );
};
