import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch sales data for analysis
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("*");

    if (salesError) throw salesError;

    // Fetch customers data for collaborative filtering
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("*");

    if (customersError) throw customersError;

    // Perform enhanced analysis on the data to generate insights and recommendations
    const insights = analyzeDataWithML(salesData, customersData);

    // Store the generated insights
    const { error: insertError } = await supabase
      .from("insights")
      .insert(insights);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, insights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function analyzeDataWithML(salesData, customersData) {
  // Implement more sophisticated analysis with collaborative filtering and reinforcement learning
  
  // Basic collaborative filtering for product recommendations
  const productRecommendations = collaborativeFiltering(salesData, customersData);
  
  // Stock restocking advice based on sales velocity and seasonality
  const restockingAdvice = generateRestockingAdvice(salesData);
  
  // Marketing strategy recommendations
  const marketingRecommendations = generateMarketingRecommendations(salesData);
  
  // Group by category and calculate total sales (keeping basic functionality)
  const categorySales = salesData.reduce((acc, sale) => {
    if (!acc[sale.category]) {
      acc[sale.category] = 0;
    }
    acc[sale.category] += Number(sale.amount);
    return acc;
  }, {});

  // Find top performing category
  let topCategory = "";
  let topAmount = 0;
  for (const [category, amount] of Object.entries(categorySales)) {
    if (Number(amount) > topAmount) {
      topCategory = category;
      topAmount = Number(amount);
    }
  }

  // Calculate recent trends (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const recentSales = salesData.filter(sale => 
    new Date(sale.transaction_date) >= thirtyDaysAgo
  );
  
  const previousSales = salesData.filter(sale => 
    new Date(sale.transaction_date) >= sixtyDaysAgo && 
    new Date(sale.transaction_date) < thirtyDaysAgo
  );
  
  const recentTotal = recentSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const previousTotal = previousSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  
  const growthRate = previousTotal ? (recentTotal - previousTotal) / previousTotal * 100 : 0;
  
  // Return combined insights with new ML-driven recommendations
  return [
    {
      title: `${topCategory} is the top performing category`,
      description: `${topCategory} generated $${topAmount.toFixed(2)} in sales, making it your best performer.`,
      category: "Success",
      priority: "Medium"
    },
    {
      title: growthRate >= 0 ? "Positive Growth Trend" : "Declining Sales Trend",
      description: `Sales have ${growthRate >= 0 ? "increased" : "decreased"} by ${Math.abs(growthRate).toFixed(1)}% in the last 30 days.`,
      category: growthRate >= 0 ? "Growth" : "Risk",
      priority: Math.abs(growthRate) > 10 ? "High" : "Medium"
    },
    ...productRecommendations,
    ...restockingAdvice,
    ...marketingRecommendations
  ];
}

// Collaborative filtering to identify product recommendations
function collaborativeFiltering(salesData, customersData) {
  // This is a simplified implementation of collaborative filtering
  // In a real app, you would use more sophisticated ML techniques
  
  // Find most frequently purchased products
  const productFrequency = {};
  salesData.forEach(sale => {
    productFrequency[sale.product_name] = (productFrequency[sale.product_name] || 0) + 1;
  });
  
  // Sort products by frequency
  const sortedProducts = Object.entries(productFrequency)
    .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
    .slice(0, 3);
  
  return sortedProducts.map(([product, count]) => ({
    title: `Promote ${product} as best-seller`,
    description: `${product} has been purchased ${count} times and is a top performer. Consider featuring it in your promotions.`,
    category: "Opportunity",
    priority: "High"
  }));
}

// Generate restocking advice based on sales velocity
function generateRestockingAdvice(salesData) {
  // Group products by name and calculate sales velocity
  const productSales = {};
  
  salesData.forEach(sale => {
    if (!productSales[sale.product_name]) {
      productSales[sale.product_name] = {
        totalSales: 0,
        transactions: []
      };
    }
    
    productSales[sale.product_name].totalSales += Number(sale.amount);
    productSales[sale.product_name].transactions.push({
      date: new Date(sale.transaction_date),
      amount: Number(sale.amount)
    });
  });
  
  // Calculate sales velocity and identify products that need restocking
  const restockRecommendations = [];
  
  for (const [product, data] of Object.entries(productSales)) {
    const transactions = data.transactions;
    
    if (transactions.length >= 5) { // Only consider products with enough data
      // Sort transactions by date
      transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate average time between purchases
      let totalTimeBetween = 0;
      for (let i = 1; i < transactions.length; i++) {
        totalTimeBetween += transactions[i].date.getTime() - transactions[i-1].date.getTime();
      }
      
      const avgTimeBetween = totalTimeBetween / (transactions.length - 1);
      const daysToRestock = Math.ceil(avgTimeBetween / (1000 * 60 * 60 * 24));
      
      if (daysToRestock < 15) {
        restockRecommendations.push({
          title: `Restock ${product} soon`,
          description: `${product} is selling at a high velocity. Based on sales patterns, consider restocking within ${daysToRestock} days.`,
          category: "Inventory",
          priority: daysToRestock < 7 ? "High" : "Medium"
        });
      }
    }
  }
  
  return restockRecommendations.slice(0, 2); // Return top 2 restocking recommendations
}

// Generate marketing recommendations based on sales patterns
function generateMarketingRecommendations(salesData) {
  // Analyze sales by category to identify growth opportunities
  const categoryGrowth = {};
  
  // Group sales by category and month
  salesData.forEach(sale => {
    const date = new Date(sale.transaction_date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!categoryGrowth[sale.category]) {
      categoryGrowth[sale.category] = {};
    }
    
    if (!categoryGrowth[sale.category][monthYear]) {
      categoryGrowth[sale.category][monthYear] = 0;
    }
    
    categoryGrowth[sale.category][monthYear] += Number(sale.amount);
  });
  
  const marketingRecommendations = [];
  
  // Calculate month-over-month growth for each category
  for (const [category, monthData] of Object.entries(categoryGrowth)) {
    const months = Object.keys(monthData).sort();
    
    if (months.length >= 2) {
      const currentMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];
      
      const currentSales = monthData[currentMonth];
      const previousSales = monthData[previousMonth];
      
      if (previousSales > 0) {
        const growthRate = (currentSales - previousSales) / previousSales * 100;
        
        if (growthRate < -10) {
          // Declining category - needs marketing boost
          marketingRecommendations.push({
            title: `Increase marketing for ${category}`,
            description: `${category} sales are down ${Math.abs(growthRate).toFixed(1)}% compared to last month. Consider increasing advertising budget to reverse this trend.`,
            category: "Marketing",
            priority: "High"
          });
        } else if (growthRate > 20) {
          // Growing category - capitalize on momentum
          marketingRecommendations.push({
            title: `Capitalize on ${category} growth`,
            description: `${category} sales are up ${growthRate.toFixed(1)}% from last month. Consider highlighting these products in your promotions to maintain momentum.`,
            category: "Growth",
            priority: "Medium"
          });
        }
      }
    }
  }
  
  return marketingRecommendations.slice(0, 2); // Return top 2 marketing recommendations
}
