
interface DataResponse {
  id: string;
  value: number;
  timestamp: string;
  category: string;
}

// Simulated real-time data generation
export const generateRealtimeData = (): DataResponse => {
  const categories = ["Sales", "Revenue", "Users", "Traffic"];
  return {
    id: Math.random().toString(36).substr(2, 9),
    value: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)],
  };
};

// Simulated NLP query processing
export const processNLPQuery = async (query: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const keywords = query.toLowerCase().split(" ");
  
  if (keywords.includes("sales")) {
    return {
      type: "sales",
      data: Array.from({ length: 5 }, () => ({
        date: new Date().toISOString(),
        amount: Math.floor(Math.random() * 10000),
      })),
    };
  }

  if (keywords.includes("revenue")) {
    return {
      type: "revenue",
      data: Array.from({ length: 7 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        value: Math.floor(Math.random() * 50000),
      })),
    };
  }

  return {
    type: "unknown",
    message: "I couldn't understand your query. Try asking about sales or revenue.",
  };
};
