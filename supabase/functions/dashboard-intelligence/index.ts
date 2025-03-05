
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

    const { data: dashboardState } = await req.json();
    
    // Log received state for diagnostics
    console.log("Dashboard state received:", dashboardState);

    // Perform AI-powered analysis on the dashboard state
    const analysis = analyzeDashboardHealth(dashboardState);
    
    // Store the analysis in the database
    const { error: insertError } = await supabase
      .from("dashboard_health")
      .insert({
        timestamp: new Date().toISOString(),
        analysis: analysis,
        state: dashboardState,
      });

    if (insertError) {
      console.error("Error storing analysis:", insertError);
    }

    // Generate self-healing recommendations
    const healingRecommendations = generateHealingRecommendations(analysis);

    return new Response(
      JSON.stringify({ 
        analysis, 
        recommendations: healingRecommendations,
        status: "success" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in dashboard intelligence:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Analyze dashboard health based on provided state
function analyzeDashboardHealth(state) {
  const issues = [];
  const insights = [];
  
  // Check for missing data
  if (!state.salesData || state.salesData.length === 0) {
    issues.push({
      type: "missing_data",
      component: "sales_chart",
      severity: "high",
      description: "Sales data is missing or empty",
    });
  }
  
  // Check for rendering issues
  if (state.renderErrors && state.renderErrors.length > 0) {
    state.renderErrors.forEach(error => {
      issues.push({
        type: "render_error",
        component: error.component,
        severity: "critical",
        description: error.message,
        stack: error.stack
      });
    });
  }
  
  // Check for API errors
  if (state.apiErrors && state.apiErrors.length > 0) {
    state.apiErrors.forEach(error => {
      issues.push({
        type: "api_error",
        endpoint: error.endpoint,
        severity: "high",
        description: error.message,
        status: error.status
      });
    });
  }
  
  // Generate performance insights
  if (state.performanceMetrics) {
    if (state.performanceMetrics.loadTime > 3000) {
      insights.push({
        type: "performance",
        metric: "load_time",
        value: state.performanceMetrics.loadTime,
        recommendation: "Consider optimizing component loading or implementing lazy loading"
      });
    }
    
    if (state.performanceMetrics.memoryUsage > 80) {
      insights.push({
        type: "performance",
        metric: "memory_usage",
        value: state.performanceMetrics.memoryUsage,
        recommendation: "Check for memory leaks or optimize data handling"
      });
    }
  }
  
  return {
    issues,
    insights,
    timestamp: new Date().toISOString(),
    healthScore: calculateHealthScore(issues, insights)
  };
}

// Calculate overall dashboard health score
function calculateHealthScore(issues, insights) {
  // Start with perfect score
  let score = 100;
  
  // Deduct points based on issue severity
  issues.forEach(issue => {
    switch(issue.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 10;
        break;
      case "medium":
        score -= 5;
        break;
      case "low":
        score -= 2;
        break;
    }
  });
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

// Generate recommendations for self-healing
function generateHealingRecommendations(analysis) {
  const recommendations = [];
  
  // Process critical issues first
  const criticalIssues = analysis.issues.filter(issue => issue.severity === "critical");
  
  criticalIssues.forEach(issue => {
    if (issue.type === "render_error") {
      recommendations.push({
        type: "fix",
        action: "reload_component",
        target: issue.component,
        priority: "immediate"
      });
    } else if (issue.type === "api_error") {
      recommendations.push({
        type: "fix",
        action: "retry_request",
        target: issue.endpoint,
        priority: "immediate",
        maxRetries: 3
      });
    }
  });
  
  // Handle data issues
  const dataIssues = analysis.issues.filter(issue => issue.type === "missing_data");
  
  dataIssues.forEach(issue => {
    recommendations.push({
      type: "fix",
      action: "load_fallback_data",
      target: issue.component,
      priority: "high"
    });
  });
  
  // Add performance optimizations
  analysis.insights.forEach(insight => {
    if (insight.type === "performance") {
      recommendations.push({
        type: "optimization",
        action: insight.recommendation,
        target: insight.metric,
        priority: "medium"
      });
    }
  });
  
  return recommendations;
}
