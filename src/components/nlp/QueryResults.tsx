
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ResultRenderer } from "./ResultRenderer";
import { ResultIcon } from "./ResultIcon";

interface QueryResultsProps {
  result: any;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  result,
  expanded,
  setExpanded
}) => {
  if (!result || result.type === "unknown" || result.type === "error") return null;

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-primary/10 rounded-md"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <ResultIcon type={result.type} />
          <h4 className="text-sm font-medium">{result.summary || "Results"}</h4>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
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
