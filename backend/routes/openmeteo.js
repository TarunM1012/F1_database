const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../auth');
const { getNextRaces } = require('../utils/calendarParser');

// Apply authentication middleware
router.use(verifyToken);

/**
 * Geocode a location using Open-Meteo Geocoding API
 */
async function geocodeLocation(location) {
    try {
        const response = await axios.get(
            'https://geocoding-api.open-meteo.com/v1/search',
            {
                params: {
                    name: location,
                    count: 1,
                    language: 'en',
                    format: 'json'
                },
                timeout: 5000
            }
        );
        
        if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            return {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                country: result.country,
                admin1: result.admin1 || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

/**
 * Get weather forecast for a location using Open-Meteo Forecast API
 */
async function getWeatherForecast(latitude, longitude, startDate, endDate) {
    try {
        const response = await axios.get(
            'https://api.open-meteo.com/v1/forecast',
            {
                params: {
                    latitude: latitude,
                    longitude: longitude,
                    start_date: startDate,
                    end_date: endDate,
                    hourly: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
                    timezone: 'auto'
                },
                timeout: 5000
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Weather forecast error:', error.message);
        throw error;
    }
}

/**
 * Convert weather code to description
 */
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
}

/**
 * Get weather for next N races
 */
router.get('/weather/next-races', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 2;
        const races = getNextRaces(count);
        
        if (races.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No upcoming races found'
            });
        }
        
        const weatherData = [];
        
        for (const race of races) {
            try {
                // Geocode the location
                const locationData = await geocodeLocation(race.location || race.country);
                
                if (!locationData) {
                    weatherData.push({
                        race: {
                            name: race.name,
                            date: race.date,
                            location: race.location,
                            country: race.country
                        },
                        error: 'Location not found'
                    });
                    continue;
                }
                
                // Calculate date range (race date and 2 days before/after for weekend context)
                const raceDate = new Date(race.date);
                const startDate = new Date(raceDate);
                startDate.setDate(startDate.getDate() - 2);
                const endDate = new Date(raceDate);
                endDate.setDate(endDate.getDate() + 1);
                
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];
                
                // Get weather forecast
                const forecast = await getWeatherForecast(
                    locationData.latitude,
                    locationData.longitude,
                    startDateStr,
                    endDateStr
                );
                
                // Process daily forecast
                const dailyForecast = [];
                if (forecast.daily) {
                    for (let i = 0; i < forecast.daily.time.length; i++) {
                        dailyForecast.push({
                            date: forecast.daily.time[i],
                            weather_code: forecast.daily.weather_code[i],
                            weather_description: getWeatherDescription(forecast.daily.weather_code[i]),
                            temp_max: forecast.daily.temperature_2m_max[i],
                            temp_min: forecast.daily.temperature_2m_min[i],
                            precipitation: forecast.daily.precipitation_sum[i],
                            wind_speed_max: forecast.daily.wind_speed_10m_max[i]
                        });
                    }
                }
                
                // Get hourly forecast for race day
                const raceDayHourly = [];
                if (forecast.hourly) {
                    const raceDateStr = raceDate.toISOString().split('T')[0];
                    for (let i = 0; i < forecast.hourly.time.length; i++) {
                        const hourTime = forecast.hourly.time[i];
                        if (hourTime.startsWith(raceDateStr)) {
                            raceDayHourly.push({
                                time: hourTime,
                                temperature: forecast.hourly.temperature_2m[i],
                                humidity: forecast.hourly.relative_humidity_2m[i],
                                weather_code: forecast.hourly.weather_code[i],
                                weather_description: getWeatherDescription(forecast.hourly.weather_code[i]),
                                wind_speed: forecast.hourly.wind_speed_10m[i],
                                precipitation_probability: forecast.hourly.precipitation_probability[i]
                            });
                        }
                    }
                }
                
                weatherData.push({
                    race: {
                        name: race.name,
                        date: race.date,
                        location: race.location,
                        country: race.country,
                        geocoded_location: locationData.name,
                        coordinates: {
                            latitude: locationData.latitude,
                            longitude: locationData.longitude
                        }
                    },
                    daily_forecast: dailyForecast,
                    race_day_hourly: raceDayHourly,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`Error fetching weather for ${race.name}:`, error.message);
                weatherData.push({
                    race: {
                        name: race.name,
                        date: race.date,
                        location: race.location,
                        country: race.country
                    },
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            data: weatherData
        });
        
    } catch (error) {
        console.error('Weather API error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch weather data'
        });
    }
});

/**
 * Get weather for a specific race by index
 */
router.get('/weather/race/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index) || 0;
        console.log(`🌤️  Fetching weather for race index: ${index}`);
        
        let races;
        try {
            races = getNextRaces(); // Get all upcoming races
            console.log(`📅 getNextRaces() returned ${races ? races.length : 0} races`);
        } catch (parseError) {
            console.error('❌ Error calling getNextRaces():', parseError.message);
            return res.status(500).json({
                success: false,
                error: `Failed to parse calendar: ${parseError.message}`,
                total_races: 0,
                current_index: index
            });
        }
        
        if (!races || races.length === 0) {
            console.log('⚠️  No races found, returning 404');
            return res.status(404).json({
                success: false,
                error: 'No upcoming races found in calendar',
                total_races: 0,
                current_index: index
            });
        }
        
        if (index >= races.length || index < 0) {
            return res.status(404).json({
                success: false,
                error: `Race index out of range. Available races: 0-${races.length - 1}`,
                total_races: races.length,
                current_index: index
            });
        }
        
        const race = races[index];
        
        // Geocode the location
        const locationData = await geocodeLocation(race.location || race.country);
        
        if (!locationData) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }
        
        // Calculate date range
        const raceDate = new Date(race.date);
        const startDate = new Date(raceDate);
        startDate.setDate(startDate.getDate() - 2);
        const endDate = new Date(raceDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Get weather forecast
        const forecast = await getWeatherForecast(
            locationData.latitude,
            locationData.longitude,
            startDateStr,
            endDateStr
        );
        
        // Process daily forecast
        const dailyForecast = [];
        if (forecast.daily) {
            for (let i = 0; i < forecast.daily.time.length; i++) {
                dailyForecast.push({
                    date: forecast.daily.time[i],
                    weather_code: forecast.daily.weather_code[i],
                    weather_description: getWeatherDescription(forecast.daily.weather_code[i]),
                    temp_max: forecast.daily.temperature_2m_max[i],
                    temp_min: forecast.daily.temperature_2m_min[i],
                    precipitation: forecast.daily.precipitation_sum[i],
                    wind_speed_max: forecast.daily.wind_speed_10m_max[i]
                });
            }
        }
        
        // Get hourly forecast for race day
        const raceDayHourly = [];
        if (forecast.hourly) {
            const raceDateStr = raceDate.toISOString().split('T')[0];
            for (let i = 0; i < forecast.hourly.time.length; i++) {
                const hourTime = forecast.hourly.time[i];
                if (hourTime.startsWith(raceDateStr)) {
                    raceDayHourly.push({
                        time: hourTime,
                        temperature: forecast.hourly.temperature_2m[i],
                        humidity: forecast.hourly.relative_humidity_2m[i],
                        weather_code: forecast.hourly.weather_code[i],
                        weather_description: getWeatherDescription(forecast.hourly.weather_code[i]),
                        wind_speed: forecast.hourly.wind_speed_10m[i],
                        precipitation_probability: forecast.hourly.precipitation_probability[i]
                    });
                }
            }
        }
        
        res.json({
            success: true,
            data: {
                race: {
                    name: race.name,
                    date: race.date,
                    location: race.location,
                    country: race.country,
                    geocoded_location: locationData.name,
                    coordinates: {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                    }
                },
                daily_forecast: dailyForecast,
                race_day_hourly: raceDayHourly,
                timestamp: new Date().toISOString()
            },
            total_races: races.length,
            current_index: index
        });
        
    } catch (error) {
        console.error('Weather API error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch weather data'
        });
    }
});

module.exports = router;

