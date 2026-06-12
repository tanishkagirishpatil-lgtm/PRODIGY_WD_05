import { getWeatherMoodFromCondition } from './weatherConditions';

export function getWeatherMood(condition = '') {
  return getWeatherMoodFromCondition(condition);
}

export function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getLocalHour(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.getUTCHours();
}

export function getBackgroundTheme({ condition = '', timestamp, timezone = 0, theme = 'light' } = {}) {
  const hour =
    timestamp != null ? getLocalHour(timestamp, timezone) : new Date().getHours();
  const mood = getWeatherMood(condition);
  const timeOfDay = getTimeOfDay(hour);
  const isDark = theme === 'dark' || timeOfDay === 'night';

  return { mood, timeOfDay, hour, isDark };
}

const SKY_PALETTES = {
  clear: {
    dawn: ['#FFB88C', '#FFD6A5', '#E8F4FF'],
    morning: ['#87CEEB', '#B8E0FF', '#DDEEFF'],
    afternoon: ['#6CB4EE', '#A8D4FF', '#DDEEFF'],
    evening: ['#FF9A76', '#FFB88C', '#C9B1FF'],
    night: ['#0B1426', '#152238', '#1E3054'],
  },
  cloudy: {
    dawn: ['#B8A898', '#D4C4B0', '#C8D8EA'],
    morning: ['#8BA4BC', '#A8BFD4', '#C8D8EA'],
    afternoon: ['#7A94AC', '#9BB8D4', '#C8D8EA'],
    evening: ['#8A7E8E', '#A898A8', '#B8A8C8'],
    night: ['#141E32', '#1C2840', '#243050'],
  },
  rain: {
    dawn: ['#6A8098', '#8898AC', '#A8B8C8'],
    morning: ['#5A7088', '#7890A8', '#98AEC4'],
    afternoon: ['#506880', '#688098', '#88A0B8'],
    evening: ['#485868', '#607080', '#8090A0'],
    night: ['#0E1628', '#162038', '#1E2848'],
  },
  snow: {
    dawn: ['#C8D8E8', '#DDE8F4', '#EEF4FA'],
    morning: ['#B8D0E8', '#D0E4F4', '#E8F2FA'],
    afternoon: ['#A8C8E8', '#C8DCF4', '#E0EEF8'],
    evening: ['#98A8C8', '#B0C0D8', '#D0D8E8'],
    night: ['#182038', '#243050', '#304068'],
  },
  thunderstorm: {
    dawn: ['#4A5870', '#5A6880', '#6A7890'],
    morning: ['#3A4868', '#4A5878', '#5A6888'],
    afternoon: ['#2E3E58', '#3E4E68', '#4E5E78'],
    evening: ['#283848', '#384858', '#485868'],
    night: ['#080E1A', '#101828', '#182038'],
  },
  mist: {
    dawn: ['#B8BCC8', '#C8CCD8', '#D8DCE8'],
    morning: ['#A8ACB8', '#B8BCC8', '#C8CCD8'],
    afternoon: ['#989CA8', '#A8ACB8', '#B8BCC8'],
    evening: ['#888C98', '#989CA8', '#A8ACB8'],
    night: ['#141C2C', '#1C2434', '#242C3C'],
  },
};

export function getSkyColors(mood, timeOfDay) {
  const palette = SKY_PALETTES[mood] || SKY_PALETTES.clear;
  const colors = palette[timeOfDay] || palette.afternoon;
  return { top: colors[0], mid: colors[1], bottom: colors[2] };
}

const NIGHT_PRESETS = {
  clear: { base: '#0a1020', orb1: 'rgba(124, 92, 255, 0.18)', orb2: 'rgba(77, 171, 247, 0.12)', orb3: 'rgba(30, 48, 84, 0.6)' },
  cloudy: { base: '#0c1220', orb1: 'rgba(100, 116, 139, 0.2)', orb2: 'rgba(77, 171, 247, 0.1)', orb3: 'rgba(28, 40, 64, 0.65)' },
  rain: { base: '#080e1c', orb1: 'rgba(77, 120, 168, 0.22)', orb2: 'rgba(77, 171, 247, 0.14)', orb3: 'rgba(20, 36, 60, 0.7)' },
  thunderstorm: { base: '#060a14', orb1: 'rgba(46, 62, 88, 0.28)', orb2: 'rgba(124, 92, 255, 0.12)', orb3: 'rgba(16, 24, 44, 0.75)' },
  snow: { base: '#0c1424', orb1: 'rgba(180, 210, 240, 0.14)', orb2: 'rgba(148, 163, 184, 0.12)', orb3: 'rgba(30, 44, 68, 0.6)' },
  mist: { base: '#0a1018', orb1: 'rgba(148, 163, 184, 0.16)', orb2: 'rgba(100, 116, 139, 0.12)', orb3: 'rgba(24, 32, 48, 0.65)' },
};

export function getPageBackground(mood, timeOfDay, isDark) {
  if (isDark || timeOfDay === 'night') {
    return NIGHT_PRESETS[mood] || NIGHT_PRESETS.clear;
  }

  const presets = {
    dawn: { base: '#FFF5EE', orb1: 'rgba(255, 154, 118, 0.15)', orb2: 'rgba(255, 184, 140, 0.12)', orb3: 'rgba(243, 238, 255, 0.7)' },
    morning: { base: '#F7F9FC', orb1: 'rgba(124, 92, 255, 0.08)', orb2: 'rgba(77, 171, 247, 0.1)', orb3: 'rgba(221, 238, 255, 0.6)' },
    afternoon: { base: '#F5F8FC', orb1: 'rgba(77, 171, 247, 0.1)', orb2: 'rgba(124, 92, 255, 0.06)', orb3: 'rgba(221, 238, 255, 0.5)' },
    evening: { base: '#FFF8F5', orb1: 'rgba(255, 154, 118, 0.12)', orb2: 'rgba(201, 177, 255, 0.1)', orb3: 'rgba(243, 238, 255, 0.6)' },
  };

  if (mood === 'clear') {
    return {
      base: '#FFF9F5',
      orb1: 'rgba(255, 180, 100, 0.14)',
      orb2: 'rgba(255, 217, 61, 0.1)',
      orb3: 'rgba(255, 245, 230, 0.65)',
    };
  }
  if (mood === 'rain') {
    return { base: '#E8EEF5', orb1: 'rgba(77, 120, 168, 0.14)', orb2: 'rgba(77, 171, 247, 0.1)', orb3: 'rgba(160, 190, 220, 0.45)' };
  }
  if (mood === 'thunderstorm') {
    return { base: '#D8DEE8', orb1: 'rgba(46, 62, 88, 0.18)', orb2: 'rgba(124, 92, 255, 0.08)', orb3: 'rgba(60, 80, 110, 0.35)' };
  }
  if (mood === 'cloudy') {
    return { base: '#EEF1F6', orb1: 'rgba(139, 164, 188, 0.12)', orb2: 'rgba(124, 92, 255, 0.05)', orb3: 'rgba(200, 210, 225, 0.55)' };
  }
  if (mood === 'mist') {
    return { base: '#F0F2F6', orb1: 'rgba(148, 163, 184, 0.14)', orb2: 'rgba(180, 190, 205, 0.1)', orb3: 'rgba(220, 225, 235, 0.6)' };
  }
  if (mood === 'snow') {
    return { base: '#F4F8FC', orb1: 'rgba(180, 210, 240, 0.12)', orb2: 'rgba(200, 220, 245, 0.1)', orb3: 'rgba(230, 240, 250, 0.65)' };
  }

  return presets[timeOfDay] || presets.morning;
}

export function getSunPosition(timeOfDay) {
  const positions = {
    dawn: { x: 120, y: 200, show: true, color: '#FF9A76' },
    morning: { x: 620, y: 55, show: true, color: '#FFD93D' },
    afternoon: { x: 680, y: 45, show: true, color: '#FFE066' },
    evening: { x: 700, y: 180, show: true, color: '#FF8C42' },
    night: { x: 650, y: 40, show: false, color: '#F0F4FF' },
  };
  return positions[timeOfDay] || positions.morning;
}

export function showStars(timeOfDay, mood) {
  return timeOfDay === 'night' || (timeOfDay === 'dawn' && !['rain', 'thunderstorm'].includes(mood));
}

export function showMoon(timeOfDay) {
  return timeOfDay === 'night' || timeOfDay === 'evening';
}
