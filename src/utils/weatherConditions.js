export function getConditionType(icon = '', description = '') {
  const code = icon?.replace('n', 'd') || '';
  const d = description.toLowerCase();

  if (code === '11d' || d.includes('thunder')) return 'thunderstorm';
  if (code === '13d' || d.includes('snow') || d.includes('sleet')) return 'snow';
  if (code === '50d' || d.includes('mist') || d.includes('fog') || d.includes('haze') || d.includes('smoke'))
    return 'mist';
  if (code === '09d' || code === '10d' || d.includes('rain') || d.includes('drizzle')) return 'rain';
  if (code === '03d' || code === '04d' || d.includes('overcast') || d.includes('cloud')) return 'cloudy';
  if (code === '01d' || d.includes('clear') || d.includes('sunny')) return 'sunny';
  if (code === '02d' || d.includes('partly')) return 'sunny';
  return 'cloudy';
}

export function getConditionLabel(type) {
  const labels = {
    sunny: 'Sunny',
    cloudy: 'Cloudy',
    rain: 'Rain',
    thunderstorm: 'Thunderstorm',
    snow: 'Snow',
    mist: 'Mist or fog',
  };
  return labels[type] || 'Weather';
}

export function getWeatherMoodFromCondition(condition = '') {
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return 'thunderstorm';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze') || c.includes('smoke')) return 'mist';
  if (c.includes('rain') || c.includes('drizzle')) return 'rain';
  if (c.includes('snow') || c.includes('sleet')) return 'snow';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloudy';
  return 'clear';
}
