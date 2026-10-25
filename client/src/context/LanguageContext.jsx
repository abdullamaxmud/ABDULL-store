import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../i18n/locales/en';
import so from '../i18n/locales/so';
import ar from '../i18n/locales/ar';
import { setFormatLocale } from '../i18n/formatLocale';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr', intl: 'en-US' },
  { code: 'so', label: 'Soomaali', short: 'SO', dir: 'ltr', intl: 'so-SO' },
  // Latin digits keep prices, order numbers and quantities consistent across languages
  { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl', intl: 'ar-u-nu-latn' },
];

const dictionaries = { en, so, ar };
const STORAGE_KEY = 'abdull_lang';

const detectInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) return saved;
  } catch {
    // storage blocked — fall through to browser language
  }
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return dictionaries[browser] ? browser : 'en';
};

/**
 * Apply lang/dir to <html>. Called once at load (before React paints, so the page
 * never flashes left-to-right) and on every switch. Transitions are paused for a
 * frame so slide-out panels don't visibly sweep across when direction flips.
 */
const applyDocumentLanguage = (code) => {
  const meta = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  setFormatLocale(meta.intl, meta.code);
  const root = document.documentElement;
  if (root.lang === code && root.dir === meta.dir) return;
  root.classList.add('lang-switching');
  root.lang = code;
  root.dir = meta.dir;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('lang-switching')));
};

applyDocumentLanguage(detectInitialLanguage());

const lookup = (dict, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(detectInitialLanguage);
  const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  // Plain helpers (dates, category names) must see the new language in this same render
  setFormatLocale(meta.intl, meta.code);

  useEffect(() => {
    applyDocumentLanguage(lang);
    // Swap the tab title only when it is a default one; pages with their own title set it themselves
    const defaults = Object.values(dictionaries).map((d) => d.meta.defaultTitle);
    if (defaults.includes(document.title)) document.title = dictionaries[lang].meta.defaultTitle;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang, meta]);

  /**
   * Translate a dotted key, e.g. t('cart.title') or t('cart.count', { count: 3 }).
   * Falls back to English, then to the key itself, so a missing string is visible but never crashes.
   */
  const t = useCallback(
    (key, vars) => {
      let value = lookup(dictionaries[lang], key);
      if (value === undefined) value = lookup(en, key);
      if (value === undefined) return key;
      if (typeof value !== 'string' || !vars) return value;
      return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? vars[name] : match));
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang: setLangState, t, dir: meta.dir, isRTL: meta.dir === 'rtl', languages: LANGUAGES, intlLocale: meta.intl }),
    [lang, t, meta]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;
