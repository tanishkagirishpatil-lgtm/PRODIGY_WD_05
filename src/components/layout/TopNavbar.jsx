import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContextCore';
import { getGreeting } from '../../utils/formatters';
import './TopNavbar.css';

export default function TopNavbar({
  title,
  subtitle,
  showGreeting = false,
  searchPlaceholder = 'Search for city or place...',
  onMenuClick,
}) {
  const { profile, fetchCityWeather } = useApp();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    await fetchCityWeather(query);
    navigate('/search');
  };

  return (
    <header className="top-navbar">
      <button className="top-navbar__menu-btn" onClick={onMenuClick} aria-label="Menu">
        <Menu size={20} />
      </button>

      <div className="top-navbar__left">
        {showGreeting ? (
          <>
            <div className="top-navbar__greeting">
              {getGreeting()} 👋
            </div>
            <div className="top-navbar__subtitle">
              Here&apos;s the weather update for your location.
            </div>
          </>
        ) : title ? (
          <>
            <div className="top-navbar__page-title">{title}</div>
            {subtitle && <div className="top-navbar__page-subtitle">{subtitle}</div>}
          </>
        ) : null}
      </div>

      <form className="top-navbar__center" onSubmit={handleSearch}>
        <div className="top-navbar__search">
          <Search size={18} color="#667085" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="top-navbar__search-btn" aria-label="Search">
            <Search size={18} />
          </button>
        </div>
      </form>

      <div className="top-navbar__right">
        <button className="top-navbar__bell" aria-label="Notifications">
          <Bell size={18} />
          <span className="top-navbar__bell-dot" />
        </button>

        <div
          className="top-navbar__profile"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          tabIndex={0}
        >
          <img src={profile.avatar} alt={profile.name} className="top-navbar__avatar" />
          <span className="top-navbar__name">{profile.name}</span>
          <ChevronDown size={16} color="#667085" />

          {dropdownOpen && (
            <div className="top-navbar__dropdown">
              <a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
                Profile
              </a>
              <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                Settings
              </a>
              <button type="button">Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
