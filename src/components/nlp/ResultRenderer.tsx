
import React from "react";
import { BarChart, DownloadIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultRendererProps {
  result: any;
  resultType: string;
}

export const ResultRenderer: React.FC<ResultRendererProps> = ({ result, resultType }) => {
  if (!result || resultType === "unknown" || resultType === "error") return null;

  const generatePdf = (story: any) => {
    // Create a simple PDF format string
    let pdfContent = `${story.title}\n\n`;
    pdfContent += `${story.summary}\n\n`;
    
    story.highlights.forEach((highlight: any) => {
      pdfContent += `${highlight.title}:\n${highlight.content}\n\n`;
    });
    
    story.insights.forEach((insight: any) => {
      pdfContent += `${insight.title}:\n${insight.content}\n\n`;
    });
    
    story.recommendations.forEach((rec: any) => {
      pdfContent += `${rec.title}:\n${rec.content}\n\n`;
    });
    
    pdfContent += `Conclusion:\n${story.conclusion}`;
    
    // Create a blob and download it
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${story.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    
    case "story":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{result.data.title}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => generatePdf(result.data)}
            >
              <DownloadIcon className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          <p className="text-sm font-medium bg-primary/5 p-3 rounded-md">{result.data.summary}</p>
          
          <div className="space-y-3">
            {result.data.highlights.map((highlight: any, index: number) => (
              <div key={`highlight-${index}`} className="border-l-4 border-blue-500 pl-3 py-1">
                <h4 className="text-sm font-medium">{highlight.title}</h4>
                <p className="text-sm text-muted-foreground">{highlight.content}</p>
              </div>
            ))}
            
            {result.data.insights.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                <div className="space-y-2">
                  {result.data.insights.map((insight: any, index: number) => (
                    <div key={`insight-${index}`} className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <BarChart className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm">{insight.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              <div className="space-y-2">
                {result.data.recommendations.map((rec: any, index: number) => (
                  <div key={`rec-${index}`} className="bg-primary/5 p-3 rounded-md">
                    <h5 className="text-sm font-medium">{rec.title}</h5>
                    <p className="text-sm text-muted-foreground">{rec.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium">Conclusion</h4>
              <p className="text-sm text-muted-foreground">{result.data.conclusion}</p>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};
