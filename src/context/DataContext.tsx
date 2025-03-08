
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for sales and category data
interface SalesDataItem {
  id?: string;
  amount: number;
  value?: number;
  product_name?: string;
  category: string;
  transaction_date?: string;
  date?: string;
  customer_id?: string | null;
}

interface CategoryDataItem {
  name: string;
  value: number;
}

type DataContextType = {
  salesData: SalesDataItem[];
  customersData: any[];
  insightsData: any[];
  categoryData: CategoryDataItem[];
  usersData: any[];
  setSalesData: (data: SalesDataItem[]) => void;
  setCustomersData: (data: any[]) => void;
  setInsightsData: (data: any[]) => void;
  setCategoryData: (data: CategoryDataItem[]) => void;
  setUsersData: (data: any[]) => void;
  hasUploadedData: boolean;
  dataSource: string;
  setDataSource: (source: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [insightsData, setInsightsData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataItem[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string>('upload');

  // Determine if any data has been uploaded
  const hasUploadedData = salesData.length > 0 || customersData.length > 0 || insightsData.length > 0;

  return (
    <DataContext.Provider
      value={{
        salesData,
        customersData,
        insightsData,
        categoryData,
        usersData,
        setSalesData,
        setCustomersData,
        setInsightsData,
        setCategoryData,
        setUsersData,
        hasUploadedData,
        dataSource,
        setDataSource
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
