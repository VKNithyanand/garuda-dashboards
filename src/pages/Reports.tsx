import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getFunctionUrl, getAuthHeader } from "@/lib/supabase-functions";

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedType, setSelectedType] = useState("summary");

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      const url = getFunctionUrl('get-analytics');
      const headers = await getAuthHeader();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ 
          period: selectedPeriod,
          type: selectedType
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setReportData(data);
      
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, selectedType]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label htmlFor="period">Select Period:</label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div>
          <label htmlFor="type">Select Report Type:</label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        <button onClick={fetchReports}>Fetch Reports</button>
        <div>
          {reportData.map((report, index) => (
            <div key={index} className="report-item">
              <h2>{report.title}</h2>
              <p>{report.content}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
