import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, MoreVertical, Plus, Droplets, Wind, Eye, Search, X } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import HeroLandscape from '../components/common/HeroLandscape';
import { getCityVariant } from '../utils/cityVariants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApp } from '../context/AppContextCore';
import { getWeatherByCoords, hasApiKey, getDemoWeather } from '../services/weatherApi';
import {
  kelvinToCelsius,
  convertTemp,
  tempLabel,
  capitalize,
  convertWind,
  windUnitLabel,
  getAqiStatus,
} from '../utils/formatters';
import './SavedLocations.css';

function locationId(location) {
  return `${location.name}-${location.country}-${location.lat}-${location.lon}`;
}

function sameLocation(a, b) {
  return (
    a.name?.toLowerCase() === b.name?.toLowerCase() &&
    a.country === b.country &&
    Math.abs(Number(a.lat) - Number(b.lat)) < 0.01 &&
    Math.abs(Number(a.lon) - Number(b.lon)) < 0.01
  );
}

function demoVariation(name) {
  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    temp: 296 + (seed % 9),
    aqi: 25 + (seed % 4) * 25,
    humidity: 48 + (seed % 32),
    wind: 3 + (seed % 5),
  };
}

export default function SavedLocations() {
  const { onMenuClick } = useOutletContext();
  const { savedLocations, addSavedLocation, removeSavedLocation, settings, searchWeather } =
    useApp();
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  const locationKey = savedLocations
    .map((location) => `${location.name}-${location.country}-${location.lat}-${location.lon}`)
    .join(',');

  useEffect(() => {
    let active = true;

    async function loadAll() {
      setLoading(true);
      const results = await Promise.all(
        savedLocations.map(async (loc) => {
          try {
            let data;
            if (hasApiKey()) {
              data = await getWeatherByCoords(loc.lat, loc.lon);
            } else {
              const variation = demoVariation(loc.name);
              data = getDemoWeather();
              data.current.name = loc.name;
              data.current.main.temp = variation.temp;
              data.current.main.humidity = variation.humidity;
              data.current.wind.speed = variation.wind;
            }
            const fallbackAqi = demoVariation(loc.name).aqi;
            const aqi = data.airQuality?.list?.[0]?.main?.aqi
              ? data.airQuality.list[0].main.aqi * 25
              : fallbackAqi;
            return { ...loc, weather: data.current, aqi };
          } catch {
            return { ...loc, weather: null, aqi: 42 };
          }
        })
      );

      if (active) {
        setLocationData(results);
        setLoading(false);
      }
    }

    loadAll();
    return () => {
      active = false;
    };
  }, [locationKey, savedLocations]);

  const resetModal = () => {
    setQuery('');
    setCandidates([]);
    setSelectedCity(null);
    setAdding(false);
    setAddError('');
  };

  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  const openModal = () => {
    resetModal();
    setShowModal(true);
  };

  const findCities = async (event) => {
    event?.preventDefault();
    if (!query.trim()) return;

    setAdding(true);
    setAddError('');
    setSelectedCity(null);
    try {
      const cities = await searchWeather(query);
      setCandidates(cities);
      if (cities.length) {
        setSelectedCity(cities[0]);
      } else {
        setAddError('No matching city found. Try a nearby city name.');
      }
    } finally {
      setAdding(false);
    }
  };

  const saveSelectedCity = () => {
    if (!selectedCity) {
      setAddError('Search and choose a city first.');
      return;
    }

    const location = {
      name: selectedCity.name,
      country: selectedCity.country,
      state: selectedCity.state,
      lat: selectedCity.lat,
      lon: selectedCity.lon,
    };

    if (savedLocations.some((saved) => sameLocation(saved, location))) {
      setAddError(`${location.name} is already in your saved locations.`);
      return;
    }

    addSavedLocation(location);
    closeModal();
  };

  const unit = tempLabel(settings.tempUnit);

  return (
    <>
      <TopNavbar
        title="Saved Locations"
        subtitle="Quickly access weather updates for your favorite places."
        searchPlaceholder="Search for city or place..."
        onMenuClick={onMenuClick}
      />

      <div className="main-layout__content saved-page fade-in">
        <div className="saved-header-row">
          <div>
            <p className="saved-header-row__meta">
              {savedLocations.length} saved {savedLocations.length === 1 ? 'place' : 'places'}
            </p>
          </div>
          <button type="button" className="add-location-btn" onClick={openModal}>
            <Plus size={16} />
            Add New Location
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : savedLocations.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty__icon">
              <MapPin size={24} />
            </div>
            <h3>No Saved Locations</h3>
            <p>Add cities you check often and they will appear here.</p>
            <button type="button" className="add-location-btn" onClick={openModal}>
              <Plus size={16} />
              Add Location
            </button>
          </div>
        ) : (
          <>
            <div className="locations-grid">
              {locationData.map((loc) => {
                const w = loc.weather;
                const temp = w
                  ? convertTemp(kelvinToCelsius(w.main.temp), settings.tempUnit)
                  : '--';
                const aqiStatus = getAqiStatus(loc.aqi);
                const aqiClass =
                  aqiStatus === 'Good' ? 'aqi-good' : 'aqi-moderate';

                return (
                  <div key={locationId(loc)} className="location-card">
                    <div className="location-card__header">
                      <div>
                        <div className="location-card__pin">
                          <MapPin size={14} color="#7C5CFF" />
                          {loc.name}, {loc.country}
                        </div>
                        {loc.isCurrent && (
                          <span className="location-card__badge">Current Location</span>
                        )}
                      </div>
                      <div className="location-card__menu-wrap">
                        <button
                          type="button"
                          className="location-card__menu"
                          aria-label={`Actions for ${loc.name}`}
                          onClick={() =>
                            setMenuOpen(menuOpen === locationId(loc) ? null : locationId(loc))
                          }
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === locationId(loc) && (
                          <div className="location-card__menu-dropdown">
                            <button
                              type="button"
                              onClick={() => {
                                removeSavedLocation(loc);
                                setMenuOpen(null);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="location-card__body">
                      <div className="location-card__temp">
                        {temp}
                        {unit}
                      </div>
                      <div className="location-card__condition">
                        {w ? capitalize(w.weather?.[0]?.description) : '--'}
                      </div>
                    </div>
                    <div className="location-card__illustration">
                      <HeroLandscape
                        variant={getCityVariant(loc.name)}
                        city={loc.name}
                        condition={w?.weather?.[0]?.description}
                        timestamp={w?.dt}
                        timezone={w?.timezone || 0}
                        className="location-card__scene"
                      />
                    </div>
                    <div className="location-card__footer">
                      <div className="location-card__metric">
                        <Droplets size={14} color="#4DABF7" />
                        Humidity
                        <strong>{w?.main?.humidity || '--'}%</strong>
                      </div>
                      <div className="location-card__metric">
                        <Wind size={14} color="#12B76A" />
                        Wind
                        <strong>
                          {w
                            ? `${convertWind(w.wind?.speed || 0, settings.windUnit)} ${windUnitLabel(settings.windUnit)}`
                            : '--'}
                        </strong>
                      </div>
                      <div className="location-card__metric">
                        <Eye size={14} color="#7C5CFF" />
                        AQI
                        <strong className={aqiClass}>
                          {loc.aqi} {aqiStatus}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="add-placeholder" onClick={openModal}>
              <div className="add-placeholder__icon">
                <Plus size={24} />
              </div>
              <h4>Add New Location</h4>
              <p>Search for a city to add it to your saved locations.</p>
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className="add-modal" onClick={closeModal}>
          <div className="add-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal__header">
              <h3>Add New Location</h3>
              <button type="button" onClick={closeModal} aria-label="Close add location">
                <X size={18} />
              </button>
            </div>

            <form className="add-modal__search" onSubmit={findCities}>
              <div className="add-modal__input-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search city name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="add-modal__confirm" disabled={adding}>
                {adding ? 'Searching...' : 'Search'}
              </button>
            </form>

            {addError && <div className="add-modal__error">{addError}</div>}

            {candidates.length > 0 && (
              <div className="add-modal__results">
                {candidates.map((city) => {
                  const active = selectedCity?.lat === city.lat && selectedCity?.lon === city.lon;
                  const alreadySaved = savedLocations.some((saved) => sameLocation(saved, city));
                  return (
                    <button
                      type="button"
                      key={`${city.name}-${city.country}-${city.state || ''}-${city.lat}-${city.lon}`}
                      className={`add-modal__result ${active ? 'add-modal__result--active' : ''}`}
                      onClick={() => {
                        setSelectedCity(city);
                        setAddError('');
                      }}
                    >
                      <span>
                        <strong>{city.name}, {city.country}</strong>
                        <small>{city.state || 'Weather location'}</small>
                      </span>
                      {alreadySaved && <em>Saved</em>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="add-modal__actions">
              <button type="button" className="add-modal__cancel" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="add-modal__confirm" onClick={saveSelectedCity}>
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
