import { CloudSun } from 'lucide-react';

export default function WeatherIcon({ icon, size = 48, className = '' }) {
  const code = icon?.replace('n', 'd') || '01d';

  const emojiMap = {
    '01d': '☀️',
    '02d': '⛅',
    '03d': '☁️',
    '04d': '☁️',
    '09d': '🌧️',
    '10d': '🌦️',
    '11d': '⛈️',
    '13d': '❄️',
    '50d': '🌫️',
  };

  if (icon?.startsWith('http')) {
    return <img src={icon} alt="weather" width={size} height={size} className={className} />;
  }

  return (
    <span
      className={`weather-icon ${className}`}
      style={{ fontSize: size * 0.75, lineHeight: 1 }}
      role="img"
      aria-label="weather"
    >
      {emojiMap[code] || <CloudSun size={size} color="#7C5CFF" />}
    </span>
  );
}
