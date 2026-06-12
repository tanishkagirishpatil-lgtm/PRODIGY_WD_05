import { useApp } from '../context/AppContextCore';
import { getBackgroundTheme } from '../utils/backgroundTheme';

export default function useBackgroundTheme() {
  const { weather, settings } = useApp();
  const current = weather?.current;

  return getBackgroundTheme({
    condition: current?.weather?.[0]?.description || '',
    timestamp: current?.dt,
    timezone: current?.timezone || 0,
    theme: settings.theme,
  });
}
