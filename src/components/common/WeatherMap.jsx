import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const cityMarkers = [
  { name: 'Tumakuru', lat: 13.3409, lon: 77.101, temp: 26 },
  { name: 'Kolar', lat: 13.136, lon: 78.129, temp: 27 },
  { name: 'Mandya', lat: 12.5218, lon: 76.8951, temp: 28 },
  { name: 'Hosur', lat: 12.7409, lon: 77.8253, temp: 27 },
];

export default function WeatherMap({ lat, lon, cityName }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lon], 9);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const createIcon = (temp) =>
      L.divIcon({
        className: 'weather-map-marker',
        html: `<div class="map-pin"><span>${temp}°</span></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

    cityMarkers.forEach((c) => {
      L.marker([c.lat, c.lon], { icon: createIcon(c.temp) })
        .bindTooltip(c.name, { permanent: false })
        .addTo(map);
    });

    L.marker([lat, lon], { icon: createIcon('●') })
      .bindTooltip(cityName || 'Current', { permanent: true, direction: 'top' })
      .addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [lat, lon, cityName]);

  useEffect(() => {
    mapInstance.current?.setView([lat, lon], 9);
  }, [lat, lon]);

  return (
    <div className="weather-map-wrapper">
      <div ref={mapRef} className="weather-map" />
      <div className="weather-map-legend">
        <span><i className="dot rain" /> Rain</span>
        <span><i className="dot clouds" /> Clouds</span>
        <span><i className="dot snow" /> Snow</span>
        <span><i className="dot clear" /> Clear</span>
      </div>
    </div>
  );
}
