
import { QueryInput } from "./nlp/QueryInput";
import { useData } from "@/contexts/DataContext";

export const NLPQueryInput = () => {
  const { hasUploadedData } = useData();
  return <QueryInput />;
};
