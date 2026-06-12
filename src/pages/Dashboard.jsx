import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  MapPin,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Leaf,
  Thermometer,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import CityHeroImage from '../components/common/CityHeroImage';
import MetricCard from '../components/common/MetricCard';
import WeatherIcon from '../components/common/WeatherIcon';
import WeatherMap from '../components/common/WeatherMap';
import WeatherSkeleton from '../components/common/WeatherSkeleton';
import { useApp } from '../context/AppContextCore';
import { groupForecastByDay, getAqiValue } from '../services/weatherApi';
import {
  kelvinToCelsius,
  convertTemp,
  tempLabel,
  formatDate,
  formatTime,
  formatShortDate,
  formatDay,
  capitalize,
  convertWind,
  windUnitLabel,
  degToDirection,
  getHumidityStatus,
  getVisibilityStatus,
  getAqiStatus,
} from '../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const { onMenuClick } = useOutletContext();
  const { weather, loading, error, settings, coords, currentLocation, requestLocation, locationLoading } =
    useApp();
  const [activeDay, setActiveDay] = useState(0);

  if (loading && !weather) {
    return (
      <>
        <TopNavbar showGreeting onMenuClick={onMenuClick} />
        <div className="main-layout__content dashboard">
          <WeatherSkeleton type="hero" />
          <WeatherSkeleton type="metrics" />
          <WeatherSkeleton type="forecast-grid" />
          <WeatherSkeleton type="map" />
        </div>
      </>
    );
  }

  const current = weather?.current;
  const tz = current?.timezone || 0;
  const unit = tempLabel(settings.tempUnit);
  const temp = current ? convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit) : '--';
  const feels = current
    ? convertTemp(kelvinToCelsius(current.main.feels_like), settings.tempUnit)
    : '--';
  const maxT = current
    ? convertTemp(kelvinToCelsius(current.main.temp_max), settings.tempUnit)
    : '--';
  const minT = current
    ? convertTemp(kelvinToCelsius(current.main.temp_min), settings.tempUnit)
    : '--';

  const dailyForecast = weather?.forecast
    ? groupForecastByDay(weather.forecast.list, tz).slice(0, 5)
    : [];

  const aqi = getAqiValue(weather?.airQuality);

  if (!current) {
    return (
      <>
        <TopNavbar showGreeting onMenuClick={onMenuClick} />
        <div className="main-layout__content dashboard fade-in">
          <div className="empty-state">
            <h3>No weather data yet</h3>
            <p>{error || 'Enable location access or search for a city to get started.'}</p>
            <button type="button" className="empty-state__btn" onClick={requestLocation} disabled={locationLoading}>
              {locationLoading ? 'Detecting location...' : 'Enable Location'}
            </button>
            <Link to="/search" className="empty-state__link">Search for a city →</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNavbar showGreeting onMenuClick={onMenuClick} />

      <div className="main-layout__content dashboard fade-in">
        {error && <div className="error-banner dashboard__error">{error}</div>}

        <div className="hero-card">
          <CityHeroImage
            city={current.name}
            state={currentLocation?.state || ''}
            country={current.sys?.country || ''}
          />
          <div className="hero-card__content">
            <div className="hero-card__left">
              <div className="hero-card__location">
                <MapPin size={14} color="#7C5CFF" />
                {current.name}, {current.sys?.country}
              </div>
              <div className="hero-card__datetime">
                {formatDate(current.dt, tz)} •{' '}
                {formatTime(current.dt, tz, settings.timeFormat === '12')}
              </div>
              <div className="hero-card__temp">
                {temp}
                {unit}
              </div>
              <div className="hero-card__condition-row">
                <WeatherIcon
                  icon={current.weather?.[0]?.icon}
                  description={current.weather?.[0]?.description}
                  size={40}
                />
                <div className="hero-card__condition">
                  {capitalize(current.weather?.[0]?.description)}
                </div>
              </div>
              <div className="hero-card__feels">Feels like {feels}°</div>
              <div className="hero-card__minmax">
                <div className="hero-card__minmax-item">
                  <Thermometer size={16} color="#F04438" />
                  {maxT}° <span>Max</span>
                </div>
                <div className="hero-card__minmax-item">
                  <Thermometer size={16} color="#4DABF7" />
                  {minT}° <span>Min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-row">
          <MetricCard
            icon={<Droplets size={20} />}
            label="Humidity"
            value={`${current.main.humidity}%`}
            sub={getHumidityStatus(current.main.humidity)}
            color="#4DABF7"
          />
          <MetricCard
            icon={<Wind size={20} />}
            label="Wind"
            value={`${convertWind(current.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`}
            sub={degToDirection(current.wind?.deg || 0)}
            color="#12B76A"
          />
          <MetricCard
            icon={<Eye size={20} />}
            label="Visibility"
            value={`${((current.visibility || 0) / 1000).toFixed(0)} km`}
            sub={getVisibilityStatus((current.visibility || 0) / 1000)}
            color="#F79009"
          />
          <MetricCard
            icon={<Gauge size={20} />}
            label="Pressure"
            value={`${current.main.pressure} mb`}
            sub="Steady"
            color="#7C5CFF"
          />
          <MetricCard
            icon={<Leaf size={20} />}
            label="Air Quality Index"
            value={aqi ?? 'N/A'}
            sub={aqi != null ? getAqiStatus(aqi) : 'Unavailable'}
            color="#12B76A"
          />
        </div>

        <div className="dashboard-grid">
          <div className="forecast-section">
            <div className="section-header">
              <h3>5-Day Forecast</h3>
              <Link to="/forecast">View Full Forecast →</Link>
            </div>
            <div className="forecast-cards">
              {dailyForecast.map((day, i) => (
                <div
                  key={day.date}
                  role="button"
                  tabIndex={0}
                  aria-pressed={activeDay === i}
                  aria-label={`${formatDay(day.dt, tz)} forecast, ${capitalize(day.description)}`}
                  className={`forecast-card ${activeDay === i ? 'forecast-card--active' : ''}`}
                  onClick={() => setActiveDay(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveDay(i);
                    }
                  }}
                >
                  <div className="forecast-card__day">{formatDay(day.dt, tz)}</div>
                  <div className="forecast-card__date">{formatShortDate(day.dt, tz)}</div>
                  <div className="forecast-card__icon">
                    <WeatherIcon icon={day.icon} description={day.description} size={32} />
                  </div>
                  <div className="forecast-card__temps">
                    {convertTemp(kelvinToCelsius(day.max), settings.tempUnit)}°{' '}
                    <span>
                      {convertTemp(kelvinToCelsius(day.min), settings.tempUnit)}°
                    </span>
                  </div>
                  <div className="forecast-card__desc">{capitalize(day.description)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="map-section">
            <div className="section-header">
              <h3>Live Weather Map</h3>
            </div>
            {coords ? (
              <WeatherMap
                lat={coords.lat}
                lon={coords.lon}
                cityName={current.name}
                temperature={convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit)}
              />
            ) : (
              <WeatherSkeleton type="map" />
            )}
          </div>
        </div>

        <div className="bottom-banner">
          <span>
            🌱 Weather is what happens outside. <strong>Have a great day!</strong> 🌿
          </span>
          <span className="bottom-banner__emoji">☕</span>
        </div>

        <footer className="page-footer">© 2024 SkyCast. All rights reserved.</footer>
      </div>
    </>
  );
}
