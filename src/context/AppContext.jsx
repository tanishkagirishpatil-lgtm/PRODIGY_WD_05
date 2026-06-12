import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppContext } from './AppContextCore';
import {
  getWeatherByCoords,
  getWeatherByLocation,
  searchLocations,
  reverseGeocode,
  assertApiKey,
} from '../services/weatherApi';
import { getGeolocationErrorMessage, getWeatherErrorMessage } from '../utils/errors';

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
  location: '',
  memberSince: 'May 25, 2024',
  avatar: 'https://i.pravatar.cc/150?img=47',
  premium: true,
  connectedEmail: 'tanishka@gmail.com',
};

function sameLocation(a, b) {
  if (!a || !b) return false;
  return (
    a.name?.toLowerCase() === b.name?.toLowerCase() &&
    a.country === b.country &&
    Math.abs(Number(a.lat) - Number(b.lat)) < 0.01 &&
    Math.abs(Number(a.lon) - Number(b.lon)) < 0.01
  );
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('skycast-settings', DEFAULT_SETTINGS);
  const [savedLocations, setSavedLocations] = useLocalStorage('skycast-saved', []);
  const [recentSearches, setRecentSearches] = useLocalStorage('skycast-recent', []);
  const [profile, setProfile] = useLocalStorage('skycast-profile', DEFAULT_PROFILE);
  const [currentLocation, setCurrentLocation] = useLocalStorage('skycast-current-location', null);

  const [coords, setCoords] = useState(() =>
    currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : null
  );
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const weatherRequestId = useRef(0);

  const loadWeatherAt = useCallback(async (lat, lon, geo = null) => {
    const requestId = ++weatherRequestId.current;
    setLoading(true);
    setError(null);

    try {
      assertApiKey();
      const data = await getWeatherByCoords(lat, lon);
      if (requestId !== weatherRequestId.current) return null;

      setWeather(data);
      setCoords({ lat, lon });

      if (geo) {
        setCurrentLocation(geo);
        setProfile((p) => ({
          ...p,
          location: `${geo.name}${geo.state ? `, ${geo.state}` : ''}, ${geo.country}`,
        }));
      }

      return data;
    } catch (err) {
      if (requestId !== weatherRequestId.current) return null;
      setError(getWeatherErrorMessage(err));
      throw err;
    } finally {
      if (requestId === weatherRequestId.current) {
        setLoading(false);
      }
    }
  }, [setCurrentLocation, setProfile]);

  const requestLocation = useCallback(() => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return Promise.reject(new Error('unsupported'));
    }

    setLocationLoading(true);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const geo = await reverseGeocode(latitude, longitude);
            await loadWeatherAt(latitude, longitude, geo);
            setSettings((s) => ({ ...s, locationEnabled: true }));
            setLocationError(null);
            resolve(geo);
          } catch (err) {
            const message = getWeatherErrorMessage(err);
            setLocationError(message);
            reject(err);
          } finally {
            setLocationLoading(false);
          }
        },
        (geoErr) => {
          const message = getGeolocationErrorMessage(geoErr);
          setLocationError(message);
          setSettings((s) => ({ ...s, locationEnabled: false }));
          setLocationLoading(false);
          reject(geoErr);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }, [loadWeatherAt, setSettings]);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        assertApiKey();

    if (currentLocation?.lat != null && currentLocation?.lon != null) {
          await loadWeatherAt(currentLocation.lat, currentLocation.lon, currentLocation);
          if (active && !settings.locationEnabled) {
            setSettings((s) => ({ ...s, locationEnabled: true }));
          }
          return;
        }

        if (settings.locationEnabled) {
          await requestLocation();
          return;
        }

        if (active) {
          setLoading(false);
          setError('Enable location access or search for a city to view weather.');
        }
      } catch {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const searchWeather = async (query) => {
    if (!query.trim()) return [];
    assertApiKey();
    return searchLocations(query, 10);
  };

  const fetchCityWeather = async (location) => {
    setLoading(true);
    setError(null);
    try {
      assertApiKey();
      const loc =
        typeof location === 'string'
          ? (await searchLocations(location, 1))[0]
          : location;

      if (!loc) throw new Error(`No results found for "${location}".`);

      const data = await getWeatherByLocation(loc);
      setWeather(data);
      setCoords({ lat: loc.lat, lon: loc.lon });
      addRecentSearch(loc.name, loc.state, loc.country);
      return data;
    } catch (err) {
      setError(getWeatherErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRecentSearch = (name, state = '', country = '') => {
    const label = `${name}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}`;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== label.toLowerCase());
      return [label, ...filtered].slice(0, 8);
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
        locationLoading,
        error,
        locationError,
        coords,
        currentLocation,
        fetchWeather: loadWeatherAt,
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
