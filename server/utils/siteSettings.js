const SiteSettings = require('../models/SiteSettings');

// Settings are read on every cart total and page load, so keep one cached copy
// and drop it whenever an admin saves.
let cached = null;
let cachedAt = 0;
const TTL_MS = 60 * 1000;

const DEFAULT_ANNOUNCEMENTS = [
  { text: { en: '⚡ FLASH SALE: UP TO 70% OFF NEW SEASON DROPS', so: '⚡ IIB DEGDEG AH: ILAA 70% DHIMIS ALAABTA XILLIGA CUSUB', ar: '⚡ تخفيضات سريعة: خصم حتى 70% على تشكيلة الموسم الجديد' } },
  { text: { en: '📦 FREE EXPRESS SHIPPING ON ORDERS OVER ${threshold}', so: '📦 GAARSIIN DEGDEG AH OO BILAASH AH DALABAADKA KA BADAN ${threshold}', ar: '📦 شحن سريع مجاني للطلبات فوق {threshold} دولار' } },
  { text: { en: '🔥 EXTRA 15% OFF YOUR FIRST ORDER WITH CODE: ABDULL15', so: '🔥 15% DHIMIS DHEERAAD AH DALABKAAGA UGU HORREEYA — KOODHKA: ABDULL15', ar: '🔥 خصم إضافي 15% على طلبك الأول بالرمز: ABDULL15' } },
  { text: { en: '🛡️ 100% AUTHENTIC GUARANTEE & 30-DAY FREE RETURNS', so: '🛡️ 100% ALAAB ASAL AH & SOO CELIN BILAASH AH 30 MAALMOOD', ar: '🛡️ منتجات أصلية 100% وإرجاع مجاني خلال 30 يومًا' } },
];

const DEFAULT_MENU = [
  { label: { en: '⚡ FLASH SALE', so: '⚡ IIB DEGDEG AH', ar: '⚡ تخفيضات سريعة' }, url: '/shop?hasDiscount=true', highlight: true },
  { label: { en: '✨ NEW DROPS', so: '✨ ALAAB CUSUB', ar: '✨ جديدنا' }, url: '/shop?sort=newest' },
  { label: { en: 'All Catalog', so: 'Dhammaan alaabta', ar: 'كل المنتجات' }, url: '/shop' },
];

/** Create the settings document on first use, pre-filled with today's storefront content. */
const loadSettings = async () => {
  if (cached && Date.now() - cachedAt < TTL_MS) return cached;
  let doc = await SiteSettings.findOne({ key: 'main' });
  if (!doc) {
    doc = await SiteSettings.create({
      key: 'main',
      announcements: DEFAULT_ANNOUNCEMENTS,
      menuLinks: DEFAULT_MENU,
    });
  }
  cached = doc.toObject();
  cachedAt = Date.now();
  return cached;
};

const invalidateSettings = () => {
  cached = null;
};

/** Shipping rule shared by cart previews, coupons and order totals. */
const getShippingRules = async () => {
  const s = await loadSettings();
  return { threshold: s.freeShippingThreshold, fee: s.flatShippingFee };
};

const calculateShipping = async (subtotal) => {
  const { threshold, fee } = await getShippingRules();
  return subtotal >= threshold || subtotal === 0 ? 0 : fee;
};

module.exports = { loadSettings, invalidateSettings, getShippingRules, calculateShipping };
