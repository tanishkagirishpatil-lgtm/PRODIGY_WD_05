import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SearchWeather from './pages/SearchWeather';
import Forecast from './pages/Forecast';
import SavedLocations from './pages/SavedLocations';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchWeather />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="saved" element={<SavedLocations />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
