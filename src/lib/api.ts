
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

// Enhanced NLP query processing with more intelligence
export const processNLPQuery = async (query: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert query to lowercase for better matching
  const queryLower = query.toLowerCase();
  
  try {
    // Fetch real data based on the query
    // Sales and revenue queries
    if (queryLower.includes("sales") || queryLower.includes("revenue")) {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Time-based filtering
      if (queryLower.includes("recent") || queryLower.includes("latest")) {
        return {
          type: "sales",
          data: data.slice(0, 5).map(sale => ({
            date: new Date(sale.transaction_date).toLocaleDateString(),
            amount: Number(sale.amount),
            product: sale.product_name,
            category: sale.category
          })),
          summary: `Found ${data.slice(0, 5).length} recent sales transactions.`
        };
      }
      
      // Category filtering
      for (const category of ["electronics", "accessories", "office equipment"]) {
        if (queryLower.includes(category)) {
          const filtered = data.filter(sale => 
            sale.category.toLowerCase() === category
          );
          
          return {
            type: "sales",
            data: filtered.map(sale => ({
              date: new Date(sale.transaction_date).toLocaleDateString(),
              amount: Number(sale.amount),
              product: sale.product_name,
            })),
            summary: `Found ${filtered.length} sales in the ${category} category.`
          };
        }
      }
      
      // Product filtering
      for (const product of ["laptop", "smartphone", "headphones", "monitor"]) {
        if (queryLower.includes(product)) {
          const filtered = data.filter(sale => 
            sale.product_name.toLowerCase().includes(product)
          );
          
          return {
            type: "sales",
            data: filtered.map(sale => ({
              date: new Date(sale.transaction_date).toLocaleDateString(),
              amount: Number(sale.amount),
              product: sale.product_name,
            })),
            summary: `Found ${filtered.length} sales of ${product}s.`
          };
        }
      }
      
      // Calculate total sales if requested
      if (queryLower.includes("total") || queryLower.includes("sum")) {
        const total = data.reduce((sum, sale) => sum + Number(sale.amount), 0);
        
        return {
          type: "summary",
          data: {
            total: total.toFixed(2),
            count: data.length,
            currency: "USD",
            metric: queryLower.includes("revenue") ? "Revenue" : "Sales"
          },
          summary: `Total ${queryLower.includes("revenue") ? "revenue" : "sales"}: $${total.toFixed(2)}`
        };
      }
      
      // Default sales response with aggregated data
      const salesByDay: Record<string, number> = {};
      data.forEach(sale => {
        const date = new Date(sale.transaction_date).toLocaleDateString();
        salesByDay[date] = (salesByDay[date] || 0) + Number(sale.amount);
      });
      
      return {
        type: "sales",
        data: Object.entries(salesByDay).map(([date, amount]) => ({
          date,
          amount,
        })),
        summary: `Found sales data for ${Object.keys(salesByDay).length} days.`
      };
    }

    // Customer/user queries
    if (queryLower.includes("customer") || queryLower.includes("user")) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Recently added customers
      if (queryLower.includes("new") || queryLower.includes("recent")) {
        return {
          type: "customers",
          data: data.slice(0, 5).map(customer => ({
            name: customer.name,
            email: customer.email,
            joined: new Date(customer.created_at).toLocaleDateString(),
          })),
          summary: `Found ${data.slice(0, 5).length} recently added customers.`
        };
      }
      
      // Active user analysis
      if (queryLower.includes("active")) {
        const activeUsers = data.filter(user => user.last_active && 
          (new Date().getTime() - new Date(user.last_active).getTime()) < 1000 * 60 * 60 * 24 * 7
        );
        
        return {
          type: "customers",
          data: activeUsers.map(user => ({
            name: user.name,
            email: user.email,
            lastActive: user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never',
          })),
          summary: `Found ${activeUsers.length} active users in the last 7 days.`
        };
      }
      
      // Default customer/user response
      return {
        type: "customers",
        data: data.map(customer => ({
          name: customer.name,
          email: customer.email,
          joined: new Date(customer.created_at).toLocaleDateString(),
        })),
        summary: `Found ${data.length} customers.`
      };
    }
    
    // Aggregate and trend queries
    if (queryLower.includes("trend") || queryLower.includes("growth") || queryLower.includes("compare")) {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('transaction_date', { ascending: true });
        
      if (error) throw error;
      
      // Process data to get monthly trends
      const monthlyData: Record<string, number> = {};
      
      data.forEach(sale => {
        const date = new Date(sale.transaction_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(sale.amount);
      });
      
      const sortedMonths = Object.keys(monthlyData).sort();
      
      if (sortedMonths.length >= 2) {
        const lastMonth = sortedMonths[sortedMonths.length - 1];
        const previousMonth = sortedMonths[sortedMonths.length - 2];
        
        const growth = ((monthlyData[lastMonth] - monthlyData[previousMonth]) / monthlyData[previousMonth]) * 100;
        
        return {
          type: "trend",
          data: sortedMonths.map(month => ({
            period: month,
            value: monthlyData[month]
          })),
          summary: `Month-over-month growth: ${growth.toFixed(2)}%. ${growth >= 0 ? 'Positive trend.' : 'Negative trend.'}`
        };
      }
      
      return {
        type: "trend",
        data: sortedMonths.map(month => ({
          period: month,
          value: monthlyData[month]
        })),
        summary: `Monthly trend data for ${sortedMonths.length} months.`
      };
    }
    
    // Insights queries
    if (queryLower.includes("insight") || queryLower.includes("analysis") || queryLower.includes("recommend")) {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data.length === 0) {
        return {
          type: "insights",
          data: [],
          summary: "No insights available at this time."
        };
      }
      
      // Filter insights by priority
      if (queryLower.includes("high priority") || queryLower.includes("important")) {
        const highPriority = data.filter(insight => insight.priority.toLowerCase() === "high");
        
        return {
          type: "insights",
          data: highPriority.map(insight => ({
            title: insight.title,
            description: insight.description,
            category: insight.category,
            priority: insight.priority
          })),
          summary: `Found ${highPriority.length} high priority insights.`
        };
      }
      
      // Filter insights by category
      for (const category of ["growth", "risk", "opportunity", "success"]) {
        if (queryLower.includes(category)) {
          const filtered = data.filter(insight => 
            insight.category.toLowerCase() === category
          );
          
          return {
            type: "insights",
            data: filtered.map(insight => ({
              title: insight.title,
              description: insight.description,
              priority: insight.priority
            })),
            summary: `Found ${filtered.length} insights in the ${category} category.`
          };
        }
      }
      
      // Default insights response
      return {
        type: "insights",
        data: data.map(insight => ({
          title: insight.title,
          description: insight.description,
          category: insight.category,
          priority: insight.priority
        })),
        summary: `Retrieved ${data.length} business insights.`
      };
    }
    
    // Default response for unrecognized queries
    return {
      type: "unknown",
      message: "I couldn't understand your query. Try asking about sales, revenue, customers, users, trends, or insights.",
    };
  } catch (error) {
    console.error("Error processing NLP query:", error);
    return {
      type: "error",
      message: "An error occurred while processing your query. Please try again.",
    };
  }
};
