
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define a type for the valid table names in our Supabase database
type ValidTableName = 'sales' | 'customers' | 'insights';

interface CsvUploaderProps {
  onDataLoaded: (data: any[]) => void;
  type: 'sales' | 'customers' | 'insights';
}

export const CsvUploader = ({ onDataLoaded, type }: CsvUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error("No data found in CSV file");
      }

      // Process and save to Supabase
      const processedData = await saveToSupabase(data);
      
      // Update parent component with the processed data
      onDataLoaded(processedData);
      
      toast({
        title: "CSV File Uploaded",
        description: `Successfully processed ${data.length} records.`,
      });
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      setError(error.message || "Failed to process CSV file");
      toast({
        title: "Error Processing File",
        description: error.message || "Failed to process CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    if (lines.length <= 1) {
      throw new Error("CSV file is empty or has only headers");
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      if (values.length !== headers.length) {
        console.warn(`Line ${i} has ${values.length} values, expected ${headers.length}`);
        continue;
      }

      const entry: Record<string, any> = {};
      headers.forEach((header, index) => {
        // Try to convert numeric values
        const value = values[index];
        entry[header] = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
      });

      result.push(entry);
    }

    return result;
  };

  const saveToSupabase = async (data: any[]): Promise<any[]> => {
    try {
      // Use type directly as the table name since it's already properly typed
      const table: ValidTableName = type;
      const processedData = [];

      switch (table) {
        case 'sales':
          for (const item of data) {
            processedData.push({
              product_name: item.product || item.product_name || "Unknown Product",
              category: item.category || "Uncategorized",
              amount: item.amount || item.value || 0,
              transaction_date: item.date || item.transaction_date || new Date().toISOString(),
            });
          }
          break;
          
        case 'customers':
          for (const item of data) {
            processedData.push({
              name: item.name || item.customer_name || "Unknown Customer",
              email: item.email || `${item.name?.toLowerCase().replace(/\s/g, '.')}@example.com` || "unknown@example.com",
            });
          }
          break;
          
        case 'insights':
          for (const item of data) {
            processedData.push({
              title: item.title || "Untitled Insight",
              description: item.description || item.details || "No description",
              category: item.category || "Uncategorized",
              priority: item.priority || "Medium",
            });
          }
          break;
      }

      if (processedData.length > 0) {
        console.log(`Inserting ${processedData.length} records into ${table}:`, processedData);
        
        const { data: insertedData, error } = await supabase
          .from(table)
          .insert(processedData)
          .select();
          
        if (error) {
          console.error(`Error from Supabase: ${error.code} - ${error.message}`, error.details);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log(`Successfully inserted data:`, insertedData);
        return processedData;
      }
      
      return processedData;
    } catch (error) {
      console.error(`Error saving to ${type} table:`, error);
      throw new Error(`Failed to save data to database: ${(error as Error).message}`);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="text-sm font-medium mb-1">Upload CSV File</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              ) : error ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Check className="h-5 w-5 text-green-500" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
