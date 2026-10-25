const mongoose = require('mongoose');

/**
 * Store-wide settings edited from the admin "Site Settings" page.
 * There is a single document (key: 'main'). Shopper-facing text is stored per
 * language ({ en, so, ar }); the storefront falls back to English when a
 * translation is left empty.
 */

const i18nText = (max) =>
  new mongoose.Schema(
    {
      en: { type: String, default: '', trim: true, maxlength: max },
      so: { type: String, default: '', trim: true, maxlength: max },
      ar: { type: String, default: '', trim: true, maxlength: max },
    },
    { _id: false }
  );

// Internal paths ("/shop?sort=newest") or absolute http(s) links only
const safeLink = {
  type: String,
  default: '/shop',
  trim: true,
  maxlength: 300,
  validate: {
    validator: (v) => v === '' || /^\/(?!\/)/.test(v) || /^https?:\/\//i.test(v),
    message: 'Links must start with "/" (a page on this site) or with http:// / https://',
  },
};

const httpsImage = {
  type: String,
  default: '',
  trim: true,
  maxlength: 500,
  validate: {
    validator: (v) => v === '' || /^https?:\/\//i.test(v),
    message: 'Image addresses must start with http:// or https://',
  },
};

const announcementSchema = new mongoose.Schema({
  text: { type: i18nText(140), default: () => ({}) },
  enabled: { type: Boolean, default: true },
});

const menuLinkSchema = new mongoose.Schema({
  label: { type: i18nText(40), default: () => ({}) },
  url: safeLink,
  highlight: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
});

const heroSlideSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  tag: { type: i18nText(60), default: () => ({}) },
  headline: { type: i18nText(60), default: () => ({}) },
  highlight: { type: i18nText(60), default: () => ({}) },
  description: { type: i18nText(240), default: () => ({}) },
  badge: { type: i18nText(40), default: () => ({}) },
  ctaPrimary: { type: i18nText(40), default: () => ({}) },
  linkPrimary: safeLink,
  ctaSecondary: { type: i18nText(40), default: () => ({}) },
  linkSecondary: safeLink,
  accentColor: {
    type: String,
    default: '#2563eb',
    match: [/^#[0-9a-fA-F]{6}$/, 'Accent colour must be a hex value like #2563eb'],
  },
  productName: { type: String, default: '', trim: true, maxlength: 80 },
  productImage: httpsImage,
  productPrice: { type: Number, default: 0, min: 0 },
  productOriginalPrice: { type: Number, default: 0, min: 0 },
  productBadge: { type: i18nText(40), default: () => ({}) },
  productLink: safeLink,
});

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },

    // General
    supportEmail: {
      type: String,
      default: 'support@abdull.com',
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid support email'],
    },

    // Shipping rules (used by the cart, checkout and the server's order totals)
    freeShippingThreshold: { type: Number, default: 100, min: 0, max: 100000 },
    flatShippingFee: { type: Number, default: 15, min: 0, max: 10000 },

    // Announcement bar at the very top of every page
    announcementEnabled: { type: Boolean, default: true },
    announcements: { type: [announcementSchema], default: [] },
    flashSaleEndsAt: { type: Date, default: null },

    // Header menu
    menuLinks: { type: [menuLinkSchema], default: [] },
    showCategoriesInMenu: { type: Boolean, default: true },

    // Homepage hero carousel (empty = built-in default slides)
    heroSlides: { type: [heroSlideSchema], default: [] },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

siteSettingsSchema.path('announcements').validate((v) => v.length <= 10, 'At most 10 announcements');
siteSettingsSchema.path('menuLinks').validate((v) => v.length <= 12, 'At most 12 menu links');
siteSettingsSchema.path('heroSlides').validate((v) => v.length <= 6, 'At most 6 homepage slides');

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
