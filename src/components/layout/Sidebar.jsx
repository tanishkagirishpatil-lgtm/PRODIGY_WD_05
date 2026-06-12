import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CloudSun,
  MapPin,
  User,
  Settings,
  MapPinned,
  Sunrise,
  Sunset,
  Cloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContextCore';
import {
  kelvinToCelsius,
  convertTemp,
  tempLabel,
  formatTime,
  capitalize,
} from '../../utils/formatters';
import SidebarIllustration from '../common/SidebarIllustration';
import WeatherIcon from '../common/WeatherIcon';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Search Weather' },
  { to: '/forecast', icon: CloudSun, label: 'Forecast' },
  { to: '/saved', icon: MapPin, label: 'Saved Locations' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { weather, settings, requestLocation } = useApp();
  const current = weather?.current;
  const tz = current?.timezone || 0;

  const temp = current
    ? convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit)
    : '--';
  const unit = tempLabel(settings.tempUnit);

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <Cloud size={20} />
          </div>
          <span className="sidebar__logo-text">SkyCast</span>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__location-card">
          <h4>
            <MapPinned size={14} />
            Enable Location Access
          </h4>
          <p>Allow location access to get weather updates for your current location.</p>
          <button className="sidebar__location-btn" onClick={requestLocation}>
            Enable Location
          </button>
        </div>

        {current && (
          <div className="sidebar__current-widget">
            <div className="city">
              {current.name}, {current.sys?.country}
            </div>
            <div className="temp-row">
              <div>
                <div className="temp">
                  {temp}
                  {unit}
                </div>
                <div className="condition">
                  {capitalize(current.weather?.[0]?.description)}
                </div>
              </div>
              <WeatherIcon icon={current.weather?.[0]?.icon} size={36} />
            </div>
          </div>
        )}

        <div className="sidebar__sun-widgets">
          <div className="sidebar__sun-item">
            <Sunrise size={16} color="#F79009" />
            <span>Sunrise</span>
            <span>
              {current ? formatTime(current.sys.sunrise, tz, settings.timeFormat === '12') : '--'}
            </span>
          </div>
          <div className="sidebar__sun-item">
            <Sunset size={16} color="#F79009" />
            <span>Sunset</span>
            <span>
              {current ? formatTime(current.sys.sunset, tz, settings.timeFormat === '12') : '--'}
            </span>
          </div>
        </div>

        <div className="sidebar__illustration">
          <SidebarIllustration />
        </div>
      </aside>
    </>
  );
}
