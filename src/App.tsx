import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from 'react-query';

import { DataProvider } from './context/DataContext';
import Index from './pages';
import Settings from './pages/settings';
import Analytics from './pages/analytics';
import Insights from './pages/insights';
import Reports from './pages/reports';
import Users from './pages/users';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';

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
