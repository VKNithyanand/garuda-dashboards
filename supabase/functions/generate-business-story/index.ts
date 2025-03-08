
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
    const { salesData, customersData, insightsData, timeframe } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // If no data provided in request, fetch from database
    let finalSalesData = salesData;
    let finalCustomersData = customersData;
    let finalInsightsData = insightsData;
    
    if (!salesData || salesData.length === 0) {
      const { data, error } = await supabase.from("sales").select("*");
      if (error) throw error;
      finalSalesData = data;
    }
    
    if (!customersData || customersData.length === 0) {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      finalCustomersData = data;
    }
    
    if (!insightsData || insightsData.length === 0) {
      const { data, error } = await supabase.from("insights").select("*");
      if (error) throw error;
      finalInsightsData = data;
    }
    
    // Generate the business story
    const story = generateBusinessStory(finalSalesData, finalCustomersData, finalInsightsData, timeframe);
    
    return new Response(
      JSON.stringify({ success: true, story }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating business story:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateBusinessStory(salesData, customersData, insightsData, timeframe = "last-quarter") {
  // Calculate basic metrics
  const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const salesCount = salesData.length;
  const customerCount = new Set(salesData.map(sale => sale.customer_id)).size;
  
  // Find top performing product and category
  const productSales = salesData.reduce((acc, sale) => {
    const product = sale.product_name || "Unknown Product";
    if (!acc[product]) acc[product] = 0;
    acc[product] += Number(sale.amount);
    return acc;
  }, {});
  
  const topProduct = Object.entries(productSales)
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];
  
  const categorySales = salesData.reduce((acc, sale) => {
    if (!acc[sale.category]) acc[sale.category] = 0;
    acc[sale.category] += Number(sale.amount);
    return acc;
  }, {});
  
  const topCategory = Object.entries(categorySales)
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];
  
  // Calculate growth
  let growthRate = 0;
  if (timeframe === "last-quarter" && salesData.length > 0) {
    // Sort by date
    const sortedSales = [...salesData].sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );
    
    // Split into quarters (simplified)
    const halfway = Math.floor(sortedSales.length / 2);
    const firstHalf = sortedSales.slice(0, halfway);
    const secondHalf = sortedSales.slice(halfway);
    
    const firstHalfTotal = firstHalf.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const secondHalfTotal = secondHalf.reduce((sum, sale) => sum + Number(sale.amount), 0);
    
    if (firstHalfTotal > 0) {
      growthRate = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    }
  }
  
  // Get key insights
  const keyInsights = insightsData
    .filter(insight => insight.priority === "High")
    .map(insight => insight.title)
    .slice(0, 3);
  
  // Generate the story
  const story = {
    title: `Business Performance ${timeframe === "last-quarter" ? "Quarterly" : "Annual"} Review`,
    summary: `Your business generated $${totalSales.toFixed(2)} in revenue from ${salesCount} sales to ${customerCount} customers.`,
    highlights: [
      {
        title: "Growth Overview",
        content: growthRate >= 0 
          ? `Your sales grew by ${growthRate.toFixed(1)}% compared to the previous period.`
          : `Your sales decreased by ${Math.abs(growthRate).toFixed(1)}% compared to the previous period.`
      },
      {
        title: "Top Performers",
        content: `Your best-selling product was "${topProduct[0]}" generating $${Number(topProduct[1]).toFixed(2)} in sales. The "${topCategory[0]}" category was your highest performer, accounting for $${Number(topCategory[1]).toFixed(2)} in revenue.`
      }
    ],
    insights: keyInsights.map(insight => ({ title: "Key Insight", content: insight })),
    recommendations: [
      {
        title: "Marketing Focus",
        content: `Consider increasing marketing efforts for your "${topCategory[0]}" category, which is already performing well and could be further optimized.`
      },
      {
        title: "Inventory Management",
        content: `Ensure you have sufficient stock of "${topProduct[0]}" to meet customer demand, as it's your top-selling product.`
      }
    ],
    conclusion: `Overall, your business ${growthRate >= 0 ? "shows positive momentum" : "faces some challenges"} that can be addressed with targeted strategies. Focus on your strengths in the "${topCategory[0]}" category while addressing any declining areas with renewed marketing and inventory strategies.`
  };
  
  return story;
}
