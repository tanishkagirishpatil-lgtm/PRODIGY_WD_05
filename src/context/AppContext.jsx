import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppContext } from './AppContextCore';
import {
  getWeatherByCoords,
  getWeatherByCity,
  searchCities,
  hasApiKey,
  getDemoWeather,
} from '../services/weatherApi';

const DEFAULT_SETTINGS = {
  tempUnit: 'C',
  windUnit: 'kmh',
  timeFormat: '12',
  language: 'English',
  theme: 'light',
  notifications: true,
  locationEnabled: false,
};

const DEFAULT_PROFILE = {
  name: 'Tanishka',
  email: 'tanishka@example.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, India',
  memberSince: 'May 25, 2024',
  avatar: 'https://i.pravatar.cc/150?img=47',
  premium: true,
  connectedEmail: 'tanishka@gmail.com',
};

const DEFAULT_SAVED_LOCATIONS = [
  { name: 'Bangalore', country: 'IN', state: 'Karnataka', lat: 12.9716, lon: 77.5946, isCurrent: true },
  { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.076, lon: 72.8777 },
  { name: 'Delhi', country: 'IN', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Pune', country: 'IN', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Chennai', country: 'IN', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', country: 'IN', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
];

function sameLocation(a, b) {
  return (
    a.name?.toLowerCase() === b.name?.toLowerCase() &&
    a.country === b.country &&
    Math.abs(Number(a.lat) - Number(b.lat)) < 0.01 &&
    Math.abs(Number(a.lon) - Number(b.lon)) < 0.01
  );
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('skycast-settings', DEFAULT_SETTINGS);
  const [savedLocations, setSavedLocations] = useLocalStorage('skycast-saved', DEFAULT_SAVED_LOCATIONS);
  const [recentSearches, setRecentSearches] = useLocalStorage('skycast-recent', [
    'Mumbai',
    'Delhi',
    'Pune',
    'Chennai',
    'New York',
  ]);
  const [profile, setProfile] = useLocalStorage('skycast-profile', DEFAULT_PROFILE);

  const [coords, setCoords] = useState({ lat: 12.9716, lon: 77.5946 });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (hasApiKey()) {
        data = await getWeatherByCoords(lat, lon);
      } else {
        data = getDemoWeather();
      }
      setWeather(data);
      setCoords({ lat, lon });
    } catch (err) {
      setError(err.message);
      if (!weather) setWeather(getDemoWeather());
    } finally {
      setLoading(false);
    }
  }, [weather]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((s) => ({ ...s, locationEnabled: true }));
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => setError('Unable to retrieve your location')
    );
  }, [fetchWeather, setSettings]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchWeather(coords.lat, coords.lon);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const searchWeather = async (query) => {
    if (!query.trim()) return [];
    try {
      if (hasApiKey()) {
        return await searchCities(query);
      }
      return [
        { name: 'Mumbai', state: 'Maharashtra', country: 'IN', lat: 19.076, lon: 72.8777 },
        { name: 'Delhi', state: 'Delhi', country: 'IN', lat: 28.7041, lon: 77.1025 },
        { name: 'Pune', state: 'Maharashtra', country: 'IN', lat: 18.5204, lon: 73.8567 },
        { name: 'Chennai', state: 'Tamil Nadu', country: 'IN', lat: 13.0827, lon: 80.2707 },
        { name: 'Kolkata', state: 'West Bengal', country: 'IN', lat: 22.5726, lon: 88.3639 },
        { name: 'Bangalore', state: 'Karnataka', country: 'IN', lat: 12.9716, lon: 77.5946 },
      ].filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    } catch {
      return [];
    }
  };

  const fetchCityWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (hasApiKey()) {
        data = await getWeatherByCity(city);
      } else {
        data = getDemoWeather();
        data.current.name = city;
      }
      setWeather(data);
      if (data.current?.coord) {
        setCoords({ lat: data.current.coord.lat, lon: data.current.coord.lon });
      }
      addRecentSearch(city);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRecentSearch = (city) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== city.toLowerCase());
      return [city, ...filtered].slice(0, 8);
    });
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const addSavedLocation = (location) => {
    setSavedLocations((prev) => {
      if (prev.some((l) => sameLocation(l, location))) return prev;
      return [...prev, location];
    });
  };

  const removeSavedLocation = (location) => {
    setSavedLocations((prev) =>
      prev.filter((l) =>
        typeof location === 'string'
          ? l.name !== location
          : !sameLocation(l, location)
      )
    );
  };

  const updateSetting = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const updateProfile = (updates) => {
    setProfile((p) => ({ ...p, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSetting,
        profile,
        updateProfile,
        weather,
        loading,
        error,
        coords,
        fetchWeather,
        fetchCityWeather,
        searchWeather,
        requestLocation,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        recentSearches,
        clearRecentSearches,
        addRecentSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
