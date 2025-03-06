
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
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body if it exists
    let customData = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.customData) {
          customData = body.customData;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Fetch sales data
    let salesData;
    if (customData) {
      // Use custom uploaded data
      salesData = customData;
    } else {
      // Fetch from database
      const { data, error } = await supabase
        .from("sales")
        .select("*");
      
      if (error) throw error;
      salesData = data;
    }

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

    // Prepare the data based on requested format
    const analyticsData = {
      totalSales,
      categoriesData,
      monthlySalesData,
    };

    // Return data in the requested format
    switch (format.toLowerCase()) {
      case "csv":
        return generateCSV(analyticsData);
      case "excel":
        return generateExcel(analyticsData);
      case "pdf":
        return generatePDF(analyticsData);
      default:
        return new Response(
          JSON.stringify(analyticsData),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
    }
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

// Function to generate CSV format
function generateCSV(data) {
  // Convert categories data to CSV
  let csvContent = "Category,Value\n";
  data.categoriesData.forEach(item => {
    csvContent += `${item.name},${item.value}\n`;
  });
  
  csvContent += "\nMonth,Sales\n";
  data.monthlySalesData.forEach(item => {
    csvContent += `${item.date},${item.value}\n`;
  });
  
  csvContent += `\nTotal Sales,${data.totalSales}\n`;
  
  return new Response(
    csvContent,
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=sales_report.csv"
      },
      status: 200,
    }
  );
}

// Function to generate Excel-like format (actually just CSV with different extension)
function generateExcel(data) {
  // For demo purposes, we're returning a CSV with Excel extension
  // In a real implementation, you would use a library to create real Excel files
  const csvContent = generateCSV(data);
  
  return new Response(
    csvContent.body,
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": "attachment; filename=sales_report.xlsx"
      },
      status: 200,
    }
  );
}

// Function to generate PDF format (simplified simulation)
function generatePDF(data) {
  // For demonstration purposes, we're returning a text representation
  // In a real implementation, you would use a PDF generation library
  const content = `
    Sales Report
    ============
    
    Categories:
    ${data.categoriesData.map(item => `${item.name}: ${item.value}`).join('\n    ')}
    
    Monthly Sales:
    ${data.monthlySalesData.map(item => `${item.date}: ${item.value}`).join('\n    ')}
    
    Total Sales: ${data.totalSales}
  `;
  
  return new Response(
    content,
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=sales_report.pdf"
      },
      status: 200,
    }
  );
}
