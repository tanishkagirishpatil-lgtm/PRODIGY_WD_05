import { useId } from 'react';
import {
  getWeatherMood,
  getBackgroundTheme,
  getSkyColors,
  getSunPosition,
  showStars,
  showMoon,
} from '../../utils/backgroundTheme';
import { getCityVariant } from '../../utils/cityVariants';
import './HeroLandscape.css';

function SunGlowDef({ uid }) {
  return (
    <radialGradient id={`${uid}-sunGlow`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFE066" stopOpacity="0.65" />
      <stop offset="100%" stopColor="#FFE066" stopOpacity="0" />
    </radialGradient>
  );
}

function SunDisc({ uid, timeOfDay, mood }) {
  const sun = getSunPosition(timeOfDay);
  if (!sun.show || mood === 'rain') return null;

  return (
    <>
      <circle cx={sun.x} cy={sun.y} r="58" fill={`url(#${uid}-sunGlow)`} />
      <circle cx={sun.x} cy={sun.y} r="34" fill={sun.color} opacity={mood === 'cloudy' ? 0.7 : 0.95} />
    </>
  );
}

function MoonDisc({ timeOfDay }) {
  if (!showMoon(timeOfDay)) return null;
  return (
    <>
      <circle cx="680" cy="50" r="20" fill="#F0F4FF" opacity="0.92" />
      <circle cx="690" cy="44" r="16" fill={timeOfDay === 'night' ? '#152238' : '#C9B1FF'} opacity="0.5" />
    </>
  );
}

function CloudLayer({ mood, className = '' }) {
  const opacity = mood === 'rain' ? 0.95 : mood === 'cloudy' ? 0.88 : 0.72;
  return (
    <g className={className} opacity={opacity}>
      <ellipse cx="140" cy="58" rx="58" ry="22" fill="white" />
      <ellipse cx="185" cy="52" rx="38" ry="16" fill="white" />
      <ellipse cx="320" cy="45" rx="45" ry="18" fill="white" />
      {(mood === 'cloudy' || mood === 'rain') && (
        <>
          <ellipse cx="480" cy="40" rx="50" ry="20" fill="white" />
          <ellipse cx="520" cy="48" rx="35" ry="14" fill="white" />
          <ellipse cx="600" cy="55" rx="40" ry="16" fill="white" />
        </>
      )}
    </g>
  );
}

function AnimatedRain() {
  return (
    <g opacity="0.55">
      {Array.from({ length: 30 }, (_, i) => (
        <line
          key={i}
          className="hero-illustration__rain-drop"
          x1={60 + i * 25}
          y1={20 + (i % 6) * 6}
          x2={54 + i * 25}
          y2={38 + (i % 6) * 6}
          stroke="#7BAFD4"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animationDelay: `${(i * 0.08) % 1.2}s` }}
        />
      ))}
    </g>
  );
}

function StarLayer({ timeOfDay, mood }) {
  if (!showStars(timeOfDay, mood)) return null;
  return (
    <g>
      {Array.from({ length: 18 }, (_, i) => (
        <circle
          key={i}
          className="hero-illustration__star"
          cx={500 + (i * 17) % 260}
          cy={15 + (i * 11) % 80}
          r={0.8 + (i % 2) * 0.6}
          fill="white"
          style={{ animationDelay: `${(i * 0.25) % 2.5}s` }}
        />
      ))}
    </g>
  );
}

function Birds() {
  return (
    <g stroke="#4A5568" strokeWidth="1.5" fill="none" opacity="0.45">
      <path d="M530,72 Q535,68 540,72" />
      <path d="M548,65 Q553,61 558,65" />
      <path d="M565,78 Q570,74 575,78" />
    </g>
  );
}

function HillsScene({ uid, timeOfDay }) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <>
      <path
        d="M0,175 Q200,120 400,155 T800,130 L800,280 L0,280 Z"
        fill={isNight ? '#3D6B52' : '#6BCB8B'}
      />
      <path
        d="M0,195 Q250,150 500,175 T800,160 L800,280 L0,280 Z"
        fill={isNight ? '#2D5A44' : '#52B788'}
      />
      <path
        d="M0,215 Q300,175 550,200 T800,185 L800,280 L0,280 Z"
        fill={isNight ? '#1E4535' : '#40916C'}
      />
      <ellipse cx="480" cy="210" rx="140" ry="28" fill={`url(#${uid}-lake)`} opacity={isNight ? 0.5 : 0.75} />
      {[
        [160, 195, 55], [230, 195, 70], [310, 195, 85], [390, 195, 60], [560, 195, 75],
      ].map(([x, y, h], i) => (
        <polygon
          key={i}
          points={`${x},${y} ${x + 15},${y - h} ${x + 30},${y}`}
          fill={isNight ? (i % 2 ? '#1A3328' : '#254D3A') : i % 2 ? '#2D6A4F' : '#40916C'}
        />
      ))}
      {!isNight && <Birds />}
    </>
  );
}

function MumbaiScene({ timeOfDay }) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <>
      <rect x="0" y="195" width="800" height="85" fill="#5BA4D9" opacity={isNight ? 0.2 : 0.35} />
      <path d="M0,210 Q200,195 400,205 T800,200 L800,280 L0,280 Z" fill={isNight ? '#2D5040' : '#40916C'} opacity="0.55" />
      <path d="M340,210 L355,140 L370,210 Z" fill={isNight ? '#8A7358' : '#C4A882'} />
      <rect x="348" y="140" width="14" height="70" fill={isNight ? '#6A5840' : '#B8956E'} />
      <ellipse cx="355" cy="138" rx="18" ry="8" fill={isNight ? '#8A7358' : '#C4A882'} />
      {[80, 120, 160, 520, 560, 600, 640].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={160 + (i % 3) * 10}
          width={28 + (i % 2) * 8}
          height={50 + (i % 4) * 15}
          fill={isNight ? (i % 2 ? '#3A4550' : '#2A3540') : i % 2 ? '#6C757D' : '#495057'}
          rx="2"
        />
      ))}
      <rect x="440" y="150" width="35" height="60" fill={isNight ? '#222830' : '#343A40'} rx="2" />
      <rect x="485" y="145" width="30" height="65" fill={isNight ? '#2A3540' : '#495057'} rx="2" />
    </>
  );
}

function DelhiScene({ timeOfDay }) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <>
      <path d="M0,210 Q200,185 400,200 T800,190 L800,280 L0,280 Z" fill={isNight ? '#3A6048' : '#74C69D'} opacity="0.6" />
      <rect x="370" y="165" width="60" height="45" fill={isNight ? '#8A7358' : '#C4A882'} rx="2" />
      <path d="M375,165 Q400,130 425,165" fill="none" stroke={isNight ? '#6A5840' : '#B8956E'} strokeWidth="8" />
      {[100, 150, 550, 620, 680].map((x, i) => (
        <rect key={x} x={x} y={170 + i * 5} width={25 + i * 3} height={40 + i * 8} fill={isNight ? '#4A5560' : '#868E96'} rx="2" />
      ))}
    </>
  );
}

function KolkataScene({ timeOfDay }) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <>
      <rect x="0" y="200" width="800" height="80" fill="#4DABF7" opacity={isNight ? 0.15 : 0.3} />
      <path d="M200,210 L200,180 L250,180 L250,210" fill={isNight ? '#3A4550' : '#495057'} />
      <path d="M550,210 L550,180 L600,180 L600,210" fill={isNight ? '#3A4550' : '#495057'} />
      <path d="M200,185 Q400,155 600,185" fill="none" stroke={isNight ? '#2A3540' : '#343A40'} strokeWidth="4" />
      {[220, 280, 340, 400, 460, 520].map((x) => (
        <line key={x} x1={x} y1="185" x2={x} y2="210" stroke={isNight ? '#2A3540' : '#343A40'} strokeWidth="2" />
      ))}
      <path d="M0,215 Q300,195 800,205 L800,280 L0,280 Z" fill={isNight ? '#2D5040' : '#52B788'} opacity="0.5" />
    </>
  );
}

function CoastalScene({ timeOfDay }) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  return (
    <>
      <rect x="0" y="200" width="800" height="80" fill="#4DABF7" opacity={isNight ? 0.25 : 0.45} />
      <path d="M0,220 Q200,200 400,215 T800,205 L800,280 L0,280 Z" fill={isNight ? '#8A7848' : '#F4D58D'} opacity="0.5" />
      <path d="M0,230 Q250,215 500,228 T800,218 L800,280 L0,280 Z" fill={isNight ? '#6A5838' : '#E9C46A'} opacity="0.4" />
      {[120, 200, 280, 600, 680].map((x) => (
        <ellipse key={x} cx={x} cy={225} rx="8" ry="4" fill={isNight ? '#254D3A' : '#40916C'} opacity="0.6" />
      ))}
    </>
  );
}

export default function HeroLandscape({
  variant = 'hills',
  city,
  condition = 'partly cloudy',
  timestamp,
  timezone = 0,
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const resolvedVariant = variant === 'hills' && city ? getCityVariant(city) : variant;
  const mood = getWeatherMood(condition);
  const { timeOfDay } = getBackgroundTheme({ condition, timestamp, timezone });
  const sky = getSkyColors(mood, timeOfDay);
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';

  const scenes = {
    hills: HillsScene,
    mumbai: MumbaiScene,
    delhi: DelhiScene,
    kolkata: KolkataScene,
    coastal: CoastalScene,
    city: MumbaiScene,
  };

  const Scene = scenes[resolvedVariant] || HillsScene;

  const fadeStops = isNight
    ? [
        ['0%', '#0F1729', '0.88'],
        ['45%', '#0F1729', '0.5'],
        ['100%', '#0F1729', '0'],
      ]
    : [
        ['0%', '#FFFFFF', '0.92'],
        ['45%', '#FFFFFF', '0.55'],
        ['100%', '#FFFFFF', '0'],
      ];

  return (
    <svg
      viewBox="0 0 800 280"
      className={`hero-illustration ${className}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top} />
          <stop offset="55%" stopColor={sky.mid} />
          <stop offset="100%" stopColor={sky.bottom} />
        </linearGradient>
        <linearGradient id={`${uid}-lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#2A5080' : '#74C0FC'} />
          <stop offset="100%" stopColor={isNight ? '#1A3860' : '#4DABF7'} />
        </linearGradient>
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="1" y2="0">
          {fadeStops.map(([offset, color, opacity]) => (
            <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
          ))}
        </linearGradient>
        <SunGlowDef uid={uid} />
      </defs>

      <rect width="800" height="280" fill={`url(#${uid}-sky)`} />
      <StarLayer timeOfDay={timeOfDay} mood={mood} />
      <SunDisc uid={uid} timeOfDay={timeOfDay} mood={mood} />
      <MoonDisc timeOfDay={timeOfDay} />
      <CloudLayer mood={mood} className="hero-illustration__cloud-drift" />
      <CloudLayer mood={mood} className="hero-illustration__cloud-drift--slow" />
      {mood === 'rain' && <AnimatedRain />}
      <Scene uid={uid} timeOfDay={timeOfDay} />
      <rect width="440" height="280" fill={`url(#${uid}-fade)`} />
    </svg>
  );
}
