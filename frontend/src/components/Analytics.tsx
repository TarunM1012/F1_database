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
  const [upcomingRaceWeather, setUpcomingRaceWeather] = useState<any>(null);
  const [loadingRaceWeather, setLoadingRaceWeather] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Only fetch once on mount
    fetchViewsData();
    fetchUpcomingRaceWeather();
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

  const fetchUpcomingRaceWeather = async () => {
    try {
      setLoadingRaceWeather(true);
      const response = await api.get('/external/weather/upcoming-race');
      if (response.data.success) {
        setUpcomingRaceWeather(response.data.data);
        console.log('Upcoming race weather:', response.data.data);
      } else {
        setUpcomingRaceWeather(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch upcoming race weather:', error);
      setUpcomingRaceWeather(null);
    } finally {
      setLoadingRaceWeather(false);
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics & Data Visualization</h1>
        <p className="text-gray-600">
          Explore Formula 1 data through charts, analytics, and external integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Chart</h2>
          {dataError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <p className="font-medium">Error loading data:</p>
              <p className="text-sm mb-3">{dataError}</p>
              <button
                onClick={fetchViewsData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry Loading Data
              </button>
            </div>
          )}
          {dataLoading ? (
            <div className="text-center py-8">
              <div className="loading mx-auto mb-2"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chartOptions.map((option) => {
                const recordCount = viewsData[option.value]?.length || 0;
                const hasData = recordCount > 0;
                return (
                  <button
                    key={option.value}
                    onClick={() => hasData && handleChartSelect(option.value)}
                    disabled={!hasData}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      selectedChart === option.value 
                        ? 'border-red-500 bg-red-50 shadow-md' 
                        : hasData
                        ? 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{option.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {hasData ? `${recordCount} records available` : 'No data available'}
                        </p>
                      </div>
                      {hasData && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                          {option.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Visualization</h2>
            {chartData && (
              <span className="text-sm text-gray-500 font-medium">
                {chartOptions.find(opt => opt.value === selectedChart)?.label}
              </span>
            )}
          </div>
          {dataLoading ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div className="loading mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chart data...</p>
              </div>
            </div>
          ) : chartData ? (
            <div className="chart-container" style={{ position: 'relative', height: '500px', width: '100%' }}>
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
            <div className="bg-gray-100 p-8 rounded-lg text-center" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <p className="text-gray-600 text-lg mb-2">Select a chart option to view data visualization</p>
                <p className="text-sm text-gray-500">Choose from the available charts on the left to see interactive visualizations</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Race Weather */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Race Weekend Weather</h2>
            <button
              onClick={fetchUpcomingRaceWeather}
              disabled={loadingRaceWeather}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loadingRaceWeather ? 'Loading...' : 'Refresh'}
            </button>
        </div>
        
        {loadingRaceWeather ? (
          <div className="text-center py-8">
            <div className="loading mx-auto mb-2"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        ) : upcomingRaceWeather && upcomingRaceWeather.race ? (
            <div className="space-y-4">
              {/* Race Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{upcomingRaceWeather.race.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Circuit:</span>
                    <p className="font-medium text-gray-900">{upcomingRaceWeather.race.circuit}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium text-gray-900">{upcomingRaceWeather.race.location || upcomingRaceWeather.race.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <p className="font-medium text-gray-900">{upcomingRaceWeather.race.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Race Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(upcomingRaceWeather.race.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Weather */}
              {upcomingRaceWeather.current && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h4 className="text-lg font-semibold mb-4">Current Weather Conditions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-blue-100 text-sm">Temperature</span>
                      <p className="text-2xl font-bold">{upcomingRaceWeather.current.temperature?.toFixed(1)}°C</p>
                    </div>
                    <div>
                      <span className="text-blue-100 text-sm">Condition</span>
                      <p className="text-lg font-medium capitalize">{upcomingRaceWeather.current.description}</p>
                    </div>
                    <div>
                      <span className="text-blue-100 text-sm">Humidity</span>
                      <p className="text-lg font-medium">{upcomingRaceWeather.current.humidity}%</p>
                    </div>
                    <div>
                      <span className="text-blue-100 text-sm">Wind Speed</span>
                      <p className="text-lg font-medium">{(upcomingRaceWeather.current.wind_speed * 3.6).toFixed(1)} km/h</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekend Forecast */}
              {upcomingRaceWeather.forecast && upcomingRaceWeather.forecast.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Weekend Forecast</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingRaceWeather.forecast.map((day: any, index: number) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">High:</span>
                            <span className="font-medium text-gray-900">{day.maxtemp}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Low:</span>
                            <span className="font-medium text-gray-900">{day.mintemp}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Condition:</span>
                            <span className="font-medium text-gray-900 capitalize">{day.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium text-gray-900">{day.humidity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Wind:</span>
                            <span className="font-medium text-gray-900">{(day.wind_speed * 3.6).toFixed(1)} km/h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly Forecast (if available) */}
              {upcomingRaceWeather.forecasts && upcomingRaceWeather.forecasts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Detailed Forecast</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Time</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Temp</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Condition</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Humidity</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Wind</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingRaceWeather.forecasts.map((forecast: any, index: number) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(forecast.datetime).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{forecast.temperature?.toFixed(1)}°C</td>
                            <td className="px-4 py-2 text-sm text-gray-700 capitalize">{forecast.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{forecast.humidity}%</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{(forecast.wind_speed * 3.6).toFixed(1)} km/h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No upcoming races found or weather data unavailable.</p>
              <p className="text-sm mt-2">Make sure you have races with future dates in your database.</p>
            </div>
          )}
      </div>


    </div>
  );
};

export default Analytics;
