const SiteSettings = require('../models/SiteSettings');
const { loadSettings, invalidateSettings } = require('../utils/siteSettings');

const EDITABLE_FIELDS = [
  'supportEmail',
  'freeShippingThreshold',
  'flatShippingFee',
  'announcementEnabled',
  'announcements',
  'flashSaleEndsAt',
  'menuLinks',
  'showCategoriesInMenu',
  'heroSlides',
];

// Shopper-facing subset (no audit fields)
const publicView = (s) => ({
  supportEmail: s.supportEmail,
  freeShippingThreshold: s.freeShippingThreshold,
  flatShippingFee: s.flatShippingFee,
  announcementEnabled: s.announcementEnabled,
  announcements: (s.announcements || []).filter((a) => a.enabled !== false),
  flashSaleEndsAt: s.flashSaleEndsAt,
  menuLinks: (s.menuLinks || []).filter((l) => l.enabled !== false),
  showCategoriesInMenu: s.showCategoriesInMenu,
  heroSlides: (s.heroSlides || []).filter((h) => h.enabled !== false),
  updatedAt: s.updatedAt,
});

/**
 * @desc    Storefront settings (menu, announcement bar, hero, shipping rules)
 * @route   GET /api/settings
 * @access  Public
 */
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await loadSettings();
    res.status(200).json({ success: true, data: publicView(settings) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Full settings document for the admin editor
 * @route   GET /api/settings/admin
 * @access  Private/Admin
 */
const getAdminSettings = async (req, res, next) => {
  try {
    await loadSettings(); // makes sure the document exists
    const doc = await SiteSettings.findOne({ key: 'main' }).populate('updatedBy', 'name email');
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update settings (any subset of the editable fields)
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
const updateSettings = async (req, res, next) => {
  try {
    await loadSettings();
    const doc = await SiteSettings.findOne({ key: 'main' });

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) doc[field] = req.body[field];
    }
    if (doc.flashSaleEndsAt === '') doc.flashSaleEndsAt = null;
    doc.updatedBy = req.user._id;

    await doc.save(); // schema validators reject bad links, colours, sizes, etc.
    invalidateSettings();

    res.status(200).json({ success: true, message: 'Site settings saved', data: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
