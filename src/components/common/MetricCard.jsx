import { memo } from 'react';

function MetricCard({ icon, label, value, sub, color = '#7C5CFF' }) {
  return (
    <div className="metric-card card fade-in" role="group" aria-label={`${label}: ${value}${sub ? `, ${sub}` : ''}`}>
      <div className="metric-card__icon" style={{ background: `${color}15`, color }} aria-hidden="true">
        {icon}
      </div>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{value}</div>
      {sub && <div className="metric-card__sub">{sub}</div>}
    </div>
  );
}

export default memo(MetricCard);
