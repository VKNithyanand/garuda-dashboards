
import React from "react";

interface QueryHistoryProps {
  queryHistory: string[];
  onHistoryItemClick: (historyItem: string) => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  queryHistory,
  onHistoryItemClick,
}) => {
  return (
    <div className="pt-2">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Queries</h4>
      <div className="space-y-1">
        {queryHistory.map((historyItem, index) => (
          <button
            key={index}
            onClick={() => onHistoryItemClick(historyItem)}
            className="text-xs w-full text-left truncate hover:bg-primary/5 p-1 rounded"
          >
            {historyItem}
          </button>
        ))}
      </div>
    </div>
  );
};
