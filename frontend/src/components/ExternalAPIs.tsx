import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface RaceWeather {
  race: {
    name: string;
    date: string;
    location: string;
    country: string;
    geocoded_location?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  daily_forecast?: Array<{
    date: string;
    weather_code: number;
    weather_description: string;
    temp_max: number;
    temp_min: number;
    precipitation: number;
    wind_speed_max: number;
  }>;
  race_day_hourly?: Array<{
    time: string;
    temperature: number;
    humidity: number;
    weather_code: number;
    weather_description: string;
    wind_speed: number;
    precipitation_probability: number;
  }>;
  error?: string;
  timestamp?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  link: string;
  image_url?: string;
  source: string;
  author?: string;
  published_at: string;
  category?: string;
  keywords?: string[];
}

const ExternalAPIs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weather' | 'news'>('weather');
  const [weatherData, setWeatherData] = useState<RaceWeather[]>([]);
  const [currentRaceIndex, setCurrentRaceIndex] = useState(0);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [totalRaces, setTotalRaces] = useState(0);
  const [includePastRaces, setIncludePastRaces] = useState(false);

  // Fetch weather data for next races
  useEffect(() => {
    if (activeTab === 'weather') {
      fetchWeatherData();
    }
  }, [activeTab, includePastRaces]);

  // Fetch news data
  useEffect(() => {
    if (activeTab === 'news') {
      fetchNewsData();
    }
  }, [activeTab]);

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      
      // Fetch weather for the first race (index 0)
      await fetchWeatherForRace(0);
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      setWeatherError(error.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchWeatherForRace = async (index: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const includePastParam = includePastRaces ? '?include_past=true' : '';
      const response = await api.get(`/openmeteo/weather/race/${index}${includePastParam}`);
      if (response.data.success) {
        // Replace the weather data with the fetched race
        setWeatherData([response.data.data]);
        setCurrentRaceIndex(index);
        setTotalRaces(response.data.total_races || 0);
      }
    } catch (error: any) {
      console.error('Error fetching weather for race:', error);
      setWeatherError(error.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchNewsData = async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      const response = await api.get('/newsdata/news/latest?limit=10');
      if (response.data.success) {
        setNewsArticles(response.data.data || []);
        setCurrentNewsIndex(0);
      } else {
        setNewsError('Failed to fetch news');
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      setNewsError(error.response?.data?.error || 'Failed to fetch news');
    } finally {
      setNewsLoading(false);
    }
  };

  const nextRace = () => {
    if (currentRaceIndex < totalRaces - 1) {
      const nextIndex = currentRaceIndex + 1;
      fetchWeatherForRace(nextIndex);
    }
  };

  const prevRace = () => {
    if (currentRaceIndex > 0) {
      const prevIndex = currentRaceIndex - 1;
      fetchWeatherForRace(prevIndex);
    }
  };

  const togglePastRaces = () => {
    setIncludePastRaces(!includePastRaces);
    setCurrentRaceIndex(0); // Reset to first race when toggling
  };

  const nextNews = () => {
    if (currentNewsIndex < newsArticles.length - 1) {
      setCurrentNewsIndex(currentNewsIndex + 1);
    }
  };

  const prevNews = () => {
    if (currentNewsIndex > 0) {
      setCurrentNewsIndex(currentNewsIndex - 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 86) return '🌦️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>External APIs</h1>
          <p style={{ color: '#ffffff' }}>Weather forecasts and trending F1 news from external sources</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab('weather')}
                  style={{ color: activeTab === 'weather' ? '#991b1b' : '#1f2937' }}
                  className={`py-4 px-8 rounded-xl font-bold text-base transition-all duration-200 ${
                    activeTab === 'weather'
                      ? 'bg-red-100 shadow-xl border-2 border-red-300 transform scale-105'
                      : 'bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  🌤️ Race Weather
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  style={{ color: activeTab === 'news' ? '#991b1b' : '#1f2937' }}
                  className={`py-4 px-8 rounded-xl font-bold text-base transition-all duration-200 ${
                    activeTab === 'news'
                      ? 'bg-red-100 shadow-xl border-2 border-red-300 transform scale-105'
                      : 'bg-white hover:bg-gray-50 shadow-lg border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  📰 Trending News
                </button>
              </nav>
              {activeTab === 'weather' && (
                <button
                  onClick={togglePastRaces}
                  style={{ color: includePastRaces ? '#991b1b' : '#1f2937' }}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg border-2 ${
                    includePastRaces
                      ? 'bg-red-100 border-red-300 hover:shadow-xl'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {includePastRaces ? '📅 Show Upcoming Only' : '📅 Include Past Races'}
                </button>
              )}
            </div>
          </div>

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div>
            {weatherLoading && weatherData.length === 0 ? (
              <div className="text-center py-12">
                <div className="loading mx-auto mb-4"></div>
                <p className="text-gray-700">Loading weather data...</p>
              </div>
            ) : weatherError ? (
              <div className="card">
                <div className="alert alert-error">
                  <p>{weatherError}</p>
                  <button onClick={fetchWeatherData} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors mt-4">
                    Retry
                  </button>
                </div>
              </div>
            ) : weatherData.length === 0 ? (
              <div className="card">
                <p className="text-gray-700">No weather data available</p>
              </div>
            ) : (
              <div>
                {weatherData[0] && (
                  <div className="card mb-6">
                    <div className="mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {weatherData[0].race.name}
                        </h2>
                        <p className="text-gray-600">
                          {formatDate(weatherData[0].race.date)}
                        </p>
                        <p className="text-gray-600">
                          {weatherData[0].race.location}, {weatherData[0].race.country}
                        </p>
                        {weatherData[0].race.geocoded_location && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {weatherData[0].race.geocoded_location}
                          </p>
                        )}
                      </div>
                    </div>

                    {weatherData[currentRaceIndex].error ? (
                      <div className="alert alert-error">
                        <p>{weatherData[currentRaceIndex].error}</p>
                      </div>
                    ) : (
                      <>
                        {/* Daily Forecast */}
                        {weatherData[currentRaceIndex].daily_forecast && weatherData[currentRaceIndex].daily_forecast!.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Forecast</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {weatherData[currentRaceIndex].daily_forecast!.map((day, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {formatDate(day.date)}
                                    </span>
                                    <span className="text-2xl">{getWeatherIcon(day.weather_code)}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{day.weather_description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">
                                      {Math.round(day.temp_max)}°C
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {Math.round(day.temp_min)}°C
                                    </span>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <div>💨 Wind: {Math.round(day.wind_speed_max)} km/h</div>
                                    {day.precipitation > 0 && (
                                      <div>🌧️ Rain: {day.precipitation.toFixed(1)} mm</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Race Day Hourly Forecast */}
                        {weatherData[currentRaceIndex].race_day_hourly && weatherData[currentRaceIndex].race_day_hourly!.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Race Day Hourly Forecast</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {weatherData[currentRaceIndex].race_day_hourly!.slice(0, 12).map((hour, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white text-center">
                                  <div className="text-xs text-gray-600 mb-1">
                                    {formatTime(hour.time)}
                                  </div>
                                  <div className="text-xl mb-1">{getWeatherIcon(hour.weather_code)}</div>
                                  <div className="text-sm font-semibold text-gray-900 mb-1">
                                    {Math.round(hour.temperature)}°C
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    💧 {hour.humidity}%
                                  </div>
                                  {hour.precipitation_probability > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      {hour.precipitation_probability}% 🌧️
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Race Navigation Info */}
                <div className="flex justify-center items-center gap-6 mt-6">
                  <button
                    onClick={prevRace}
                    disabled={currentRaceIndex === 0}
                    style={{ color: currentRaceIndex === 0 ? '#6b7280' : '#991b1b' }}
                    className={`font-bold py-4 px-8 rounded-xl transition-all duration-200 min-w-[150px] flex items-center justify-center gap-3 border-2 text-base shadow-xl ${
                      currentRaceIndex === 0
                        ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                        : 'bg-red-100 border-red-300 hover:bg-red-200 hover:shadow-2xl transform hover:scale-105'
                    }`}
                  >
                    <span className="text-xl font-bold">←</span>
                    <span>Previous</span>
                  </button>
                  <div className="text-sm text-gray-700 font-semibold px-4">
                    Race {currentRaceIndex + 1} of {totalRaces}
                  </div>
                  <button
                    onClick={nextRace}
                    disabled={currentRaceIndex >= totalRaces - 1}
                    style={{ color: currentRaceIndex >= totalRaces - 1 ? '#6b7280' : '#991b1b' }}
                    className={`font-bold py-4 px-8 rounded-xl transition-all duration-200 min-w-[150px] flex items-center justify-center gap-3 border-2 text-base shadow-xl ${
                      currentRaceIndex >= totalRaces - 1
                        ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                        : 'bg-red-100 border-red-300 hover:bg-red-200 hover:shadow-2xl transform hover:scale-105'
                    }`}
                  >
                    <span>Next</span>
                    <span className="text-xl font-bold">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div>
            {newsLoading && newsArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="loading mx-auto mb-4"></div>
                <p className="text-gray-700">Loading news...</p>
              </div>
            ) : newsError ? (
              <div className="card">
                <div className="alert alert-error">
                  <p>{newsError}</p>
                  <button onClick={fetchNewsData} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors mt-4">
                    Retry
                  </button>
                </div>
              </div>
            ) : newsArticles.length === 0 ? (
              <div className="card">
                <p className="text-gray-700">No news articles available</p>
              </div>
            ) : (
              <div>
                {newsArticles[currentNewsIndex] && (
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Image Section */}
                    {newsArticles[currentNewsIndex].image_url && (
                      <div className="w-full h-64 bg-gray-200 overflow-hidden">
                        <img
                          src={newsArticles[currentNewsIndex].image_url}
                          alt={newsArticles[currentNewsIndex].title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Header with Navigation */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                            {newsArticles[currentNewsIndex].title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <span className="text-red-600">📰</span>
                              {newsArticles[currentNewsIndex].source}
                            </span>
                            {newsArticles[currentNewsIndex].author && (
                              <span className="flex items-center gap-1">
                                <span className="text-red-600">✍️</span>
                                {newsArticles[currentNewsIndex].author}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <span className="text-red-600">📅</span>
                              {formatDate(newsArticles[currentNewsIndex].published_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed text-base mb-4">
                          {newsArticles[currentNewsIndex].description}
                        </p>
                        {(() => {
                          const content = newsArticles[currentNewsIndex].content;
                          return content && content !== newsArticles[currentNewsIndex].description && (
                            <p className="text-gray-600 leading-relaxed text-base">
                              {content.substring(0, 500)}
                              {content.length > 500 && '...'}
                            </p>
                          );
                        })()}
                      </div>

                      {/* Keywords */}
                      {newsArticles[currentNewsIndex].keywords && newsArticles[currentNewsIndex].keywords!.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                          {newsArticles[currentNewsIndex].keywords!.slice(0, 5).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200 mt-6">
                        <button
                          onClick={prevNews}
                          disabled={currentNewsIndex === 0}
                          style={{ color: currentNewsIndex === 0 ? '#6b7280' : '#991b1b' }}
                          className={`font-bold py-4 px-8 rounded-xl transition-all duration-200 min-w-[150px] flex items-center justify-center gap-3 border-2 text-base shadow-xl ${
                            currentNewsIndex === 0
                              ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                              : 'bg-red-100 border-red-300 hover:bg-red-200 hover:shadow-2xl transform hover:scale-105'
                          }`}
                        >
                          <span className="text-xl font-bold">←</span>
                          <span>Previous</span>
                        </button>
                        <div className="text-sm text-gray-700 font-semibold px-4">
                          Article {currentNewsIndex + 1} of {newsArticles.length}
                        </div>
                        <button
                          onClick={nextNews}
                          disabled={currentNewsIndex >= newsArticles.length - 1}
                          style={{ color: currentNewsIndex >= newsArticles.length - 1 ? '#6b7280' : '#991b1b' }}
                          className={`font-bold py-4 px-8 rounded-xl transition-all duration-200 min-w-[150px] flex items-center justify-center gap-3 border-2 text-base shadow-xl ${
                            currentNewsIndex >= newsArticles.length - 1
                              ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                              : 'bg-red-100 border-red-300 hover:bg-red-200 hover:shadow-2xl transform hover:scale-105'
                          }`}
                        >
                          <span>Next</span>
                          <span className="text-xl font-bold">→</span>
                        </button>
                      </div>
                      {newsArticles[currentNewsIndex].link && (
                        <div className="flex justify-center mt-4" style={{ position: 'relative', zIndex: 10 }}>
                          <a
                            href={newsArticles[currentNewsIndex].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 inline-flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-gray-700 text-base"
                            style={{ display: 'inline-flex', visibility: 'visible', opacity: 1 }}
                          >
                            <span>Read Full Article</span>
                            <span className="text-xl font-bold">→</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ExternalAPIs;

