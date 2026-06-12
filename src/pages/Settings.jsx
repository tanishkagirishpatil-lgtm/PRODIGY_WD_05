import { useOutletContext } from 'react-router-dom';
import TopNavbar from '../components/layout/TopNavbar';
import { useApp } from '../context/AppContextCore';
import './Settings.css';

function Toggle({ on, onChange }) {
  return (
    <div
      className={`toggle-switch ${on ? 'toggle-switch--on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onChange(!on)}
    >
      <div className="toggle-switch__knob" />
    </div>
  );
}

export default function Settings() {
  const { onMenuClick } = useOutletContext();
  const { settings, updateSetting, requestLocation, locationLoading, locationError } = useApp();

  return (
    <>
      <TopNavbar
        title="Settings"
        subtitle="Configure your weather website preferences."
        onMenuClick={onMenuClick}
      />

      <div className="main-layout__content settings-page fade-in">
        {locationError && <div className="error-banner">{locationError}</div>}

        <div className="settings-section">
          <h3>Units & Display</h3>
          <p className="settings-section__desc">Choose how weather data is displayed.</p>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Temperature Unit</h4>
              <p>Switch between Celsius and Fahrenheit</p>
            </div>
            <div className="unit-toggle">
              <button
                type="button"
                className={settings.tempUnit === 'C' ? 'active' : ''}
                onClick={() => updateSetting('tempUnit', 'C')}
              >
                °C
              </button>
              <button
                type="button"
                className={settings.tempUnit === 'F' ? 'active' : ''}
                onClick={() => updateSetting('tempUnit', 'F')}
              >
                °F
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Wind Speed Unit</h4>
              <p>Select your preferred wind speed unit</p>
            </div>
            <select
              className="settings-select"
              value={settings.windUnit}
              onChange={(e) => updateSetting('windUnit', e.target.value)}
            >
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
              <option value="ms">m/s</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Time Format</h4>
              <p>12-hour or 24-hour clock</p>
            </div>
            <div className="unit-toggle">
              <button
                type="button"
                className={settings.timeFormat === '12' ? 'active' : ''}
                onClick={() => updateSetting('timeFormat', '12')}
              >
                12h
              </button>
              <button
                type="button"
                className={settings.timeFormat === '24' ? 'active' : ''}
                onClick={() => updateSetting('timeFormat', '24')}
              >
                24h
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <p className="settings-section__desc">Customize the look and feel.</p>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Theme</h4>
              <p>Switch between light and dark mode</p>
            </div>
            <Toggle
              on={settings.theme === 'dark'}
              onChange={(v) => updateSetting('theme', v ? 'dark' : 'light')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Language</h4>
              <p>Website display language</p>
            </div>
            <select
              className="settings-select"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications & Location</h3>
          <p className="settings-section__desc">Manage alerts and location access.</p>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Notifications</h4>
              <p>Receive weather alerts and updates</p>
            </div>
            <Toggle
              on={settings.notifications}
              onChange={(v) => updateSetting('notifications', v)}
            />
          </div>

          <div className="setting-item">
            <div className="setting-item__info">
              <h4>Location Permission</h4>
              <p>
                {settings.locationEnabled
                  ? 'Location access is enabled'
                  : 'Enable to get weather for your current location'}
              </p>
            </div>
            <button
              type="button"
              className={`settings-btn ${settings.locationEnabled ? 'settings-btn--outline' : ''}`}
              onClick={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Detecting...' : settings.locationEnabled ? 'Refresh Location' : 'Enable Location'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
