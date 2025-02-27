
import { supabase } from "@/integrations/supabase/client";

// Generate random data for demo purposes
const getRandomValue = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

interface DataResponse {
  id: string;
  value: number;
  timestamp: string;
  category: string;
}

// Simulated real-time data generation
export const generateRealtimeData = (): DataResponse => {
  const categories = ["Sales", "Revenue", "Users", "Traffic"];
  
  // Generate a random piece of data
  const randomData = {
    id: Math.random().toString(36).substr(2, 9),
    value: getRandomValue(1000, 10000),
    timestamp: new Date().toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)],
  };
  
  // In a real application, you might want to add this data to Supabase
  // This is commented out to avoid creating too much test data
  /*
  supabase
    .from('analytics_events')
    .insert([randomData])
    .then(({ error }) => {
      if (error) console.error('Error logging analytics event:', error);
    });
  */
  
  return randomData;
};

// Simulated NLP query processing
export const processNLPQuery = async (query: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Extract keywords from the query
  const keywords = query.toLowerCase().split(" ");
  
  try {
    // Fetch real data based on the query
    if (keywords.includes("sales") || keywords.includes("revenue")) {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Format the data
      return {
        type: "sales",
        data: data.map(sale => ({
          date: new Date(sale.transaction_date).toLocaleDateString(),
          amount: Number(sale.amount),
          product: sale.product_name,
        })),
      };
    }

    if (keywords.includes("customers") || keywords.includes("users")) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return {
        type: "customers",
        data: data.map(customer => ({
          name: customer.name,
          email: customer.email,
          joined: new Date(customer.created_at).toLocaleDateString(),
        })),
      };
    }
    
    // Default response for unrecognized queries
    return {
      type: "unknown",
      message: "I couldn't understand your query. Try asking about sales, revenue, customers, or users.",
    };
  } catch (error) {
    console.error("Error processing NLP query:", error);
    return {
      type: "error",
      message: "An error occurred while processing your query. Please try again.",
    };
  }
};
