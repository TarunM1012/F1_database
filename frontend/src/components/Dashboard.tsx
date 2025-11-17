import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { viewsData, fetchViewsData, loading, error } = useData();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalRecords: 0,
    drivers: 0,
    constructors: 0,
    circuits: 0,
    races: 0
  });
  useEffect(() => {
    fetchViewsData();
  }, [fetchViewsData]);

  // Fetch lightweight counts for dashboard KPI
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get('/views/summary');
        if (res.data?.success) {
          setStats((prev) => ({
            ...prev,
            drivers: res.data.data.drivers ?? prev.drivers,
            constructors: res.data.data.constructors ?? prev.constructors,
            circuits: res.data.data.circuits ?? prev.circuits
          }));
        }
      } catch {}
    };
    loadSummary();
  }, []);

  useEffect(() => {
    if (viewsData && Object.keys(viewsData).length > 0) {
      // Extract data from each view
      let totalRecords = 0;
      let driversCount = 0;
      let constructorsCount = 0;
      let circuitsCount = 0;
      let racesCount = 0;

      Object.keys(viewsData).forEach(viewName => {
        const data = viewsData[viewName];
        
        if (Array.isArray(data)) {
          totalRecords += data.length;
          
          // Count specific data types based on view names
          if (viewName.includes('driver')) {
            driversCount = Math.max(driversCount, data.length);
          }
          if (viewName.includes('constructor')) {
            constructorsCount = Math.max(constructorsCount, data.length);
          }
          if (viewName.includes('circuit')) {
            circuitsCount = Math.max(circuitsCount, data.length);
          }
          if (viewName.includes('race')) {
            racesCount = Math.max(racesCount, data.length);
          }
        }
      });
      
      setStats({
        totalViews: Object.keys(viewsData).length,
        totalRecords,
        drivers: driversCount,
        constructors: constructorsCount,
        circuits: circuitsCount,
        races: racesCount
      });
    }
  }, [viewsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Formula 1 Data Management System
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.username} - Monitor and analyze Formula 1 data
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Drivers</h3>
            <p className="text-2xl font-bold text-red-600">{stats.drivers}</p>
            <p className="text-xs text-gray-500 mt-1">Active & Historical</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Constructors</h3>
            <p className="text-2xl font-bold text-green-600">{stats.constructors}</p>
            <p className="text-xs text-gray-500 mt-1">Teams & Manufacturers</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Circuits</h3>
            <p className="text-2xl font-bold text-red-600">{stats.circuits}</p>
            <p className="text-xs text-gray-500 mt-1">Race Tracks</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Races</h3>
            <p className="text-2xl font-bold text-gray-700">{stats.races}</p>
            <p className="text-xs text-gray-500 mt-1">Grand Prix Events</p>
          </div>
        </div>

        {/* Database Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Database Views</span>
                <span className="font-semibold">{stats.totalViews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Records</span>
                <span className="font-semibold">{stats.totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Role</span>
                <span className="font-semibold capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Views */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Views & Tables</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="loading mx-auto mb-4"></div>
              <p className="text-gray-500">Loading database views...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="alert alert-error mb-4">
                <p>{error}</p>
              </div>
              <button 
                onClick={fetchViewsData}
                className="btn-primary"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(viewsData).map((viewName) => (
                <div key={viewName} className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                  <h3 className="font-semibold text-gray-900 capitalize mb-2">
                    {viewName.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {Array.isArray(viewsData[viewName]) ? viewsData[viewName].length : 0} records
                  </p>
                  <button className="btn-secondary text-xs">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Information */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This System</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Purpose:</strong> Effective management and querying of Formula 1 data to provide 
              insights and visualizations for fans, analysts, and teams.
            </p>
            <p>
              <strong>Features:</strong> Monitor race results, driver points, constructor performance, 
              and develop insights through historical trends and performance metrics.
            </p>
            <p>
              <strong>Data Sources:</strong> Comprehensive Formula 1 datasets including drivers, 
              constructors, circuits, races, results, and standings from multiple seasons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;