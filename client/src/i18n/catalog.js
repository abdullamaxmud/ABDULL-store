import { getCurrentLang } from './formatLocale';

// Translate data that comes from the database (category names/descriptions).
// Products keep their original names, like most international marketplaces.
// Order of preference: what the admin typed for this language → the built-in
// dictionary (by slug) → the English name stored in the database.

const pick = (cat, field, t) => {
  if (!cat) return '';
  const lang = getCurrentLang();
  const adminValue = lang !== 'en' && cat.translations?.[lang]?.[field];
  if (adminValue) return adminValue;
  const key = `categories.${cat.slug}.${field}`;
  const value = t(key);
  return value === key ? cat[field] : value;
};

export const categoryName = (cat, t) => pick(cat, 'name', t);

export const categoryDescription = (cat, t) => pick(cat, 'description', t);
