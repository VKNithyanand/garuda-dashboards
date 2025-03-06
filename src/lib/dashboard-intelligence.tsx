
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";

// Types for dashboard health monitoring
export interface DashboardError {
  component?: string;
  endpoint?: string;
  message: string;
  stack?: string;
  status?: number;
  timestamp: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  renderTime: number;
  apiResponseTimes: Record<string, number>;
}

export interface DashboardState {
  salesData?: any[];
  customersData?: any[];
  insightsData?: any[];
  reportData?: any[];
  renderErrors: DashboardError[];
  apiErrors: DashboardError[];
  performanceMetrics: PerformanceMetrics;
  componentState: Record<string, any>;
}

// Initialize empty dashboard state
const initialDashboardState: DashboardState = {
  renderErrors: [],
  apiErrors: [],
  performanceMetrics: {
    loadTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    apiResponseTimes: {},
  },
  componentState: {},
};

// Global dashboard state
let dashboardState: DashboardState = { ...initialDashboardState };

// Track render errors
export function trackRenderError(component: string, error: Error): void {
  console.error(`Render error in ${component}:`, error);
  
  dashboardState.renderErrors.push({
    component,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // If we exceed 10 errors, remove the oldest one
  if (dashboardState.renderErrors.length > 10) {
    dashboardState.renderErrors.shift();
  }
  
  // Trigger self-healing
  requestIntelligenceAnalysis();
}

// Track API errors
export function trackApiError(endpoint: string, error: Error, status?: number): void {
  console.error(`API error for ${endpoint}:`, error);
  
  dashboardState.apiErrors.push({
    endpoint,
    message: error.message,
    status,
    timestamp: new Date().toISOString(),
  });
  
  // If we exceed 10 errors, remove the oldest one
  if (dashboardState.apiErrors.length > 10) {
    dashboardState.apiErrors.shift();
  }
  
  // Trigger self-healing
  requestIntelligenceAnalysis();
}

// Track performance metrics
export function trackPerformance(metric: keyof PerformanceMetrics, value: number): void {
  if (metric === 'apiResponseTimes') {
    return; // This is a record, not a direct value
  }
  
  dashboardState.performanceMetrics[metric] = value;
}

// Track API response time
export function trackApiResponseTime(endpoint: string, timeMs: number): void {
  dashboardState.performanceMetrics.apiResponseTimes[endpoint] = timeMs;
}

// Update component data state
export function updateDataState(key: string, data: any[]): void {
  if (key === 'salesData' || key === 'customersData' || key === 'insightsData' || key === 'reportData') {
    dashboardState[key] = data;
  }
}

// Update component UI state
export function updateComponentState(component: string, state: any): void {
  dashboardState.componentState[component] = state;
}

// Track report generation and download
export function trackReportActivity(action: 'generate' | 'download', format: string, success: boolean): void {
  console.log(`Report ${action}: ${format} - ${success ? 'Success' : 'Failed'}`);
  
  // We could store more detailed analytics here
  if (!dashboardState.reportData) {
    dashboardState.reportData = [];
  }
  
  (dashboardState.reportData as any[]).push({
    action,
    format,
    success,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the latest 20 report activities
  if (dashboardState.reportData.length > 20) {
    dashboardState.reportData.shift();
  }
}

// Parse CSV string into JSON
export function parseCSV(csvString: string): any[] {
  // Split by lines
  const lines = csvString.split('\n');
  
  // Extract header row
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const entry: Record<string, any> = {};
    
    headers.forEach((header, idx) => {
      entry[header] = values[idx] ? values[idx].trim() : '';
    });
    
    result.push(entry);
  }
  
  return result;
}

// Clear all errors
export function clearErrors(): void {
  dashboardState.renderErrors = [];
  dashboardState.apiErrors = [];
}

// Send dashboard state to intelligence service for analysis
export async function requestIntelligenceAnalysis(): Promise<any> {
  try {
    const response = await supabase.functions.invoke("dashboard-intelligence", {
      body: { data: dashboardState },
    });
    
    // Apply recommendations (self-healing)
    if (response.data && response.data.recommendations) {
      applyHealingRecommendations(response.data.recommendations);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error requesting dashboard intelligence:", error);
    return null;
  }
}

// Apply self-healing recommendations
function applyHealingRecommendations(recommendations: any[]): void {
  recommendations.forEach(recommendation => {
    if (recommendation.action === "reload_component") {
      // Trigger component reload via custom event
      window.dispatchEvent(new CustomEvent('dashboard:reload-component', {
        detail: { component: recommendation.target }
      }));
    }
    
    if (recommendation.action === "retry_request") {
      // Trigger API retry via custom event
      window.dispatchEvent(new CustomEvent('dashboard:retry-request', {
        detail: { endpoint: recommendation.target, maxRetries: recommendation.maxRetries }
      }));
    }
    
    if (recommendation.action === "load_fallback_data") {
      // Load fallback data via custom event
      window.dispatchEvent(new CustomEvent('dashboard:load-fallback', {
        detail: { component: recommendation.target }
      }));
    }
  });
}

// Initialize system - called on app start
export function initDashboardIntelligence(): void {
  // Start performance tracking
  trackPerformance('loadTime', performance.now());
  
  // Get memory usage if available
  if (window.performance && (performance as any).memory) {
    const memoryInfo = (performance as any).memory;
    const usedHeapSize = memoryInfo.usedJSHeapSize;
    const totalHeapSize = memoryInfo.totalJSHeapSize;
    
    if (totalHeapSize > 0) {
      const memoryUsage = (usedHeapSize / totalHeapSize) * 100;
      trackPerformance('memoryUsage', memoryUsage);
    }
  }
  
  // Set up periodic health checks
  setInterval(() => {
    requestIntelligenceAnalysis();
  }, 60000); // Check every minute
}

// Need to create a dummy queryClient for the hook to work
const queryClient = new QueryClient();

// Enhanced data fetching with retry logic and monitoring
export function useMonitoredQuery(queryKey: string[], queryFn: () => Promise<any>, options = {}) {
  const startTime = performance.now();
  
  // Listen for retry events
  React.useEffect(() => {
    const handleRetryEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.endpoint === queryKey[0]) {
        queryClient.invalidateQueries({ queryKey });
      }
    };
    
    window.addEventListener('dashboard:retry-request', handleRetryEvent);
    return () => window.removeEventListener('dashboard:retry-request', handleRetryEvent);
  }, [queryKey]);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const data = await queryFn();
        // Track successful response time
        trackApiResponseTime(queryKey[0], performance.now() - startTime);
        return data;
      } catch (error) {
        // Track API error
        trackApiError(queryKey[0], error as Error);
        throw error;
      }
    },
    ...options,
  });
}

// Import the ErrorBoundary component to avoid circular dependencies
export { withErrorBoundary } from "@/components/ErrorBoundary";
