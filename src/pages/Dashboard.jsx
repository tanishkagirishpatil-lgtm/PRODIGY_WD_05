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
import HeroLandscape from '../components/common/HeroLandscape';
import MetricCard from '../components/common/MetricCard';
import WeatherIcon from '../components/common/WeatherIcon';
import WeatherMap from '../components/common/WeatherMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApp } from '../context/AppContextCore';
import { groupForecastByDay } from '../services/weatherApi';
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
  const { weather, loading, error, settings, coords } = useApp();
  const [activeDay, setActiveDay] = useState(0);

  if (loading && !weather) return <LoadingSpinner />;

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

  const aqi = weather?.airQuality?.list?.[0]?.main?.aqi
    ? weather.airQuality.list[0].main.aqi * 25
    : 42;

  return (
    <>
      <TopNavbar showGreeting onMenuClick={onMenuClick} />

      <div className="main-layout__content dashboard fade-in">
        {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="hero-card">
          <HeroLandscape
            city={current?.name}
            condition={current?.weather?.[0]?.description}
            timestamp={current?.dt}
            timezone={tz}
          />
          <div className="hero-card__content">
            <div className="hero-card__left">
              <div className="hero-card__location">
                <MapPin size={14} color="#7C5CFF" />
                {current?.name}, {current?.sys?.country}
              </div>
              <div className="hero-card__datetime">
                {current && formatDate(current.dt, tz)} •{' '}
                {current && formatTime(current.dt, tz, settings.timeFormat === '12')}
              </div>
              <div className="hero-card__temp">
                {temp}
                {unit}
              </div>
              <div className="hero-card__condition">
                {capitalize(current?.weather?.[0]?.description)}
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
            value={`${current?.main?.humidity || '--'}%`}
            sub={getHumidityStatus(current?.main?.humidity || 50)}
            color="#4DABF7"
          />
          <MetricCard
            icon={<Wind size={20} />}
            label="Wind"
            value={`${convertWind(current?.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`}
            sub={degToDirection(current?.wind?.deg || 0)}
            color="#12B76A"
          />
          <MetricCard
            icon={<Eye size={20} />}
            label="Visibility"
            value={`${((current?.visibility || 10000) / 1000).toFixed(0)} km`}
            sub={getVisibilityStatus((current?.visibility || 10000) / 1000)}
            color="#F79009"
          />
          <MetricCard
            icon={<Gauge size={20} />}
            label="Pressure"
            value={`${current?.main?.pressure || '--'} mb`}
            sub="Steady"
            color="#7C5CFF"
          />
          <MetricCard
            icon={<Leaf size={20} />}
            label="Air Quality Index"
            value={aqi}
            sub={getAqiStatus(aqi)}
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
                  className={`forecast-card ${activeDay === i ? 'forecast-card--active' : ''}`}
                  onClick={() => setActiveDay(i)}
                >
                  <div className="forecast-card__day">{formatDay(day.dt, tz)}</div>
                  <div className="forecast-card__date">{formatShortDate(day.dt, tz)}</div>
                  <div className="forecast-card__icon">
                    <WeatherIcon icon={day.icon} size={32} />
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
              <a href="#map">View Map →</a>
            </div>
            <WeatherMap
              lat={coords.lat}
              lon={coords.lon}
              cityName={current?.name}
            />
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
