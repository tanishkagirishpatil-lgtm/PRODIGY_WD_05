import { memo } from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
} from 'lucide-react';
import { getConditionType, getConditionLabel } from '../../utils/weatherConditions';
import './WeatherIcon.css';

const ICON_CONFIG = {
  sunny: { Icon: Sun, color: '#F79009' },
  cloudy: { Icon: Cloud, color: '#868E96' },
  rain: { Icon: CloudRain, color: '#4DABF7' },
  thunderstorm: { Icon: CloudLightning, color: '#7C5CFF' },
  snow: { Icon: Snowflake, color: '#74C0FC' },
  mist: { Icon: CloudFog, color: '#94A3B8' },
};

function WeatherIcon({ icon, description = '', size = 48, className = '' }) {
  if (icon?.startsWith('http')) {
    return (
      <img
        src={icon}
        alt={description || 'Weather condition'}
        width={size}
        height={size}
        className={`weather-icon weather-icon--img ${className}`}
      />
    );
  }

  const type = getConditionType(icon, description);
  const { Icon, color } = ICON_CONFIG[type] || { Icon: CloudSun, color: '#7C5CFF' };
  const label = description ? capitalizeWords(description) : getConditionLabel(type);

  return (
    <span
      className={`weather-icon ${className}`}
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
    >
      <Icon size={size} color={color} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

function capitalizeWords(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default memo(WeatherIcon);
