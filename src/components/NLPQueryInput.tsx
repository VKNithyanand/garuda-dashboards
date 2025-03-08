
import { useState } from "react";
import { Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryInput } from "./nlp/QueryInput";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";

export const NLPQueryInput = () => {
  const { hasUploadedData } = useData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Brain className="h-4 w-4" />
        <span className="hidden md:inline">Ask AI</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Query Assistant
            </DialogTitle>
            <DialogDescription>
              Ask business questions in natural language to get instant insights
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-2">
            <QueryInput />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
