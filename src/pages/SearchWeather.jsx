import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronRight, X, Droplets, Wind, Eye, Gauge, MapPin, Loader2 } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import CityHeroImage from '../components/common/CityHeroImage';
import WeatherIcon from '../components/common/WeatherIcon';
import MetricCard from '../components/common/MetricCard';
import WeatherSkeleton from '../components/common/WeatherSkeleton';
import { useApp } from '../context/AppContextCore';
import { groupForecastByDay } from '../services/weatherApi';
import { getWeatherErrorMessage } from '../utils/errors';
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
    requestLocation,
    locationLoading,
    locationError,
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const cities = await searchWeather(q);
      setResults(cities);
      if (cities.length) {
        setSelected(cities[0]);
        await fetchCityWeather(cities[0]);
      } else {
        setSearchError(`No locations found for "${q}". Try a nearby town or district name.`);
      }
    } catch (err) {
      setSearchError(getWeatherErrorMessage(err));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchWeather, fetchCityWeather]);

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  const selectCity = async (city) => {
    setSelected(city);
    setQuery(city.name);
    setSearchError('');
    try {
      await fetchCityWeather(city);
    } catch (err) {
      setSearchError(getWeatherErrorMessage(err));
    }
  };

  const handleUseCurrentLocation = async () => {
    setSearchError('');
    try {
      const geo = await requestLocation();
      setResults([geo]);
      setSelected(geo);
      setQuery(geo.name);
    } catch (err) {
      if (locationError) setSearchError(locationError);
      else if (err?.message !== 'unsupported') setSearchError(getWeatherErrorMessage(err));
    }
  };

  const current = weather?.current;
  const tz = current?.timezone || 0;
  const unit = tempLabel(settings.tempUnit);
  const dailyForecast = weather?.forecast
    ? groupForecastByDay(weather.forecast.list, tz).slice(0, 5)
    : [];

  const isSelected = (city) =>
    selected?.lat === city.lat && selected?.lon === city.lon;

  const previewLoading =
    (loading || searching) &&
    selected &&
    (!current ||
      Math.abs((current.coord?.lat ?? 0) - selected.lat) > 0.02 ||
      Math.abs((current.coord?.lon ?? 0) - selected.lon) > 0.02);

  return (
    <>
      <TopNavbar onMenuClick={onMenuClick} />

      <div className="main-layout__content search-page fade-in">
        <div className="search-header">
          <h2>Search Weather</h2>
          <p>Find weather updates for any city, town, or locality in the world.</p>
        </div>

        <form className="search-controls" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search village, town, city, or district..."
              aria-label="Search for a location"
            />
            {query && (
              <button type="button" className="clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn" disabled={searching} aria-label="Search locations">
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="search-actions">
          <button
            type="button"
            className="use-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={locationLoading}
            aria-label="Use current location"
          >
            {locationLoading ? (
              <>
                <Loader2 size={16} className="spin" /> Detecting...
              </>
            ) : (
              <>
                <MapPin size={16} /> Use Current Location
              </>
            )}
          </button>
        </div>

        {(searchError || locationError) && (
          <div className="error-banner">{searchError || locationError}</div>
        )}

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <span className="recent-searches__label">Recent Searches</span>
            {recentSearches.map((label) => (
              <button
                key={label}
                type="button"
                className="recent-tag"
                onClick={() => {
                  setQuery(label.split(',')[0].trim());
                  doSearch(label.split(',')[0].trim());
                }}
              >
                {label}
              </button>
            ))}
            <button type="button" className="recent-clear" onClick={clearRecentSearches}>
              Clear All
            </button>
          </div>
        )}

        {(loading || searching) && !current && !results.length ? (
          <div className="search-layout">
            <WeatherSkeleton type="search-results" />
          </div>
        ) : (
          <div className="search-layout">
            <div className="search-results">
              <h4>Search Results ({results.length})</h4>
              {results.length === 0 && !searching && (
                <p className="search-results__empty">Search for a location to see results here.</p>
              )}
              {results.map((city) => (
                <div
                  key={`${city.name}-${city.country}-${city.state || ''}-${city.lat}-${city.lon}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected(city)}
                  aria-label={`${city.name}, ${city.country}`}
                  className={`result-card ${isSelected(city) ? 'result-card--active' : ''}`}
                  onClick={() => selectCity(city)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectCity(city);
                    }
                  }}
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
                        {current && isSelected(city)
                          ? `${convertTemp(kelvinToCelsius(current.main.temp), settings.tempUnit)}${unit}`
                          : '--'}
                      </div>
                      <div className="result-card__condition">
                        {current && isSelected(city)
                          ? capitalize(current.weather?.[0]?.description)
                          : ''}
                      </div>
                    </div>
                    {current && isSelected(city) && (
                      <WeatherIcon
                        icon={current.weather?.[0]?.icon}
                        description={current.weather?.[0]?.description}
                        size={28}
                      />
                    )}
                    <ChevronRight size={16} color="#667085" />
                  </div>
                </div>
              ))}
            </div>

            {previewLoading && <WeatherSkeleton type="preview" />}

            {current && selected && !previewLoading && (
              <div className="preview-panel">
                <div className="preview-hero">
                  <CityHeroImage
                    city={current.name}
                    state={selected.state || ''}
                    country={current.sys?.country || ''}
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
                    <div className="preview-hero__condition-row">
                      <WeatherIcon
                        icon={current.weather?.[0]?.icon}
                        description={current.weather?.[0]?.description}
                        size={36}
                      />
                      <div className="preview-hero__condition">
                        {capitalize(current.weather?.[0]?.description)}
                      </div>
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
                      val: `${convertWind(current.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)} ${degToDirection(current.wind?.deg || 0)}`,
                    },
                    {
                      lbl: 'Visibility',
                      val: `${((current.visibility || 0) / 1000).toFixed(0)} km`,
                    },
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
                    <a href="#/forecast">View Full Forecast →</a>
                  </div>
                  <div className="forecast-cards">
                    {dailyForecast.map((day, i) => (
                      <div
                        key={day.date}
                        className={`forecast-card ${i === 0 ? 'forecast-card--active' : ''}`}
                      >
                        <div className="forecast-card__day">{formatDay(day.dt, tz)}</div>
                        <div className="forecast-card__date">{formatShortDate(day.dt, tz)}</div>
                        <div className="forecast-card__icon">
                          <WeatherIcon icon={day.icon} description={day.description} size={28} />
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
                    value={`${convertWind(current.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`}
                    sub={degToDirection(current.wind?.deg || 0)}
                    color="#12B76A"
                  />
                  <MetricCard
                    icon={<Eye size={18} />}
                    label="Visibility"
                    value={`${((current.visibility || 0) / 1000).toFixed(0)} km`}
                    sub={getVisibilityStatus((current.visibility || 0) / 1000)}
                    color="#F79009"
                  />
                  <MetricCard
                    icon={<Gauge size={18} />}
                    label="Pressure"
                    value={`${current.main.pressure} mb`}
                    sub="Steady"
                    color="#7C5CFF"
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
