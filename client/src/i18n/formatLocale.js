// Locale used by plain (non-React) helpers such as formatDate and category names.
// LanguageProvider updates it whenever the shopper switches language.
let currentLocale = 'en-US';
let currentLang = 'en';

export const setFormatLocale = (locale, lang) => {
  currentLocale = locale;
  if (lang) currentLang = lang;
};

export const getFormatLocale = () => currentLocale;

export const getCurrentLang = () => currentLang;
