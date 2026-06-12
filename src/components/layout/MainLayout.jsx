import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppBackground from '../common/AppBackground';
import Sidebar from './Sidebar';
import useBackgroundTheme from '../../hooks/useBackgroundTheme';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mood, timeOfDay } = useBackgroundTheme();

  return (
    <div
      className="app-shell"
      data-sky-mood={mood}
      data-time-of-day={timeOfDay}
    >
      <AppBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-layout">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </div>
    </div>
  );
}
