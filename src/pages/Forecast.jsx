import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import WeatherIcon from '../components/common/WeatherIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TemperatureChart, PrecipitationChart } from '../components/charts/WeatherCharts';
import { useApp } from '../context/AppContextCore';
import { groupForecastByDay } from '../services/weatherApi';
import {
  kelvinToCelsius,
  convertTemp,
  tempLabel,
  formatShortDate,
  formatDay,
  formatTime,
  capitalize,
  convertWind,
  windUnitLabel,
  degToDirection,
  getUvStatus,
  getAqiStatus,
  getMoonPhase,
} from '../utils/formatters';
import './Forecast.css';

export default function Forecast() {
  const { onMenuClick } = useOutletContext();
  const { weather, loading, settings } = useApp();
  const [tab, setTab] = useState('daily');

  if (loading && !weather) return <LoadingSpinner />;

  const current = weather?.current;
  const tz = current?.timezone || 0;
  const unit = tempLabel(settings.tempUnit);

  const dailyForecast = weather?.forecast
    ? groupForecastByDay(weather.forecast.list, tz).slice(0, 7)
    : [];

  const hourlyItems = weather?.forecast?.list?.slice(0, 8) || [];

  const chartLabels = dailyForecast.map((d) => formatDay(d.dt, tz));
  const maxTemps = dailyForecast.map((d) =>
    convertTemp(kelvinToCelsius(d.max), settings.tempUnit)
  );
  const minTemps = dailyForecast.map((d) =>
    convertTemp(kelvinToCelsius(d.min), settings.tempUnit)
  );
  const precipValues = dailyForecast.map((d) => Math.round(d.pop * 12));

  const aqi = weather?.airQuality?.list?.[0]?.main?.aqi
    ? weather.airQuality.list[0].main.aqi * 25
    : 42;

  const aqiPercent = Math.min((aqi / 150) * 100, 100);

  return (
    <>
      <TopNavbar
        title="Forecast"
        subtitle="Detailed weather forecast for the upcoming days."
        onMenuClick={onMenuClick}
      />

      <div className="main-layout__content forecast-page fade-in">
        <div className="forecast-controls">
          <div className="forecast-tabs">
            {['hourly', 'daily', '7days'].map((t) => (
              <button
                key={t}
                type="button"
                className={`forecast-tab ${tab === t ? 'forecast-tab--active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === '7days' ? '7 Days' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="location-select">
            <MapPin size={16} color="#7C5CFF" />
            {current?.name}, {current?.sys?.country}
          </div>
        </div>

        {tab === 'hourly' && (
          <div className="hourly-scroll">
            {hourlyItems.map((item) => (
              <div key={item.dt} className="hourly-card">
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {formatTime(item.dt, tz, settings.timeFormat === '12')}
                </div>
                <div style={{ margin: '8px 0' }}>
                  <WeatherIcon icon={item.weather[0].icon} size={28} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {convertTemp(kelvinToCelsius(item.main.temp), settings.tempUnit)}°
                </div>
              </div>
            ))}
          </div>
        )}

        {(tab === 'daily' || tab === '7days') && (
          <div className="seven-day-row">
            {dailyForecast.map((day, i) => (
              <div
                key={day.date}
                className={`seven-day-card ${i === 0 ? 'seven-day-card--today' : ''}`}
              >
                <div className="seven-day-card__label">{i === 0 ? 'Today' : formatDay(day.dt, tz)}</div>
                <div className="seven-day-card__date">{formatShortDate(day.dt, tz)}</div>
                <div className="seven-day-card__icon">
                  <WeatherIcon icon={day.icon} size={36} />
                </div>
                <div className="seven-day-card__max">
                  {convertTemp(kelvinToCelsius(day.max), settings.tempUnit)}°
                </div>
                <div className="seven-day-card__min">
                  {convertTemp(kelvinToCelsius(day.min), settings.tempUnit)}°
                </div>
                <div className="seven-day-card__desc">{capitalize(day.description)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card__header">
              <h4>Temperature Trend</h4>
              <span className="chart-card__unit">{unit}</span>
            </div>
            <div className="chart-container">
              <TemperatureChart
                labels={chartLabels}
                maxTemps={maxTemps}
                minTemps={minTemps}
                unit={unit}
              />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card__header">
              <h4>Precipitation</h4>
              <span className="chart-card__unit">mm</span>
            </div>
            <div className="chart-container">
              <PrecipitationChart labels={chartLabels} values={precipValues} />
            </div>
          </div>
        </div>

        <div className="forecast-bottom">
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              Weather Details (Today)
            </h4>
            <div className="details-grid">
              {[
                {
                  icon: <Thermometer size={18} />,
                  color: '#F79009',
                  label: 'Feels Like',
                  value: `${convertTemp(kelvinToCelsius(current?.main?.feels_like || 300), settings.tempUnit)}°`,
                },
                {
                  icon: <Droplets size={18} />,
                  color: '#4DABF7',
                  label: 'Humidity',
                  value: `${current?.main?.humidity || '--'}%`,
                },
                {
                  icon: <Wind size={18} />,
                  color: '#12B76A',
                  label: 'Wind',
                  value: `${convertWind(current?.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`,
                  sub: degToDirection(current?.wind?.deg || 0),
                },
                {
                  icon: <Eye size={18} />,
                  color: '#F79009',
                  label: 'Visibility',
                  value: `${((current?.visibility || 10000) / 1000).toFixed(0)} km`,
                },
                {
                  icon: <Gauge size={18} />,
                  color: '#7C5CFF',
                  label: 'Pressure',
                  value: `${current?.main?.pressure || '--'} mb`,
                },
                {
                  icon: <Sun size={18} />,
                  color: '#FFD93D',
                  label: 'UV Index',
                  value: '5',
                  sub: getUvStatus(5),
                },
              ].map((d) => (
                <div key={d.label} className="detail-mini">
                  <div
                    className="detail-mini__icon"
                    style={{ background: `${d.color}15`, color: d.color }}
                  >
                    {d.icon}
                  </div>
                  <div className="detail-mini__label">{d.label}</div>
                  <div className="detail-mini__value">{d.value}</div>
                  {d.sub && <div className="detail-mini__sub">{d.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="sun-moon-card">
            <h4>Sun & Moon</h4>
            <div className="sun-arc">
              <svg viewBox="0 0 160 80">
                <path
                  d="M 10 70 Q 80 10 150 70"
                  fill="none"
                  stroke="#E7ECF5"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <circle cx="80" cy="30" r="12" fill="#FFD93D" />
              </svg>
            </div>
            <div className="sun-times">
              <span>
                Sunrise
                <strong>
                  {current
                    ? formatTime(current.sys.sunrise, tz, settings.timeFormat === '12')
                    : '--'}
                </strong>
              </span>
              <span>
                Solar Noon
                <strong>12:29 PM</strong>
              </span>
              <span>
                Sunset
                <strong>
                  {current
                    ? formatTime(current.sys.sunset, tz, settings.timeFormat === '12')
                    : '--'}
                </strong>
              </span>
            </div>
            <div className="moon-phase">{getMoonPhase()}</div>
          </div>

          <div className="aqi-card">
            <h4>Air Quality</h4>
            <div className="aqi-gauge">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E7ECF5" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#12B76A"
                  strokeWidth="10"
                  strokeDasharray={`${(aqiPercent / 100) * 314} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="aqi-gauge__center">
                <div className="aqi-gauge__value">{aqi}</div>
                <div className="aqi-gauge__label">{getAqiStatus(aqi)}</div>
              </div>
            </div>
            <a href="#aqi" className="aqi-link">
              View More →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
