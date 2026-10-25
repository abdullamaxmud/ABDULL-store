import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const split = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

/**
 * Live countdown to the flash-sale end date set in Admin → Site Settings.
 * `active` is false when no end date is set or the sale has ended, so the
 * storefront never shows a fake timer.
 */
const useFlashCountdown = () => {
  const { settings } = useSettings();
  const endsAt = settings.flashSaleEndsAt ? new Date(settings.flashSaleEndsAt).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endsAt || endsAt <= Date.now()) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const remaining = endsAt - now;
  return { active: remaining > 0, ...split(remaining) };
};

export default useFlashCountdown;
