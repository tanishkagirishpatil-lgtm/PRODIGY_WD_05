import { useId } from 'react';
import { getBackgroundTheme, getSkyColors } from '../../utils/backgroundTheme';
import { useApp } from '../../context/AppContextCore';
import './SidebarIllustration.css';

export default function SidebarIllustration() {
  const uid = useId().replace(/:/g, '');
  const { weather } = useApp();
  const current = weather?.current;
  const condition = current?.weather?.[0]?.description || '';
  const bg = getBackgroundTheme({
    condition,
    timestamp: current?.dt,
    timezone: current?.timezone || 0,
  });
  const sky = getSkyColors(bg.mood, bg.timeOfDay);
  const isNight = bg.timeOfDay === 'night' || bg.timeOfDay === 'evening';

  return (
    <svg viewBox="0 0 240 130" className={`sidebar-illustration sidebar-illustration--${bg.timeOfDay}`}>
      <defs>
        <linearGradient id={`${uid}-sideSky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top} />
          <stop offset="100%" stopColor={sky.bottom} />
        </linearGradient>
        <radialGradient id={`${uid}-sideSun`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE066" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE066" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="130" fill={`url(#${uid}-sideSky)`} rx="14" />
      {!isNight && (
        <>
          <circle cx="185" cy="28" r="22" fill={`url(#${uid}-sideSun`} />
          <circle cx="185" cy="28" r="12" fill={bg.timeOfDay === 'evening' ? '#FF8C42' : '#FFD93D'} />
        </>
      )}
      {isNight && <circle cx="185" cy="28" r="10" fill="#F0F4FF" opacity="0.85" />}
      <ellipse cx="60" cy="38" rx="28" ry="10" fill="white" opacity={isNight ? 0.15 : 0.75} />
      <ellipse cx="85" cy="34" rx="18" ry="7" fill="white" opacity={isNight ? 0.1 : 0.6} />
      <path d="M0,88 Q60,68 120,82 T240,74 L240,130 L0,130 Z" fill={isNight ? '#3D6B52' : '#6BCB8B'} />
      <path d="M0,98 Q80,82 160,92 T240,86 L240,130 L0,130 Z" fill={isNight ? '#2D5A44' : '#52B788'} />
      <path d="M0,108 Q100,95 200,104 T240,100 L240,130 L0,130 Z" fill={isNight ? '#1E4535' : '#40916C'} />
      {[
        [45, 88, 28], [78, 88, 38], [112, 88, 32], [148, 88, 36],
      ].map(([x, y, h], i) => (
        <polygon
          key={i}
          points={`${x},${y} ${x + 10},${y - h} ${x + 20},${y}`}
          fill={isNight ? (i % 2 ? '#1A3328' : '#254D3A') : i % 2 ? '#2D6A4F' : '#40916C'}
        />
      ))}
    </svg>
  );
}
