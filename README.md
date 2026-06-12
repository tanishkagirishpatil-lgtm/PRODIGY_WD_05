# SkyCast

A modern weather dashboard built with React + Vite, using live OpenWeatherMap data, Nominatim geocoding fallback, and Wikipedia city imagery.

## Features

- **Dashboard** — Real-time weather, metrics, 5-day forecast, live map
- **Search Weather** — Village/town/city search with Nominatim fallback + current location button
- **Forecast** — Hourly/Daily/7-day tabs with Chart.js charts
- **Saved Locations** — Persisted in LocalStorage with real weather per city
- **Profile & Settings** — Preferences, location permission, units

## Tech Stack

- React 19 + Vite + HashRouter (GitHub Pages compatible)
- OpenWeatherMap API + OpenStreetMap Nominatim
- Wikipedia REST API for city hero images
- Chart.js, Leaflet, LocalStorage, Geolocation API

## Getting Started

```bash
npm install
cp .env.example .env   # add VITE_OPENWEATHER_API_KEY
npm run dev
npm run build
```

## GitHub Pages

Deployed at `/PRODIGY_WD_05/` via HashRouter + `vite.config.js` base path.

## Author

Tanishka Patil

## License

MIT
