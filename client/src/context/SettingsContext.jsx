import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import settingsService from '../services/settingsService';
import { useLanguage } from './LanguageContext';

// Used until the server answers (and if it can't be reached), so the store
// always renders with sensible values.
const DEFAULTS = {
  supportEmail: 'support@abdull.com',
  freeShippingThreshold: 100,
  flatShippingFee: 15,
  announcementEnabled: true,
  announcements: [],
  flashSaleEndsAt: null,
  menuLinks: [],
  showCategoriesInMenu: true,
  heroSlides: [],
};

const SettingsContext = createContext({ settings: DEFAULTS, loaded: false });

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const { lang } = useLanguage();

  const refresh = useCallback(async () => {
    try {
      const res = await settingsService.getPublic();
      if (res.success && res.data) setSettings({ ...DEFAULTS, ...res.data });
    } catch (err) {
      console.warn('Could not load site settings, using defaults:', err.message);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Pick the shopper's language from an admin-entered { en, so, ar } value. */
  const localized = useCallback(
    (value) => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      return value[lang] || value.en || '';
    },
    [lang]
  );

  /** Fill {threshold} / {fee} placeholders with the configured shipping rule. */
  const fillShipping = useCallback(
    (text) =>
      String(text || '')
        .replace(/\{threshold\}/g, settings.freeShippingThreshold)
        .replace(/\{fee\}/g, settings.flatShippingFee),
    [settings.freeShippingThreshold, settings.flatShippingFee]
  );

  const value = useMemo(
    () => ({ settings, loaded, refresh, localized, fillShipping }),
    [settings, loaded, refresh, localized, fillShipping]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
