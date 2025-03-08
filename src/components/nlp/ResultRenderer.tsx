
import React from "react";

interface ResultRendererProps {
  result: any;
  resultType: string;
}

export const ResultRenderer: React.FC<ResultRendererProps> = ({ result, resultType }) => {
  if (!result || resultType === "unknown" || resultType === "error") return null;

  switch (resultType) {
    case "summary":
      return (
        <div className="text-center p-4">
          <div className="text-3xl font-bold">${result.data.total}</div>
          <div className="text-sm text-muted-foreground">{result.data.metric} ({result.data.count} transactions)</div>
        </div>
      );
    
    case "sales":
    case "trend":
    case "marketing":
    case "performance":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {Object.keys(result.data[0] || {}).map((key) => (
                  <th key={key} className="text-left p-2">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.data.map((item: any, index: number) => (
                <tr key={index} className="border-b last:border-0">
                  {Object.values(item).map((value: any, i: number) => (
                    <td key={i} className="p-2">
                      {typeof value === 'number' && Object.keys(item)[i].toLowerCase().includes('amount') 
                        ? `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                        : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    case "customers":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {Object.keys(result.data[0] || {}).map((key) => (
                  <th key={key} className="text-left p-2">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.data.map((customer: any, index: number) => (
                <tr key={index} className="border-b last:border-0">
                  {Object.values(customer).map((value: any, i: number) => (
                    <td key={i} className="p-2">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    case "insights":
    case "growth":
      return (
        <div className="space-y-3">
          {result.data.map((insight: any, index: number) => (
            <div key={index} className="p-3 bg-background rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{insight.title}</h5>
                {insight.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.priority.toLowerCase() === "high" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {insight.priority}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              {insight.category && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">
                  {insight.category}
                </span>
              )}
              {insight.action && (
                <p className="text-xs text-blue-600 mt-2">
                  Recommended action: {insight.action}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    
    default:
      return null;
  }
};
