<<<<<<< HEAD
# SkyCast

A modern weather website built with React + Vite, matching a glassmorphism-inspired design system with live OpenWeatherMap data.

## Features

- **Dashboard** — Hero weather card, metrics, 5-day forecast, live map
- **Search Weather** — City search with recent searches and preview panel
- **Forecast** — Hourly/Daily/7-day tabs with Chart.js temperature & precipitation charts
- **Saved Locations** — Grid of location cards persisted in LocalStorage
- **Profile** — User info, preferences, connected accounts
- **Settings** — Unit toggles, theme, notifications, location permission

## Tech Stack

- React 19 + Vite
- React Router
- Chart.js + react-chartjs-2
- Leaflet (weather map)
- Lucide React (icons)
- OpenWeatherMap API
- Geolocation API
- LocalStorage

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API key**

   Copy `.env.example` to `.env` and add your [OpenWeatherMap](https://openweathermap.org/api) API key:

   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

   Without an API key, the website runs with demo data for Bangalore.

3. **Start dev server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

## Design System

| Token | Value |
|-------|-------|
| Background | `#F7F9FC` |
| Primary Text | `#102A56` |
| Secondary Text | `#667085` |
| Accent Purple | `#7C5CFF` |
| Light Purple | `#F3EEFF` |
| Card Background | `#FFFFFF` |
| Border | `#E7ECF5` |
| Font | Plus Jakarta Sans |

## Project Structure

```
src/
├── components/
│   ├── charts/       # Chart.js wrappers
│   ├── common/       # Shared UI (icons, map, metrics)
│   └── layout/       # Sidebar, Navbar, MainLayout
├── context/          # Website state & weather fetching
├── hooks/            # useLocalStorage
├── pages/            # Route pages
├── services/         # OpenWeatherMap API
└── utils/            # Formatters & helpers
```

## License

MIT
=======
# SkyCast ☁️

SkyCast is a modern weather dashboard application that provides real-time weather information, detailed forecasts, air quality insights, and location-based weather updates. Built with React and Vite, it offers a clean, responsive, and user-friendly experience inspired by modern SaaS dashboard designs.

## Features

* Real-time weather updates
* Current location weather detection
* City search functionality
* 7-day weather forecast
* Air Quality Index (AQI)
* Saved locations
* Weather trends and charts
* Sunrise and sunset information
* Responsive design for desktop, tablet, and mobile
* Modern UI/UX with premium dashboard aesthetics

## Tech Stack

* React
* Vite
* JavaScript
* CSS3
* OpenWeatherMap API
* Chart.js
* LocalStorage
* Geolocation API

## Author

Tanishka Patil

>>>>>>> c7f02e16f59c4ebfe1fee1a45db7bde0131736be
