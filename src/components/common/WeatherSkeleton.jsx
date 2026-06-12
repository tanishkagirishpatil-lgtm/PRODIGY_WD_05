export default function WeatherSkeleton({ type = 'dashboard' }) {
  if (type === 'hero') {
    return (
      <div className="skeleton-hero" aria-busy="true" aria-label="Loading weather">
        <div className="skeleton skeleton-hero__image" />
        <div className="skeleton-hero__content">
          <div className="skeleton skeleton-line skeleton-line--sm" />
          <div className="skeleton skeleton-line skeleton-line--xs" />
          <div className="skeleton skeleton-line skeleton-line--xl" />
          <div className="skeleton skeleton-line skeleton-line--md" />
        </div>
      </div>
    );
  }

  if (type === 'metrics') {
    return (
      <div className="skeleton-metrics" aria-busy="true" aria-label="Loading metrics">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton skeleton-metric" />
        ))}
      </div>
    );
  }

  if (type === 'search-results') {
    return (
      <div className="skeleton-search" aria-busy="true" aria-label="Loading search results">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton skeleton-search-item" />
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="skeleton-cards" aria-busy="true" aria-label="Loading saved locations">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  if (type === 'preview') {
    return (
      <div className="skeleton-preview" aria-busy="true" aria-label="Loading weather preview">
        <div className="skeleton skeleton-preview__hero" />
        <div className="skeleton skeleton-preview__bar" />
        <div className="skeleton-forecast-row">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton skeleton-forecast-chip" />
          ))}
        </div>
        <div className="skeleton-preview__metrics">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton skeleton-metric skeleton-metric--sm" />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'map') {
    return (
      <div className="skeleton-map" aria-busy="true" aria-label="Loading weather map">
        <div className="skeleton skeleton-map__canvas" />
      </div>
    );
  }

  if (type === 'aqi') {
    return (
      <div className="skeleton-aqi" aria-busy="true" aria-label="Loading air quality">
        <div className="skeleton skeleton-aqi__gauge" />
        <div className="skeleton skeleton-line skeleton-line--sm" />
      </div>
    );
  }

  if (type === 'forecast-grid') {
    return (
      <div className="skeleton-forecast-section" aria-busy="true" aria-label="Loading forecast">
        <div className="skeleton skeleton-line skeleton-line--sm" />
        <div className="skeleton-forecast-row">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton skeleton-forecast-chip" />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'charts') {
    return (
      <div className="skeleton-charts" aria-busy="true" aria-label="Loading charts">
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-chart" />
      </div>
    );
  }

  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading page">
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-metrics">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton skeleton-metric" />
        ))}
      </div>
      <div className="skeleton-forecast-row">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton skeleton-forecast-chip" />
        ))}
      </div>
    </div>
  );
}
