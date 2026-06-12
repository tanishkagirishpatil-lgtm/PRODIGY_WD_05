const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const FETCH_TIMEOUT = 12000;

export class WeatherApiError extends Error {
  constructor(message, code = 'API_ERROR') {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new WeatherApiError(
        err.message || `Request failed (${res.status})`,
        res.status === 401 ? 'INVALID_KEY' : 'API_ERROR'
      );
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new WeatherApiError('Request timed out. Please try again.', 'TIMEOUT');
    }
    if (err instanceof WeatherApiError) throw err;
    throw new WeatherApiError('Network error. Check your connection.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

export function assertApiKey() {
  if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
    throw new WeatherApiError(
      'OpenWeatherMap API key is missing. Add VITE_OPENWEATHER_API_KEY to your .env file.',
      'MISSING_KEY'
    );
  }
}

function normalizeOwmResult(item) {
  return {
    name: item.name,
    state: item.state || '',
    country: item.country,
    lat: item.lat,
    lon: item.lon,
    source: 'openweather',
  };
}

function normalizeNominatimResult(item) {
  const addr = item.address || {};
  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.locality ||
    addr.county ||
    item.display_name?.split(',')[0] ||
    'Unknown';

  return {
    name,
    state: addr.state || addr.region || addr.county || '',
    country: (addr.country_code || '').toUpperCase(),
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    source: 'nominatim',
  };
}

function dedupeLocations(locations) {
  const seen = new Map();
  locations.forEach((loc) => {
    const key = `${loc.name.toLowerCase()}|${loc.country}|${loc.lat.toFixed(2)}|${loc.lon.toFixed(2)}`;
    if (!seen.has(key)) seen.set(key, loc);
  });
  return [...seen.values()];
}

export async function searchCitiesOpenWeather(query, limit = 8) {
  assertApiKey();
  const data = await fetchWithTimeout(
    `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
  );
  return (data || []).map(normalizeOwmResult);
}

export async function searchCitiesNominatim(query, limit = 8) {
  const data = await fetchWithTimeout(
    `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}`,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SkyCast Weather App (skycast-dashboard)',
      },
    }
  );
  return (data || []).map(normalizeNominatimResult);
}

export async function searchLocations(query, limit = 10) {
  if (!query.trim()) return [];

  let owmResults = [];
  try {
    owmResults = await searchCitiesOpenWeather(query, limit);
  } catch {
    owmResults = [];
  }

  if (owmResults.length >= limit) {
    return owmResults.slice(0, limit);
  }

  let nominatimResults = [];
  try {
    nominatimResults = await searchCitiesNominatim(query, limit);
  } catch {
    nominatimResults = [];
  }

  return dedupeLocations([...owmResults, ...nominatimResults]).slice(0, limit);
}

export async function reverseGeocodeOpenWeather(lat, lon) {
  assertApiKey();
  const data = await fetchWithTimeout(
    `${BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  );
  if (!data?.length) throw new WeatherApiError('Could not resolve location name.', 'GEOCODE');
  return normalizeOwmResult(data[0]);
}

export async function reverseGeocodeNominatim(lat, lon) {
  const data = await fetchWithTimeout(
    `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SkyCast Weather App (skycast-dashboard)',
      },
    }
  );
  if (!data) throw new WeatherApiError('Could not resolve location name.', 'GEOCODE');
  return normalizeNominatimResult(data);
}

export async function reverseGeocode(lat, lon) {
  try {
    return await reverseGeocodeOpenWeather(lat, lon);
  } catch {
    return reverseGeocodeNominatim(lat, lon);
  }
}

export async function getCurrentWeather(lat, lon) {
  assertApiKey();
  return fetchWithTimeout(
    `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function getForecast(lat, lon) {
  assertApiKey();
  return fetchWithTimeout(
    `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function getAirQuality(lat, lon) {
  assertApiKey();
  return fetchWithTimeout(
    `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function getWeatherByCoords(lat, lon) {
  const [current, forecast, airQuality] = await Promise.all([
    getCurrentWeather(lat, lon),
    getForecast(lat, lon),
    getAirQuality(lat, lon).catch(() => null),
  ]);
  return { current, forecast, airQuality };
}

export async function getWeatherByLocation(location) {
  const data = await getWeatherByCoords(location.lat, location.lon);
  return { ...data, geo: location };
}

export async function getWeatherByCityQuery(query) {
  const cities = await searchLocations(query, 1);
  if (!cities.length) throw new WeatherApiError(`No results found for "${query}".`, 'NOT_FOUND');
  return getWeatherByLocation(cities[0]);
}

export function groupForecastByDay(forecastList, timezoneOffset = 0) {
  const days = {};
  forecastList.forEach((item) => {
    const date = new Date((item.dt + timezoneOffset) * 1000);
    const key = date.toISOString().split('T')[0];
    if (!days[key]) days[key] = [];
    days[key].push(item);
  });
  return Object.entries(days).map(([date, items]) => {
    const min = Math.min(...items.map((i) => i.main.temp_min));
    const max = Math.max(...items.map((i) => i.main.temp_max));
    const midday =
      items.find((i) => {
        const h = new Date((i.dt + timezoneOffset) * 1000).getUTCHours();
        return h >= 11 && h <= 14;
      }) || items[Math.floor(items.length / 2)];
    return {
      date,
      dt: midday.dt,
      min,
      max,
      temp: midday.main.temp,
      description: midday.weather[0].description,
      icon: midday.weather[0].icon,
      pop: Math.max(...items.map((i) => i.pop || 0)),
      items,
    };
  });
}

export function getAqiValue(airQuality) {
  const aqi = airQuality?.list?.[0]?.main?.aqi;
  if (!aqi) return null;
  return aqi * 25;
}

export function formatLocationLabel(location) {
  if (!location) return '';
  const state = location.state ? `, ${location.state}` : '';
  return `${location.name}${state}`;
}
