import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';

interface DataContextType {
  viewsData: Record<string, any[]>;
  loading: boolean;
  error: string | null;
  fetchViewsData: () => Promise<void>;
  fetchViewData: (viewName: string, limit?: number, offset?: number) => Promise<any[]>;
  searchInView: (viewName: string, searchTerm: string, column?: string) => Promise<any[]>;
  exportData: (table: string, format: 'json' | 'csv') => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [viewsData, setViewsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchViewsData = async () => {
    setLoading(true);
    setError(null);
    console.log('🔄 Starting to fetch views data...');
    const startTime = Date.now();
    
    try {
      // Increase timeout for views endpoint as it may take longer
      console.log('📡 Making API request to /views/all...');
      const response = await api.get('/views/all', { timeout: 60000 });
      const fetchTime = Date.now() - startTime;
      console.log(`⏱️  Request completed in ${fetchTime}ms`);
      
      if (response.data.success) {
        const data = response.data.data || {};
        console.log('📊 Received views data:', Object.keys(data));
        setViewsData(data);
        
        // Check if any views have data
        const viewsWithData = Object.values(data).filter((arr: any) => Array.isArray(arr) && arr.length > 0);
        
        if (viewsWithData.length === 0) {
          // Views exist but are empty - this is informative, not an error
          console.warn('⚠️  All views exist but contain no data. This may be normal if the database tables are empty.');
          // Don't set an error, just show empty state in UI
        } else {
          console.log(`✅ Loaded data from ${viewsWithData.length} views`);
        }
      } else {
        console.error('❌ API returned success: false', response.data);
        setError(response.data.error || 'Failed to fetch views data');
        if (response.data.hint) {
          console.error('Hint:', response.data.hint);
        }
      }
    } catch (error: any) {
      const fetchTime = Date.now() - startTime;
      console.error(`❌ Error after ${fetchTime}ms:`, error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Request timed out. The server may be taking too long to respond. Try again or check server logs.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Please ensure the server is running on port 5000.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || 'Server error: The backend encountered an issue while fetching views data.';
        const hint = error.response?.data?.hint || '';
        setError(hint ? `${errorMsg} ${hint}` : errorMsg);
      } else if (error.response?.status === 404) {
        setError('API endpoint not found. Please check if the backend server is configured correctly.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(`Failed to fetch views data: ${error.message || 'Unknown error'}`);
      }
      
      if (error.response?.data) {
        console.error('Response data:', error.response.data);
      }
    } finally {
      console.log('✅ fetchViewsData finished, setting loading to false');
      setLoading(false);
    }
  };

  const fetchViewData = async (viewName: string, limit = 100, offset = 0): Promise<any[]> => {
    try {
      const response = await api.get(`/views/${viewName}?limit=${limit}&offset=${offset}`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error(`Error fetching ${viewName}:`, error);
      return [];
    }
  };

  const searchInView = async (viewName: string, searchTerm: string, column?: string): Promise<any[]> => {
    try {
      const response = await api.post('/views/search', {
        viewName,
        searchTerm,
        column
      });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error(`Error searching in ${viewName}:`, error);
      return [];
    }
  };

  const exportData = async (table: string, format: 'json' | 'csv'): Promise<string> => {
    try {
      const response = await api.post('/external/export/' + table, { format });
      if (response.data.success) {
        if (format === 'json') {
          // JSON format: stringify the data
          return JSON.stringify(response.data.data, null, 2);
        } else {
          // CSV format: data is already a string
          return response.data.data || '';
        }
      }
      throw new Error(response.data.error || 'Export failed');
    } catch (error: any) {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Export failed';
      throw new Error(errorMessage);
    }
  };

  const value: DataContextType = {
    viewsData,
    loading,
    error,
    fetchViewsData,
    fetchViewData,
    searchInView,
    exportData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
