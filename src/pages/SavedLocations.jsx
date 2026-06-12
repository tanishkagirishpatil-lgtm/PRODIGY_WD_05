import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { MapPin, MoreVertical, Plus, Droplets, Wind, Eye, Search, X } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import CityHeroImage from '../components/common/CityHeroImage';
import WeatherSkeleton from '../components/common/WeatherSkeleton';
import { useApp } from '../context/AppContextCore';
import { getWeatherByCoords, getAqiValue } from '../services/weatherApi';
import { getWeatherErrorMessage } from '../utils/errors';
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

export default function SavedLocations() {
  const { onMenuClick } = useOutletContext();
  const { savedLocations, addSavedLocation, removeSavedLocation, settings, searchWeather, currentLocation } =
    useApp();
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
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
      if (!savedLocations.length) {
        setLocationData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');

      const results = await Promise.all(
        savedLocations.map(async (loc) => {
          try {
            const data = await getWeatherByCoords(loc.lat, loc.lon);
            const aqi = getAqiValue(data.airQuality);
            const isCurrent = currentLocation ? sameLocation(loc, currentLocation) : loc.isCurrent;
            return { ...loc, isCurrent, weather: data.current, aqi };
          } catch (err) {
            return { ...loc, weather: null, aqi: null, error: getWeatherErrorMessage(err) };
          }
        })
      );

      if (active) {
        setLocationData(results);
        setLoading(false);
        const failed = results.filter((r) => !r.weather).length;
        if (failed === results.length) {
          setLoadError('Unable to load saved location weather. Check your connection.');
        }
      }
    }

    loadAll();
    return () => {
      active = false;
    };
  }, [locationKey, savedLocations, currentLocation]);

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
        setAddError('No matching location found. Try a village, town, or district name.');
      }
    } catch (err) {
      setAddError(getWeatherErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const saveSelectedCity = () => {
    if (!selectedCity) {
      setAddError('Search and choose a location first.');
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

        {loadError && <div className="error-banner">{loadError}</div>}

        {loading ? (
          <WeatherSkeleton type="cards" />
        ) : savedLocations.length === 0 ? (
          <div className="saved-empty" role="status">
            <div className="saved-empty__icon saved-empty__icon--illustration" aria-hidden="true">
              <MapPin size={28} strokeWidth={1.5} />
              <span className="saved-empty__icon-badge">
                <Search size={14} />
              </span>
            </div>
            <h3>No saved locations yet</h3>
            <p>Search for cities you visit often and save them for quick access.</p>
            <Link to="/search" className="add-location-btn saved-empty__cta">
              <Search size={16} aria-hidden="true" />
              Search Locations
            </Link>
          </div>
        ) : (
          <>
            <div className="locations-grid">
              {locationData.map((loc) => {
                const w = loc.weather;
                const temp = w
                  ? convertTemp(kelvinToCelsius(w.main.temp), settings.tempUnit)
                  : '--';
                const aqiStatus = loc.aqi != null ? getAqiStatus(loc.aqi) : null;
                const aqiClass =
                  aqiStatus === 'Good' ? 'aqi-good' : aqiStatus ? 'aqi-moderate' : '';

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
                        {w ? capitalize(w.weather?.[0]?.description) : loc.error || 'Unavailable'}
                      </div>
                    </div>
                    <div className="location-card__illustration">
                      <CityHeroImage
                        city={loc.name}
                        state={loc.state || ''}
                        country={loc.country}
                        variant="card"
                        className="location-card__scene"
                      />
                    </div>
                    <div className="location-card__footer">
                      <div className="location-card__metric">
                        <Droplets size={14} color="#4DABF7" />
                        Humidity
                        <strong>{w?.main?.humidity ?? '--'}%</strong>
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
                          {loc.aqi != null ? `${loc.aqi} ${aqiStatus}` : 'N/A'}
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
                  placeholder="Search village, town, or city..."
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
