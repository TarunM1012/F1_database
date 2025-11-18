import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { useData } from '../contexts/DataContext';
import { api } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics: React.FC = () => {
  const { viewsData, fetchViewsData, loading: dataLoading, error: dataError } = useData();
  const [selectedChart, setSelectedChart] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [externalData, setExternalData] = useState<any>(null);
  const [externalDataType, setExternalDataType] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Only fetch once on mount
    fetchViewsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewsData && Object.keys(viewsData).length > 0) {
      console.log('Views data loaded:', viewsData);
      console.log('Available views:', Object.keys(viewsData));
      chartOptions.forEach(option => {
        const data = viewsData[option.value];
        const recordCount = data?.length || 0;
        console.log(`${option.value}: ${recordCount} records`);
        if (recordCount === 0) {
          console.warn(`⚠️  View ${option.value} exists but has no data`);
        }
      });
    }
  }, [viewsData]);

  const chartOptions = [
    { value: 'top_constructors_by_points', label: 'Top Constructors by Points', type: 'bar' },
    { value: 'driver_season_performance', label: 'Driver Season Performance', type: 'line' },
    { value: 'circuit_statistics', label: 'Circuit Statistics', type: 'bar' },
    { value: 'pit_stop_analysis', label: 'Pit Stop Analysis', type: 'line' },
    { value: 'qualifying_vs_race_performance', label: 'Qualifying vs Race Performance', type: 'bar' },
    { value: 'race_winners_and_fastest_lap_drivers', label: 'Race Winners & Fastest Laps', type: 'bar' }
  ];

  const generateChartData = (viewName: string) => {
    const data = viewsData[viewName];
    if (!data || data.length === 0) return null;

    switch (viewName) {
      case 'top_constructors_by_points':
        const topConstructors = data.slice(0, 10);
        const topConstructorsData = topConstructors.map((item: any) => ({
          name: item.constructor_name,
          points: item.total_points
        }));
        return {
          type: 'bar',
          rawData: topConstructorsData,
          data: {
            labels: topConstructors.map((item: any) => item.constructor_name),
            datasets: [{
              label: 'Total Points',
              data: topConstructors.map((item: any) => parseFloat(item.total_points) || 0),
              backgroundColor: 'rgba(220, 38, 38, 0.8)',
              borderColor: 'rgba(220, 38, 38, 1)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Top 10 Constructors by Total Points' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Total Points' } },
              x: { title: { display: true, text: 'Constructor' } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      case 'driver_season_performance':
        const years = Array.from(new Set(data.map((item: any) => item.year))).sort();
        const avgPoints = years.map(year => {
          const yearData = data.filter((item: any) => item.year === year);
          return yearData.length > 0 
            ? yearData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_points) || 0), 0) / yearData.length
            : 0;
        });
        const yearDataMap = years.map((year, idx) => ({
          year,
          avgPoints: avgPoints[idx]
        }));
        return {
          type: 'line',
          rawData: yearDataMap,
          data: {
            labels: years,
            datasets: [{
              label: 'Average Points per Season',
              data: avgPoints,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Average Driver Points Across Seasons' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Average Points' } },
              x: { title: { display: true, text: 'Year' } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      case 'circuit_statistics':
        const topCircuits = data.slice(0, 10);
        return {
          type: 'bar',
          rawData: topCircuits,
          data: {
            labels: topCircuits.map((item: any) => item.circuit_name),
            datasets: [
              {
                label: 'Total Races',
                data: topCircuits.map((item: any) => parseInt(item.total_races) || 0),
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2
              },
              {
                label: 'Unique Drivers',
                data: topCircuits.map((item: any) => parseInt(item.unique_drivers) || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Top 10 Circuits - Race & Driver Statistics' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
              x: { title: { display: true, text: 'Circuit' } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      case 'pit_stop_analysis':
        // Group by driver and calculate average pit stop duration
        const driverPitStops: Record<string, { count: number; totalMs: number }> = {};
        data.forEach((item: any) => {
          const driverName = `${item.forename} ${item.surname}`;
          if (!driverPitStops[driverName]) {
            driverPitStops[driverName] = { count: 0, totalMs: 0 };
          }
          if (item.pit_duration_ms) {
            driverPitStops[driverName].count++;
            driverPitStops[driverName].totalMs += parseInt(item.pit_duration_ms) || 0;
          }
        });
        
        const topDrivers = Object.entries(driverPitStops)
          .map(([name, stats]) => ({
            name,
            avgMs: stats.count > 0 ? stats.totalMs / stats.count : 0
          }))
          .sort((a, b) => a.avgMs - b.avgMs)
          .slice(0, 15);
        
        return {
          type: 'line',
          rawData: topDrivers,
          data: {
            labels: topDrivers.map(d => d.name),
            datasets: [{
              label: 'Average Pit Stop Duration (ms)',
              data: topDrivers.map(d => d.avgMs),
              borderColor: 'rgba(16, 185, 129, 1)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Top 15 Drivers - Average Pit Stop Duration' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Duration (milliseconds)' } },
              x: { title: { display: true, text: 'Driver' }, ticks: { maxRotation: 45, minRotation: 45 } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      case 'qualifying_vs_race_performance':
        // Group by driver and calculate average position gain/loss
        const driverPerformance: Record<string, { count: number; totalGain: number }> = {};
        data.forEach((item: any) => {
          const driverName = `${item.forename} ${item.surname}`;
          if (!driverPerformance[driverName]) {
            driverPerformance[driverName] = { count: 0, totalGain: 0 };
          }
          if (item.position_gain_loss !== null && item.position_gain_loss !== undefined) {
            driverPerformance[driverName].count++;
            driverPerformance[driverName].totalGain += parseFloat(item.position_gain_loss) || 0;
          }
        });
        
        const topPerformers = Object.entries(driverPerformance)
          .map(([name, stats]) => ({
            name,
            avgGain: stats.count > 0 ? stats.totalGain / stats.count : 0
          }))
          .sort((a, b) => b.avgGain - a.avgGain)
          .slice(0, 10);
        
        return {
          type: 'bar',
          rawData: topPerformers,
          data: {
            labels: topPerformers.map(d => d.name),
            datasets: [{
              label: 'Average Position Gain/Loss',
              data: topPerformers.map(d => d.avgGain),
              backgroundColor: topPerformers.map(d => 
                d.avgGain > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
              ),
              borderColor: topPerformers.map(d => 
                d.avgGain > 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
              ),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Top 10 Drivers - Qualifying vs Race Position Change' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { title: { display: true, text: 'Average Position Change' } },
              x: { title: { display: true, text: 'Driver' }, ticks: { maxRotation: 45, minRotation: 45 } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      case 'race_winners_and_fastest_lap_drivers':
        const achievementCounts: Record<string, { wins: number; fastestLaps: number }> = {};
        data.forEach((item: any) => {
          const driverName = `${item.forename} ${item.surname}`;
          if (!achievementCounts[driverName]) {
            achievementCounts[driverName] = { wins: 0, fastestLaps: 0 };
          }
          if (item.achievement_type === 'Race Winner') {
            achievementCounts[driverName].wins++;
          } else if (item.achievement_type === 'Fastest Lap') {
            achievementCounts[driverName].fastestLaps++;
          }
        });
        
        const topAchievers = Object.entries(achievementCounts)
          .map(([name, stats]) => ({
            name,
            wins: stats.wins,
            fastestLaps: stats.fastestLaps,
            total: stats.wins + stats.fastestLaps
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);
        
        return {
          type: 'bar',
          rawData: topAchievers,
          data: {
            labels: topAchievers.map(d => d.name),
            datasets: [
              {
                label: 'Race Wins',
                data: topAchievers.map(d => d.wins),
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2
              },
              {
                label: 'Fastest Laps',
                data: topAchievers.map(d => d.fastestLaps),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Top 10 Drivers - Race Wins & Fastest Laps' },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
              x: { title: { display: true, text: 'Driver' }, ticks: { maxRotation: 45, minRotation: 45 } }
            },
            interaction: {
              intersect: false,
              mode: 'index' as const
            }
          }
        };
      
      default:
        return null;
    }
  };

  const handleChartSelect = (viewName: string) => {
    setSelectedChart(viewName);
    setChartData(generateChartData(viewName));
  };

  const handleChartClick = (event: any) => {
    if (!chartRef.current || !chartData?.rawData) return;

    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length === 0) return;

    const element = elements[0];
    const index = element.index;
    const rawData = chartData.rawData[index];

    if (!rawData) return;

    // Handle different chart types
    if (selectedChart === 'top_constructors_by_points') {
      alert(`Constructor: ${rawData.name}\nTotal Points: ${rawData.points}`);
    } else if (selectedChart === 'driver_season_performance') {
      alert(`Year: ${rawData.year}\nAverage Points: ${rawData.avgPoints.toFixed(2)}`);
    } else if (selectedChart === 'circuit_statistics') {
      alert(`Circuit: ${rawData.circuit_name}\nTotal Races: ${rawData.total_races}\nUnique Drivers: ${rawData.unique_drivers}`);
    } else if (selectedChart === 'pit_stop_analysis') {
      alert(`Driver: ${rawData.name}\nAverage Pit Stop Duration: ${rawData.avgMs.toFixed(2)} ms`);
    } else if (selectedChart === 'qualifying_vs_race_performance') {
      const gainLoss = rawData.avgGain > 0 ? 'gained' : 'lost';
      alert(`Driver: ${rawData.name}\nAverage Position ${gainLoss}: ${Math.abs(rawData.avgGain).toFixed(2)} positions`);
    } else if (selectedChart === 'race_winners_and_fastest_lap_drivers') {
      alert(`Driver: ${rawData.name}\nRace Wins: ${rawData.wins}\nFastest Laps: ${rawData.fastestLaps}\nTotal Achievements: ${rawData.total}`);
    }
  };


  const getExternalData = async (type: string) => {
    try {
      setLoading(true);
      setExternalDataType(type);
      const response = await api.get(`/external/${type}`);
      if (response.data.success) {
        setExternalData(response.data.data);
        console.log(`${type} data:`, response.data.data);
      }
    } catch (error: any) {
      console.error(`Failed to fetch ${type} data:`, error);
      setExternalData({ error: error.response?.data?.error || 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const getStoredData = async (type: string, param?: string) => {
    try {
      setLoading(true);
      setExternalDataType(`stored_${type}`);
      let endpoint = '';
      if (type === 'weather' && param) {
        endpoint = `/external/weather/history/${param}`;
      } else if (type === 'sentiment' && param) {
        endpoint = `/external/sentiment/analysis/${param}`;
      } else if (type === 'news') {
        endpoint = '/external/news/stored';
      }
      
      if (endpoint) {
        const response = await api.get(endpoint);
        if (response.data.success) {
          setExternalData(response.data.data);
        }
      }
    } catch (error: any) {
      console.error(`Failed to fetch stored ${type} data:`, error);
      setExternalData({ error: error.response?.data?.error || 'Failed to fetch stored data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="views-layout" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <div className={`views-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Analytics</h2>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '⟩' : '⟨'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <p className="sidebar-subtitle">
              Select a chart to visualize
            </p>

            {dataError && (
              <div className="alert-error mx-4 my-2">
                {dataError}
              </div>
            )}

            <div className="sidebar-views">
              {chartOptions.map((option) => {
                const recordCount = viewsData[option.value]?.length || 0;
                const hasData = recordCount > 0;
                return (
                  <button
                    key={option.value}
                    onClick={() => hasData && handleChartSelect(option.value)}
                    disabled={!hasData}
                    className={`view-item ${selectedChart === option.value ? 'active' : ''} ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="view-item-name">{option.label}</div>
                      <div className="view-item-description">{option.type.toUpperCase()} Chart</div>
                      <div className="view-item-count">
                        {hasData ? `${recordCount} records` : 'No data'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="views-content">
        <div className="content-header">
          <div>
            <h1 className="content-title">Analytics & Data Visualization</h1>
            <p className="content-subtitle">
              Explore Formula 1 data through interactive charts and visualizations
            </p>
          </div>
        </div>

        <div className="content-body">
      <div className="bg-white rounded-lg shadow mx-6 my-4" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">

            {chartData && (
              <span className="text-sm text-gray-500 font-medium">
                {chartOptions.find(opt => opt.value === selectedChart)?.label}
              </span>
            )}
          </div>
          {dataLoading ? (
            <div className="bg-gray-100 rounded-lg text-center flex-1 flex items-center justify-center">
              <div>
                <div className="loading mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chart data...</p>
              </div>
            </div>
          ) : chartData ? (
            <div className="chart-container flex-1" style={{ position: 'relative', width: '100%' }}>
              {chartData.type === 'bar' && (
                <Bar ref={chartRef} data={chartData.data} options={chartData.options} onClick={handleChartClick} />
              )}
              {chartData.type === 'line' && (
                <Line ref={chartRef} data={chartData.data} options={chartData.options} onClick={handleChartClick} />
              )}
              {chartData.type === 'pie' && (
                <Pie ref={chartRef} data={chartData.data} options={chartData.options} onClick={handleChartClick} />
              )}
              {chartData.type === 'doughnut' && (
                <Doughnut ref={chartRef} data={chartData.data} options={chartData.options} onClick={handleChartClick} />
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg text-center flex-1 flex items-center justify-center">
              <div>
                <p className="text-gray-600 text-lg mb-2">Select a chart option to view data visualization</p>
                <p className="text-sm text-gray-500">Choose from the available charts on the left to see interactive visualizations</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default Analytics;
