export default function MetricCard({ icon, label, value, sub, color = '#7C5CFF' }) {
  return (
    <div className="metric-card card fade-in">
      <div className="metric-card__icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{value}</div>
      {sub && <div className="metric-card__sub">{sub}</div>}
    </div>
  );
}
