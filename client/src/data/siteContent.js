// Help-center FAQs and policy pages, one file per language under ./content.
// Edit the text there; the pages render whatever the shopper's language exports.
import * as en from './content/en';
import * as so from './content/so';
import * as ar from './content/ar';

export const SUPPORT_EMAIL = 'support@abdull.com';

const byLang = { en, so, ar };

export const getSiteContent = (lang) => byLang[lang] || en;
