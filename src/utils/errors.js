export function getGeolocationErrorMessage(error) {
  if (!error) return 'Unable to retrieve your location.';
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. Enable it in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable right now.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to retrieve your location.';
  }
}

export function getWeatherErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.code === 'MISSING_KEY') return error.message;
  if (error.code === 'NOT_FOUND') return error.message;
  if (error.code === 'TIMEOUT') return error.message;
  if (error.code === 'NETWORK') return error.message;
  if (error.code === 'INVALID_KEY') return 'Invalid API key. Check your OpenWeatherMap configuration.';
  return error.message || 'Failed to load weather data.';
}
