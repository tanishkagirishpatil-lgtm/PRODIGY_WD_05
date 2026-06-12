export function formatTime(timestamp, timezoneOffset = 0, format12 = true) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  if (format12) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  }
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

export function formatDate(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatDay(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
}

export function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}

export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function convertTemp(celsius, unit = 'C') {
  if (unit === 'F') return celsiusToFahrenheit(celsius);
  return celsius;
}

export function tempLabel(unit = 'C') {
  return unit === 'F' ? '°F' : '°C';
}

export function convertWind(speedMs, unit = 'kmh') {
  if (unit === 'mph') return Math.round(speedMs * 2.237);
  if (unit === 'ms') return Math.round(speedMs * 10) / 10;
  return Math.round(speedMs * 3.6);
}

export function windUnitLabel(unit = 'kmh') {
  if (unit === 'mph') return 'mph';
  if (unit === 'ms') return 'm/s';
  return 'km/h';
}

export function degToDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function capitalize(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getHumidityStatus(h) {
  if (h < 30) return 'Low';
  if (h > 70) return 'High';
  return 'Normal';
}

export function getVisibilityStatus(km) {
  if (km >= 10) return 'Excellent';
  if (km >= 5) return 'Good';
  return 'Poor';
}

export function getAqiStatus(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy';
  return 'Hazardous';
}

export function getAqiColor(aqi) {
  if (aqi <= 50) return '#12b76a';
  if (aqi <= 100) return '#f79009';
  return '#f04438';
}

export function getUvStatus(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  return 'Very High';
}

export function getMoonPhase() {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const lp = 2551443;
  const now = Date.now();
  const newMoon = new Date('2000-01-06').getTime();
  const phase = ((now - newMoon) / 1000) % lp;
  return phases[Math.floor((phase / lp) * 8)];
}
