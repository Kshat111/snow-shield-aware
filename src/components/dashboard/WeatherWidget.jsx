import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { getCurrentWeatherByZip, getCurrentWeatherByCoords, getCurrentWeatherByCity } from '../../services/weather';
import { getWeatherIconUrl } from '../../lib/utils';
import { MapPin, Wind, Droplets, Thermometer, Search, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

const WeatherWidget = () => {
  const { userProfile } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError('');
        
        let weatherData;
        
        // Try to get weather by pincode first
        if (userProfile?.pincode) {
          try {
            weatherData = await getCurrentWeatherByZip(userProfile.pincode);
          } catch (error) {
            console.error('Error fetching weather by pincode:', error);
            // If pincode fails, try coordinates
            if (userLocation) {
              weatherData = await getCurrentWeatherByCoords(userLocation.lat, userLocation.lon);
            }
          }
        } 
        // If no pincode or pincode failed, try coordinates
        else if (userLocation) {
          weatherData = await getCurrentWeatherByCoords(userLocation.lat, userLocation.lon);
        }
        
        if (weatherData) {
          setWeather(weatherData);
        } else {
          setError('Unable to fetch weather data. Please check your location settings.');
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError('Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.pincode || userLocation) {
      fetchWeatherData();
    }
  }, [userProfile, userLocation]);

  // Handle location search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError('');
      
      const weatherData = await getCurrentWeatherByCity(searchQuery);
      setWeather(weatherData);
    } catch (error) {
      console.error('Error searching location:', error);
      setError(`Could not find weather for "${searchQuery}". Please try another location.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and return to default weather
  const handleClearSearch = async () => {
    setSearchQuery('');
    setError('');
    setLoading(true);
    
    try {
      let weatherData;
      
      if (userProfile?.pincode) {
        try {
          weatherData = await getCurrentWeatherByZip(userProfile.pincode);
        } catch (error) {
          if (userLocation) {
            weatherData = await getCurrentWeatherByCoords(userLocation.lat, userLocation.lon);
          }
        }
      } else if (userLocation) {
        weatherData = await getCurrentWeatherByCoords(userLocation.lat, userLocation.lon);
      }
      
      if (weatherData) {
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Error resetting weather:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine avalanche risk based on weather conditions
  const calculateAvalancheRisk = (weather) => {
    if (!weather) return { level: 'Unknown', description: 'Weather data unavailable' };
    
    const { temperature, windSpeed, humidity } = weather;
    
    // Simple risk assessment logic (would be more complex in a real app)
    if (temperature > 0 && temperature < 5 && humidity > 80) {
      return { 
        level: 'High', 
        description: 'Wet snow conditions with temperatures around freezing point',
        color: 'red'
      };
    } else if (windSpeed > 30) {
      return { 
        level: 'High', 
        description: 'Strong winds can create dangerous snow drifts and cornices',
        color: 'red' 
      };
    } else if (temperature < -10) {
      return { 
        level: 'Medium', 
        description: 'Very cold temperatures can create weak snow layers',
        color: 'amber'
      };
    } else if (temperature >= 5) {
      return { 
        level: 'Low',
        description: 'Warmer temperatures typically stabilize snowpack', 
        color: 'green'
      };
    }
    
    return { 
      level: 'Low to Medium',
      description: 'Standard winter conditions. Stay alert for changing weather.',
      color: 'yellow'
    };
  };

  const risk = calculateAvalancheRisk(weather);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary-50 py-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Current Weather</CardTitle>
          {weather && (
            <span className="text-sm font-normal flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {weather.location}, {weather.country}
            </span>
          )}
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={isSearching}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            size="sm"
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="animate-pulse h-10 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3 mx-auto mt-4"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearSearch}
              className="mt-2"
            >
              Reset to My Location
            </Button>
          </div>
        ) : weather ? (
          <div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <img 
                  src={getWeatherIconUrl(weather.icon)} 
                  alt={weather.description}
                  className="w-16 h-16 mr-4"
                />
                <div>
                  <p className="text-3xl font-bold">{weather.temperature}°C</p>
                  <p className="text-gray-600 capitalize">{weather.description}</p>
                </div>
              </div>
              <div>
                <p className="flex items-center text-sm text-gray-500 mb-2">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Feels like: {weather.feelsLike}°C
                </p>
                <p className="flex items-center text-sm text-gray-500 mb-2">
                  <Wind className="h-4 w-4 mr-2" />
                  Wind: {weather.windSpeed} m/s
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <Droplets className="h-4 w-4 mr-2" />
                  Humidity: {weather.humidity}%
                </p>
              </div>
            </div>
            
            <div className={`p-4 bg-${risk.color}-100 border-t border-${risk.color}-200`}>
              <h4 className="font-semibold mb-1">Avalanche Risk: <span className={`text-${risk.color}-700`}>{risk.level}</span></h4>
              <p className="text-sm text-gray-600">{risk.description}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No weather data available</p>
            <p className="text-sm mt-1">Please enable location services or search for a location</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget; 