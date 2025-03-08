
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
    const { industry, competitors } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // In a real implementation, this would use APIs or web scraping to get competitor data
    // For this demo, we'll generate realistic mock data
    const benchmarkingData = generateCompetitorData(industry, competitors);
    
    // Store the data in Supabase for caching (optional)
    const { data: storedData, error } = await supabase
      .from("competitor_benchmarking")
      .upsert({
        industry,
        competitors: JSON.stringify(competitors),
        benchmark_data: benchmarkingData,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) console.error("Error storing benchmarking data:", error);
    
    return new Response(
      JSON.stringify({ success: true, data: benchmarkingData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in competitor benchmarking:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateCompetitorData(industry: string, competitors: string[]) {
  const industries = {
    "retail": {
      metrics: ["Revenue Growth", "Customer Retention", "Profit Margin", "Market Share", "Online Presence"],
      averages: [8.5, 72, 12.3, 15, 78]
    },
    "technology": {
      metrics: ["R&D Investment", "Patent Applications", "Revenue Growth", "User Acquisition", "Retention Rate"],
      averages: [22, 45, 15.7, 28, 68]
    },
    "food": {
      metrics: ["Food Cost", "Customer Satisfaction", "Table Turnover", "Profit Margin", "Online Orders"],
      averages: [30, 82, 5.2, 10, 42]
    }
  };
  
  // Default to retail if industry not found
  const industryData = industries[industry as keyof typeof industries] || industries["retail"];
  
  // Generate random data for your business that's slightly better than average
  const yourData = industryData.averages.map(avg => 
    Math.round((avg + (Math.random() * 5 - 1)) * 10) / 10
  );
  
  // Generate competitor data
  const competitorData = competitors.map(competitor => {
    return {
      name: competitor,
      values: industryData.metrics.map((_, i) => {
        // Generate random values around the industry average
        const variance = Math.random() * 10 - 5; // -5 to +5
        return Math.round((industryData.averages[i] + variance) * 10) / 10;
      })
    };
  });
  
  // Add news and trends
  const news = generateIndustryNews(industry);
  const trends = generateMarketTrends(industry);
  
  return {
    industry,
    metrics: industryData.metrics,
    industryAverages: industryData.averages,
    yourBusiness: {
      name: "Your Business",
      values: yourData
    },
    competitors: competitorData,
    news,
    trends
  };
}

function generateIndustryNews(industry: string) {
  const newsItems = {
    "retail": [
      "Amazon expands one-day delivery to more cities",
      "Walmart reports 12% increase in online sales",
      "Target launches new loyalty program",
      "New consumer spending report shows shift to experiential retail",
      "Supply chain innovations cut delivery times by 30%"
    ],
    "technology": [
      "Apple announces new product line for AR/VR",
      "Microsoft cloud services revenue up 24% year over year",
      "Google introduces new AI tools for small businesses",
      "Tech hiring slows amid economic uncertainty",
      "Cybersecurity spending expected to increase 15% this year"
    ],
    "food": [
      "Plant-based alternatives gaining market share",
      "Restaurant delivery services consolidating",
      "New food safety regulations coming next quarter",
      "Labor shortage affecting 68% of restaurants",
      "Consumer demand for sustainable packaging increases"
    ]
  };
  
  return (newsItems[industry as keyof typeof newsItems] || newsItems["retail"])
    .map(title => ({
      title,
      date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      source: ["Bloomberg", "Reuters", "CNBC", "Industry Today", "Market Watch"][Math.floor(Math.random() * 5)]
    }));
}

function generateMarketTrends(industry: string) {
  const trends = {
    "retail": [
      { name: "E-commerce Growth", value: 18.3, change: 2.4 },
      { name: "Store Visits", value: -5.2, change: -1.8 },
      { name: "Mobile Shopping", value: 42.7, change: 8.9 },
      { name: "Returns Rate", value: 12.5, change: 0.3 },
      { name: "Social Commerce", value: 37.1, change: 12.5 }
    ],
    "technology": [
      { name: "Cloud Adoption", value: 34.8, change: 5.2 },
      { name: "AI Integration", value: 56.2, change: 15.7 },
      { name: "Remote Work Tools", value: 78.5, change: 4.1 },
      { name: "Cybersecurity Investment", value: 22.3, change: 7.8 },
      { name: "5G Deployment", value: 45.9, change: 18.3 }
    ],
    "food": [
      { name: "Takeout Orders", value: 28.7, change: 3.2 },
      { name: "Organic Options", value: 15.4, change: 2.7 },
      { name: "Delivery Apps Usage", value: 52.3, change: 8.5 },
      { name: "Plant-Based Menu Items", value: 32.8, change: 12.3 },
      { name: "Contactless Payment", value: 67.9, change: 5.4 }
    ]
  };
  
  return trends[industry as keyof typeof trends] || trends["retail"];
}
