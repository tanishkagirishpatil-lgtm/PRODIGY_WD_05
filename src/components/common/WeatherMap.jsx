import { memo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

function WeatherMap({ lat, lon, cityName, temperature }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || lat == null || lon == null) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lon], 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstance.current = map;
    } else {
      mapInstance.current.flyTo([lat, lon], 10, { duration: 0.75 });
      window.setTimeout(() => mapInstance.current?.invalidateSize(), 150);
    }

    const tempLabel = temperature != null ? `${temperature}°` : '—';
    const createIcon = () =>
      L.divIcon({
        className: 'weather-map-marker',
        html: `<div class="map-pin" role="img" aria-label="${cityName || 'Location'}, ${tempLabel}">
          <div class="map-pin__bubble">
            <span class="map-pin__dot"></span>
            <span class="map-pin__temp">${tempLabel}</span>
          </div>
          <span class="map-pin__needle"></span>
        </div>`,
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      });

    markerRef.current?.remove();

    markerRef.current = L.marker([lat, lon], { icon: createIcon() })
      .bindTooltip(cityName || 'Current location', {
        permanent: true,
        direction: 'top',
        offset: [0, -42],
        className: 'map-tooltip',
      })
      .addTo(mapInstance.current);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [lat, lon, cityName, temperature]);

  return (
    <div
      className="weather-map-wrapper"
      role="region"
      aria-label={`Weather map for ${cityName || 'selected location'}`}
    >
      <div ref={mapRef} className="weather-map" />
    </div>
  );
}

export default memo(WeatherMap);
