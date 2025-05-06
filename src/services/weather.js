import axios from 'axios';

// API configuration
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL;

// Helper to convert Kelvin to Celsius
const kelvinToCelsius = (kelvin) => {
  return Math.round(kelvin - 273.15);
};

// Process weather data into a standardized format
const processWeatherData = (data) => {
  return {
    location: data.name,
    country: data.sys.country,
    temperature: kelvinToCelsius(data.main.temp),
    feelsLike: kelvinToCelsius(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    timestamp: new Date(data.dt * 1000)
  };
};

// Get current weather by coordinates
export const getCurrentWeatherByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY
      }
    });
    
    return processWeatherData(response.data);
  } catch (error) {
    console.error('Error fetching current weather by coordinates:', error);
    throw error;
  }
};

// Get current weather by city name
export const getCurrentWeatherByCity = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY
      }
    });
    
    return processWeatherData(response.data);
  } catch (error) {
    console.error('Error fetching current weather by city:', error);
    throw error;
  }
};

// Get current weather by zip/postal code
export const getCurrentWeatherByZip = async (zipCode, countryCode = 'us') => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        zip: `${zipCode},${countryCode}`,
        appid: API_KEY
      }
    });
    
    return processWeatherData(response.data);
  } catch (error) {
    console.error('Error fetching current weather by zip:', error);
    throw error;
  }
};

// Get 5-day forecast by coordinates
export const getForecastByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY
      }
    });
    
    const data = response.data;
    
    // Group forecast by day
    const forecastByDay = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!forecastByDay[date]) {
        forecastByDay[date] = [];
      }
      
      forecastByDay[date].push({
        time: new Date(item.dt * 1000).toLocaleTimeString(),
        temperature: kelvinToCelsius(item.main.temp),
        feelsLike: kelvinToCelsius(item.main.feels_like),
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      });
    });
    
    // Process the grouped data to get daily summary
    const forecast = Object.keys(forecastByDay).map(date => {
      const dayData = forecastByDay[date];
      
      // Calculate min/max temperatures for the day
      const temperatures = dayData.map(item => item.temperature);
      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);
      
      // Get the most frequent weather condition
      const conditions = dayData.map(item => item.description);
      const conditionCounts = {};
      let mostFrequent = conditions[0];
      let maxCount = 1;
      
      conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        if (conditionCounts[condition] > maxCount) {
          mostFrequent = condition;
          maxCount = conditionCounts[condition];
        }
      });
      
      // Get the corresponding icon for the most frequent condition
      const iconItem = dayData.find(item => item.description === mostFrequent);
      
      return {
        date,
        minTemp,
        maxTemp,
        description: mostFrequent,
        icon: iconItem ? iconItem.icon : dayData[0].icon,
        hourlyData: dayData
      };
    });
    
    return {
      location: data.city.name,
      country: data.city.country,
      forecast
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}; 