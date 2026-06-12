import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Camera,
  Crown,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  Thermometer,
  Wind,
  Clock,
  Globe,
  Palette,
  ChevronRight,
  Plus,
  LogOut,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import { useApp } from '../context/AppContextCore';
import './Profile.css';

export default function Profile() {
  const { onMenuClick } = useOutletContext();
  const navigate = useNavigate();
  const { profile, settings, updateProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [notice, setNotice] = useState('');

  const preferences = [
    {
      icon: <Thermometer size={18} />,
      title: 'Temperature Unit',
      desc: 'Choose Celsius or Fahrenheit',
      value: `°${settings.tempUnit}`,
    },
    {
      icon: <Wind size={18} />,
      title: 'Wind Speed Unit',
      desc: 'Choose your preferred unit',
      value: settings.windUnit === 'kmh' ? 'km/h' : settings.windUnit,
    },
    {
      icon: <Clock size={18} />,
      title: 'Time Format',
      desc: '12-hour or 24-hour format',
      value: settings.timeFormat === '12' ? '12-hour (AM/PM)' : '24-hour',
    },
    {
      icon: <Globe size={18} />,
      title: 'Language',
      desc: 'Website display language',
      value: settings.language,
    },
    {
      icon: <Palette size={18} />,
      title: 'Theme',
      desc: 'Light or dark mode',
      value: settings.theme === 'light' ? 'Light' : 'Dark',
    },
  ];

  const openEditor = () => {
    setForm(profile);
    setEditing(true);
    setNotice('');
  };

  const handleFormChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    updateProfile({
      name: form.name.trim() || profile.name,
      email: form.email.trim() || profile.email,
      phone: form.phone.trim(),
      location: form.location.trim(),
      avatar: form.avatar.trim() || profile.avatar,
    });
    setEditing(false);
    setNotice('Profile details saved on this browser.');
  };

  const disconnectAccount = () => {
    updateProfile({ connectedEmail: '' });
    setNotice('Google account disconnected locally.');
  };

  const connectAccount = () => {
    updateProfile({ connectedEmail: profile.email });
    setNotice('Connected account set to your profile email.');
  };

  return (
    <>
      <TopNavbar onMenuClick={onMenuClick} />

      <div className="main-layout__content profile-page fade-in">
        <div className="profile-header">
          <h2>Profile</h2>
          <p>Manage your account and preferences.</p>
        </div>

        {notice && <div className="profile-notice">{notice}</div>}

        <div className="profile-grid">
          <div>
            <div className="profile-card">
              <div className="profile-info__avatar-wrap">
                <img src={profile.avatar} alt={profile.name} className="profile-info__avatar" />
                <button type="button" className="profile-info__camera" onClick={openEditor} aria-label="Edit avatar">
                  <Camera size={14} />
                </button>
              </div>
              <div className="profile-info__name">{profile.name}</div>
              <div className="profile-info__email">{profile.email}</div>
              {profile.premium && (
                <div className="profile-info__badge">
                  <Crown size={14} />
                  Premium Member
                </div>
              )}

              <div className="profile-details">
                {[
                  { icon: <User size={16} />, label: 'Full Name', value: profile.name },
                  { icon: <Mail size={16} />, label: 'Email Address', value: profile.email },
                  { icon: <Phone size={16} />, label: 'Phone Number', value: profile.phone || 'Not added' },
                  { icon: <MapPin size={16} />, label: 'Location', value: profile.location || 'Not added' },
                  { icon: <Calendar size={16} />, label: 'Member Since', value: profile.memberSince },
                ].map((row) => (
                  <div key={row.label} className="profile-detail-row">
                    <div className="profile-detail-row__icon">{row.icon}</div>
                    <div>
                      <div className="profile-detail-row__label">{row.label}</div>
                      <div className="profile-detail-row__value">{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className="edit-profile-btn" onClick={openEditor}>
                <Pencil size={16} />
                Edit Profile
              </button>
            </div>

            <div className="profile-card" style={{ marginTop: 20 }}>
              <h3>Connected Account</h3>
              <p className="profile-card__subtitle">Manage your linked accounts.</p>

              {profile.connectedEmail ? (
                <div className="connected-account">
                  <div className="connected-account__logo">G</div>
                  <div className="connected-account__info">
                    <div className="connected-account__email">{profile.connectedEmail}</div>
                    <span className="connected-account__badge">Connected</span>
                  </div>
                  <button type="button" className="connected-account__disconnect" onClick={disconnectAccount}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="profile-empty-state">No connected accounts yet.</div>
              )}

              <button type="button" className="connect-another" onClick={connectAccount}>
                <div className="connect-another__icon">
                  <Plus size={24} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Connect Another Account</div>
              </button>
            </div>
          </div>

          <div>
            <div className="profile-card">
              <h3>Preferences</h3>
              <p className="profile-card__subtitle">Customize your experience.</p>

              {preferences.map((pref) => (
                <div key={pref.title} className="preference-row">
                  <div className="preference-row__left">
                    <div className="preference-row__icon">{pref.icon}</div>
                    <div>
                      <div className="preference-row__title">{pref.title}</div>
                      <div className="preference-row__desc">{pref.desc}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="preference-row__value"
                    onClick={() => navigate('/settings')}
                  >
                    {pref.value}
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="profile-card" style={{ marginTop: 20 }}>
              <h3>About SkyCast</h3>
              <p className="profile-card__subtitle">Website information and support.</p>

              <div className="about-row">
                <span className="about-row__label">Website Version</span>
                <span className="about-row__value">v1.0.0</span>
              </div>
              <div className="about-row">
                <span className="about-row__label">Last Website Update</span>
                <span className="about-row__value">May 20, 2024</span>
              </div>
              {['Check for Updates', 'Help & Support', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <button
                  key={link}
                  type="button"
                  className="about-row about-row--button"
                  onClick={() => setNotice(`${link} content is not connected yet.`)}
                >
                  <span className="about-link">
                    {link}
                    <ChevronRight size={16} />
                  </span>
                </button>
              ))}

              <button
                type="button"
                className="logout-btn"
                onClick={() => setNotice('You have been logged out.')}
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="profile-modal" onClick={() => setEditing(false)}>
          <form className="profile-modal__content" onSubmit={saveProfile} onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal__header">
              <h3>Edit Profile</h3>
              <p>These details are saved locally in your browser.</p>
            </div>

            <label>
              Full Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                autoFocus
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </label>
            <label>
              Location
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </label>
            <label>
              Avatar URL
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => handleFormChange('avatar', e.target.value)}
              />
            </label>

            <div className="profile-modal__actions">
              <button type="button" className="profile-modal__cancel" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="profile-modal__save">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
