import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronRight, X, Droplets, Wind, Eye, Gauge, Sun } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import HeroLandscape from '../components/common/HeroLandscape';
import WeatherIcon from '../components/common/WeatherIcon';
import MetricCard from '../components/common/MetricCard';
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
  getUvStatus,
} from '../utils/formatters';
import './SearchWeather.css';

export default function SearchWeather() {
  const { onMenuClick } = useOutletContext();
  const {
    weather,
    loading,
    searchWeather,
    fetchCityWeather,
    recentSearches,
    clearRecentSearches,
    settings,
  } = useApp();

  const [query, setQuery] = useState('Mumbai');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const cities = await searchWeather(q);
      setResults(cities);
      if (cities.length) {
        setSelected(cities[0]);
        await fetchCityWeather(cities[0].name);
      }
    } finally {
      setSearching(false);
    }
  }, [searchWeather, fetchCityWeather]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      doSearch('Mumbai');
    }, 0);
    return () => window.clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  const selectCity = async (city) => {
    setSelected(city);
    setQuery(city.name);
    await fetchCityWeather(city.name);
  };

  const current = weather?.current;
  const tz = current?.timezone || 0;
  const unit = tempLabel(settings.tempUnit);
  const dailyForecast = weather?.forecast
    ? groupForecastByDay(weather.forecast.list, tz).slice(0, 5)
    : [];

  return (
    <>
      <TopNavbar onMenuClick={onMenuClick} />

      <div className="main-layout__content search-page fade-in">
        <div className="search-header">
          <h2>Search Weather</h2>
          <p>Find weather updates for any city in the world.</p>
        </div>

        <form className="search-controls" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city..."
            />
            {query && (
              <button type="button" className="clear" onClick={() => setQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="recent-searches">
          <span className="recent-searches__label">Recent Searches</span>
          {recentSearches.map((city) => (
            <button
              key={city}
              type="button"
              className="recent-tag"
              onClick={() => {
                setQuery(city);
                doSearch(city);
              }}
            >
              {city}
            </button>
          ))}
          <button type="button" className="recent-clear" onClick={clearRecentSearches}>
            Clear All
          </button>
        </div>

        {(loading || searching) && !current ? (
          <LoadingSpinner />
        ) : (
          <div className="search-layout">
            <div className="search-results">
              <h4>Search Results ({results.length})</h4>
              {results.map((city) => (
                <div
                  key={`${city.name}-${city.country}-${city.state || ''}-${city.lat}-${city.lon}`}
                  className={`result-card ${
                    selected?.lat === city.lat && selected?.lon === city.lon ? 'result-card--active' : ''
                  }`}
                  onClick={() => selectCity(city)}
                >
                  <div className="result-card__info">
                    <h5>
                      {city.name}, {city.country}
                    </h5>
                    <p>{city.state || city.country}</p>
                  </div>
                  <div className="result-card__weather">
                    <div>
                      <div className="result-card__temp">
                        {current && selected?.lat === city.lat && selected?.lon === city.lon
                          ? `${convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit)}${unit}`
                          : '--'}
                      </div>
                      <div className="result-card__condition">
                        {current && selected?.lat === city.lat && selected?.lon === city.lon
                          ? capitalize(current.weather?.[0]?.description)
                          : ''}
                      </div>
                    </div>
                    {current && selected?.lat === city.lat && selected?.lon === city.lon && (
                      <WeatherIcon icon={current.weather?.[0]?.icon} size={28} />
                    )}
                    <ChevronRight size={16} color="#667085" />
                  </div>
                </div>
              ))}
            </div>

            {current && (
              <div className="preview-panel">
                <div className="preview-hero">
                  <HeroLandscape
                    city={current.name}
                    condition={current.weather?.[0]?.description}
                    timestamp={current.dt}
                    timezone={tz}
                  />
                  <div className="preview-hero__content">
                    <div className="preview-hero__city">
                      {current.name}, {current.sys?.country}
                    </div>
                    <div className="preview-hero__datetime">
                      {formatDate(current.dt, tz)} •{' '}
                      {formatTime(current.dt, tz, settings.timeFormat === '12')}
                    </div>
                    <div className="preview-hero__temp">
                      {convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit)}
                      {unit}
                    </div>
                    <div className="preview-hero__condition">
                      {capitalize(current.weather?.[0]?.description)}
                    </div>
                    <div className="preview-hero__feels">
                      Feels like{' '}
                      {convertTemp(kelvinToCelsius(current.main.feels_like), settings.tempUnit)}°
                    </div>
                  </div>
                </div>

                <div className="preview-metrics-bar">
                  {[
                    {
                      lbl: 'Max Temp',
                      val: `${convertTemp(kelvinToCelsius(current.main.temp_max), settings.tempUnit)}°`,
                    },
                    {
                      lbl: 'Min Temp',
                      val: `${convertTemp(kelvinToCelsius(current.main.temp_min), settings.tempUnit)}°`,
                    },
                    { lbl: 'Humidity', val: `${current.main.humidity}%` },
                    {
                      lbl: 'Wind',
                      val: `${convertWind(current.wind.speed, settings.windUnit)} ${windUnitLabel(settings.windUnit)} ${degToDirection(current.wind.deg)}`,
                    },
                    { lbl: 'Visibility', val: `${(current.visibility / 1000).toFixed(0)} km` },
                    { lbl: 'Pressure', val: `${current.main.pressure} mb` },
                  ].map((m) => (
                    <div key={m.lbl} className="preview-metrics-bar__item">
                      <span className="lbl">{m.lbl}</span>
                      <span className="val">{m.val}</span>
                    </div>
                  ))}
                </div>

                <div className="preview-forecast">
                  <div className="section-header">
                    <h3>5-Day Forecast</h3>
                    <a href="/forecast">View Full Forecast →</a>
                  </div>
                  <div className="forecast-cards">
                    {dailyForecast.map((day, i) => (
                      <div
                        key={day.date}
                        className={`forecast-card ${i === 2 ? 'forecast-card--active' : ''}`}
                      >
                        <div className="forecast-card__day">{formatDay(day.dt, tz)}</div>
                        <div className="forecast-card__date">{formatShortDate(day.dt, tz)}</div>
                        <div className="forecast-card__icon">
                          <WeatherIcon icon={day.icon} size={28} />
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

                <div className="preview-details">
                  <MetricCard
                    icon={<Droplets size={18} />}
                    label="Humidity"
                    value={`${current.main.humidity}%`}
                    sub={getHumidityStatus(current.main.humidity)}
                    color="#4DABF7"
                  />
                  <MetricCard
                    icon={<Wind size={18} />}
                    label="Wind"
                    value={`${convertWind(current.wind.speed, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`}
                    sub={degToDirection(current.wind.deg)}
                    color="#12B76A"
                  />
                  <MetricCard
                    icon={<Eye size={18} />}
                    label="Visibility"
                    value={`${(current.visibility / 1000).toFixed(0)} km`}
                    sub={getVisibilityStatus(current.visibility / 1000)}
                    color="#F79009"
                  />
                  <MetricCard
                    icon={<Gauge size={18} />}
                    label="Pressure"
                    value={`${current.main.pressure} mb`}
                    sub="Steady"
                    color="#7C5CFF"
                  />
                  <MetricCard
                    icon={<Sun size={18} />}
                    label="UV Index"
                    value="5"
                    sub={getUvStatus(5)}
                    color="#F79009"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
