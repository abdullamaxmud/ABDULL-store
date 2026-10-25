import { getFormatLocale } from '../i18n/formatLocale';

/**
 * Formats date string to friendly readable format in the shopper's language
 * @param {string|Date} dateStr
 * @returns {string} e.g. "Oct 14, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(getFormatLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default formatDate;
