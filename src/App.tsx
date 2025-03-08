
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DataProvider } from './context/DataContext';
import { Toaster } from "@/components/ui/toaster";

// Placeholder components for now, will be replaced by actual implementations
const Index = () => <div>Dashboard Page</div>;
const Settings = () => <div>Settings Page</div>;
const Analytics = () => <div>Analytics Page</div>;
const Insights = () => <div>Insights Page</div>;
const Reports = () => <div>Reports Page</div>;
const Users = () => <div>Users Page</div>;
const NotFound = () => <div>404 Not Found</div>;
const Auth = () => <div>Auth Page</div>;
const ResetPassword = () => <div>Reset Password Page</div>;
const UpdatePassword = () => <div>Update Password Page</div>;

function App() {
  const [queryClient] = useState(new QueryClient());

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <DataProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/settings/*" element={<Settings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
