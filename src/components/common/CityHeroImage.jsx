import { useState, useEffect } from 'react';
import { getCityImage } from '../../services/cityImages';
import './CityHeroImage.css';

export default function CityHeroImage({
  city,
  state = '',
  country = '',
  className = '',
  variant = 'hero',
}) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    getCityImage(city, state, country).then((result) => {
      if (!active) return;
      if (result?.url) {
        setImage(result.url);
      } else {
        setImage(null);
        setFailed(true);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [city, state, country]);

  return (
    <div
      className={`city-hero ${variant === 'card' ? 'city-hero--card' : ''} ${className}`}
      aria-busy={loading}
      aria-label={loading ? `Loading image for ${city}` : undefined}
    >
      {loading && <div className="city-hero__skeleton skeleton" aria-hidden="true" />}
      {!loading && image && (
        <img
          src={image}
          alt={`${city}${state ? `, ${state}` : ''}`}
          className="city-hero__photo"
          loading="lazy"
          onError={() => {
            setImage(null);
            setFailed(true);
          }}
        />
      )}
      {!loading && failed && (
        <div className="city-hero__fallback" aria-hidden="true">
          <div className="city-hero__fallback-sky" />
          <div className="city-hero__fallback-hills" />
        </div>
      )}
      <div className="city-hero__overlay" />
    </div>
  );
}
