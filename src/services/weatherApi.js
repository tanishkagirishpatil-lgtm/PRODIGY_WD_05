const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Weather API error (${res.status})`);
  }
  return res.json();
}

export function hasApiKey() {
  return Boolean(API_KEY && API_KEY !== 'your_openweathermap_api_key_here');
}

export async function getCurrentWeather(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function getForecast(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function getAirQuality(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

export async function searchCities(query, limit = 6) {
  if (!query.trim()) return [];
  return fetchJson(
    `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
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

export async function getWeatherByCity(city) {
  const cities = await searchCities(city, 1);
  if (!cities.length) throw new Error('City not found');
  const { lat, lon } = cities[0];
  const data = await getWeatherByCoords(lat, lon);
  return { ...data, geo: cities[0] };
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

export function getDemoWeather() {
  const now = Math.floor(Date.now() / 1000);
  const tzOffset = -new Date().getTimezoneOffset() * 60;

  const today = new Date();
  today.setHours(5, 56, 0, 0);
  const sunrise = Math.floor(today.getTime() / 1000) - tzOffset;
  today.setHours(19, 2, 0, 0);
  const sunset = Math.floor(today.getTime() / 1000) - tzOffset;

  return {
    current: {
      name: 'Bangalore',
      sys: { country: 'IN', sunrise, sunset },
      main: {
        temp: 300.15,
        feels_like: 302.15,
        temp_min: 294.15,
        temp_max: 305.15,
        humidity: 64,
        pressure: 1013,
      },
      weather: [{ main: 'Clouds', description: 'partly cloudy', icon: '02d' }],
      wind: { speed: 5, deg: 225 },
      visibility: 10000,
      dt: now,
      timezone: tzOffset,
      coord: { lat: 12.9716, lon: 77.5946 },
    },
    forecast: {
      list: Array.from({ length: 40 }, (_, i) => ({
        dt: now + i * 10800,
        main: {
          temp: 298 + Math.sin(i / 3) * 5,
          temp_min: 293 + Math.sin(i / 3) * 3,
          temp_max: 303 + Math.sin(i / 3) * 4,
          humidity: 60 + (i % 5) * 3,
          pressure: 1013,
        },
        weather: [
          {
            main: ['Clear', 'Clouds', 'Rain'][i % 3],
            description: ['clear sky', 'partly cloudy', 'light rain'][i % 3],
            icon: ['01d', '02d', '10d'][i % 3],
          },
        ],
        wind: { speed: 4 + (i % 3), deg: 200 + i * 5 },
        pop: i % 4 === 0 ? 0.6 : 0.1,
      })),
      city: { timezone: tzOffset },
    },
    airQuality: {
      list: [{ main: { aqi: 2 }, components: { pm2_5: 15 } }],
    },
  };
}
