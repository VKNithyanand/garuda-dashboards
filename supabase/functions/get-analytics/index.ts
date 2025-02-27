
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

    // Fetch sales data
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("*");

    if (salesError) throw salesError;

    // Calculate analytics
    const totalSales = salesData.reduce(
      (sum, sale) => sum + Number(sale.amount),
      0
    );

    const salesByCategory = salesData.reduce((acc: Record<string, number>, sale) => {
      if (!acc[sale.category]) {
        acc[sale.category] = 0;
      }
      acc[sale.category] += Number(sale.amount);
      return acc;
    }, {});

    const categoriesData = Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate sales by month
    const salesByMonth: Record<string, number> = {};
    
    salesData.forEach(sale => {
      const date = new Date(sale.transaction_date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = 0;
      }
      
      salesByMonth[monthYear] += Number(sale.amount);
    });
    
    const monthlySalesData = Object.entries(salesByMonth)
      .map(([date, value]) => ({
        date,
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return new Response(
      JSON.stringify({
        totalSales,
        categoriesData,
        monthlySalesData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
