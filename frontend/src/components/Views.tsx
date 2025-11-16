import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

const Views: React.FC = () => {
  const { viewsData, fetchViewsData, error, fetchViewData, searchInView } = useData();
  const [selectedView, setSelectedView] = useState<string>('');
  const [viewData, setViewData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSearchCount, setLastSearchCount] = useState<number | null>(null);
  const [countsByView, setCountsByView] = useState<Record<string, number>>({});

  const viewNames = [
    { id: 'driver_performance_details', name: 'Driver Performance Details', description: 'Join of 3+ tables' },
    { id: 'drivers_better_than_hamilton', name: 'Drivers Better Than Hamilton', description: 'ANY operator & GROUP BY' },
    { id: 'drivers_above_constructor_average', name: 'Drivers Above Constructor Average', description: 'Correlated nested query' },
    { id: 'all_circuits_and_races', name: 'All Circuits and Races', description: 'FULL JOIN simulation' },
    { id: 'race_winners_and_fastest_lap_drivers', name: 'Winners & Fastest Laps', description: 'UNION operation' },
    { id: 'top_constructors_by_points', name: 'Top Constructors by Points', description: 'Custom view' },
    { id: 'driver_season_performance', name: 'Driver Season Performance', description: 'Custom view' },
    { id: 'circuit_statistics', name: 'Circuit Statistics', description: 'Custom view' },
    { id: 'qualifying_vs_race_performance', name: 'Qualifying vs Race Performance', description: 'Custom view' },
    { id: 'pit_stop_analysis', name: 'Pit Stop Analysis', description: 'Custom view' }
  ];

  useEffect(() => {
    const initializeViews = async () => {
      await fetchViewsData();
      // Auto-select first view after data loads
      if (viewNames.length > 0 && !selectedView) {
        handleViewSelect(viewNames[0].id);
      }
    };
    initializeViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewSelect = async (viewName: string) => {
    setSelectedView(viewName);
    setSearchTerm('');
    setIsSearching(true);
    try {
      const data = await fetchViewData(viewName, 100);
      setViewData(data);
      setCountsByView(prev => ({ ...prev, [viewName]: Array.isArray(data) ? data.length : 0 }));
    } catch (error) {
      console.error('Error fetching view data:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedView || !searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const data = await searchInView(selectedView, searchTerm);
      setViewData(data);
      setLastSearchCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (selectedView) {
      handleViewSelect(selectedView);
    }
  };

  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No data available</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting a different view or clearing your search</p>
        </div>
      );
    }

    const columns = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                #
              </th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 whitespace-nowrap">
                  {column.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                  {index + 1}
                </td>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const currentViewInfo = viewNames.find(v => v.id === selectedView);

  // When the preloaded viewsData changes, seed counts map
  useEffect(() => {
    if (viewsData && Object.keys(viewsData).length > 0) {
      const next: Record<string, number> = { ...countsByView };
      Object.keys(viewsData).forEach((key) => {
        const arr = (viewsData as Record<string, any[]>)[key];
        if (Array.isArray(arr)) {
          next[key] = arr.length;
        }
      });
      setCountsByView(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewsData]);

  const getSidebarCount = (id: string): string => {
    if (countsByView[id] !== undefined) return String(countsByView[id]);
    if (id === selectedView) return String(Array.isArray(viewData) ? viewData.length : 0);
    const arr = (viewsData as Record<string, any[]>)[id];
    if (Array.isArray(arr)) return String(arr.length);
    return '0';
  };

  return (
    <div className="views-layout">
      {/* Sidebar */}
      <div className={`views-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Database Views</h2>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '⟩' : '⟨'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            {!selectedView && (
              <p className="sidebar-subtitle">
                Select a view to explore F1 data
              </p>
            )}

            {error && Object.keys(viewsData).length === 0 && (
              <div className="alert-error mx-4 my-2">
                {error}
              </div>
            )}

            <div className="sidebar-views">
              {viewNames.map((view) => (
                <button
                  key={view.id}
                  onClick={() => handleViewSelect(view.id)}
                  className={`view-item ${selectedView === view.id ? 'active' : ''}`}
                >
                  <div>
                    <div className="view-item-name">{view.name}</div>
                    <div className="view-item-description">{view.description}</div>
                    <div className="view-item-count">
                      {getSidebarCount(view.id)} records
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="views-content">
        {selectedView ? (
          <>
            {/* Header */}
            <div className="content-header">
              <div>
                <h1 className="content-title">{currentViewInfo?.name || selectedView}</h1>
                <p className="content-subtitle">
                  {currentViewInfo?.description} • {viewData.length} records displayed
                </p>
              </div>

              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search in this view..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="btn-secondary text-sm"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim() || isSearching}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              {lastSearchCount !== null && (
                <div className="text-sm text-gray-600 ml-4">
                  {lastSearchCount} result{lastSearchCount === 1 ? '' : 's'}
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="content-body">
              {isSearching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="loading"></div>
                  <span className="ml-3 text-gray-600">Loading data...</span>
                </div>
              ) : (
                renderTable(viewData)
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Database Views</h2>
              <p className="text-gray-600">Select a view from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Views;
