import { getFormatLocale } from '../i18n/formatLocale';

/**
 * Formats a numeric value into USD currency representation
 * @param {number} amount
 * @returns {string} e.g. "$129.99"
 */
export const formatCurrency = (amount) => {
  const value =
    amount === undefined || amount === null || isNaN(amount)
      ? '$0.00'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
  // Inside Arabic (right-to-left) text the "$" would jump to the other side;
  // Unicode isolate marks keep "$189.00" reading the same in every language.
  return getFormatLocale().startsWith('ar') ? `⁦${value}⁩` : value;
};

export default formatCurrency;
