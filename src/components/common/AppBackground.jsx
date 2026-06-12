import { useApp } from '../../context/AppContextCore';
import {
  getBackgroundTheme,
  getPageBackground,
} from '../../utils/backgroundTheme';
import './AppBackground.css';

function FloatingClouds({ count = 3 }) {
  return (
    <div className="app-background__clouds">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`app-background__cloud app-background__cloud--${i + 1}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function RainLayer({ heavy = false }) {
  const dropCount = heavy ? 55 : 40;
  return (
    <div className={`app-background__rain ${heavy ? 'app-background__rain--heavy' : ''}`} aria-hidden="true">
      {Array.from({ length: dropCount }, (_, i) => (
        <span
          key={i}
          className="app-background__drop"
          style={{
            left: `${(i * 2.5) % 100}%`,
            animationDelay: `${(i * 0.12) % 2}s`,
            animationDuration: `${0.6 + (i % 5) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function StarField() {
  return (
    <div className="app-background__stars" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <span
          key={i}
          className="app-background__star"
          style={{
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 13 + 3) % 45}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function AppBackground() {
  const { weather, settings } = useApp();
  const current = weather?.current;
  const condition = current?.weather?.[0]?.description || '';
  const timestamp = current?.dt;
  const timezone = current?.timezone || 0;

  const { mood, timeOfDay, isDark } = getBackgroundTheme({
    condition,
    timestamp,
    timezone,
    theme: settings.theme,
  });

  const pageBg = getPageBackground(mood, timeOfDay, isDark);
  const showRain = mood === 'rain' || mood === 'thunderstorm';
  const showMist = mood === 'mist';
  const showStarsLayer = timeOfDay === 'night' && settings.theme !== 'dark';
  const cloudCount =
    mood === 'clear' ? 2 : mood === 'cloudy' || mood === 'mist' ? 5 : mood === 'thunderstorm' ? 4 : 3;

  return (
    <div
      className={`app-background app-background--${mood} app-background--${timeOfDay}`}
      aria-hidden="true"
      style={{
        '--bg-base': pageBg.base,
        '--orb-1': pageBg.orb1,
        '--orb-2': pageBg.orb2,
        '--orb-3': pageBg.orb3,
      }}
    >
      <div className="app-background__gradient" />
      <div className="app-background__orb app-background__orb--1" />
      <div className="app-background__orb app-background__orb--2" />
      <div className="app-background__orb app-background__orb--3" />
      <FloatingClouds count={cloudCount} />
      {showStarsLayer && <StarField />}
      {showRain && <RainLayer heavy={mood === 'thunderstorm'} />}
      {showMist && <div className="app-background__fog" aria-hidden="true" />}
      <div className="app-background__grid" />
      <div className="app-background__horizon" />
    </div>
  );
}
