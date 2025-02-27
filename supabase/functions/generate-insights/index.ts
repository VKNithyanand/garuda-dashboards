
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

    // Perform analysis on the data to generate insights
    // This is a simplified version - in a real app, you might use ML models
    const insights = analyzeData(salesData);

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

function analyzeData(salesData: any[]) {
  // Simplified analysis logic
  // In a real app, this would be much more sophisticated
  
  // Group by category and calculate total sales
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
    }
  ];
}
